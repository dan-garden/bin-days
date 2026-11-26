import type { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { normaliseState } from '../core/address.js';
import { BinDaysError } from '../core/errors.js';
import { binStats } from '../councils/stats.js';
import type { BinDaysService } from '../service.js';
import { CollectionsQuery, CouncilsQuery, schema } from './openapi.js';

/**
 * A Model Context Protocol server at `/mcp`, so an AI assistant can answer "which bins go out at
 * my address?" by asking Bin Days directly. It speaks MCP's Streamable HTTP transport statelessly:
 * each POST is one JSON-RPC message and gets one JSON reply, with no session to keep. The tools are
 * the public API's lookups, checked with the same schemas.
 */

const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

interface Tool {
  description: string;
  input: z.ZodObject;
  run: (input: never) => Promise<unknown> | unknown;
}

const DaysInput = CollectionsQuery.pick({ address: true, date: true, from: true, to: true });

function tools(service: BinDaysService): Record<string, Tool> {
  return {
    get_bin_days: {
      description:
        "Which household bins go out, and on which days, for a street address in Australia, straight from the address's council. Gives the next collection, each collection day in the range (the next two weeks by default) and each bin's lid colour and how often it is collected.",
      input: DaysInput,
      run: ({ address, date, from, to }: z.infer<typeof DaysInput>) =>
        service.lookup({
          address,
          ...(date ? { date } : {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        }),
    },
    list_councils: {
      description:
        'The Australian councils Bin Days covers, optionally for one state (e.g. "QLD"). An address in any other council is not supported yet.',
      input: CouncilsQuery,
      run: ({ state }: z.infer<typeof CouncilsQuery>) => {
        const normalised = normaliseState(state);
        return { councils: service.registry.list(normalised ? { state: normalised } : {}) };
      },
    },
    get_bin_statistics: {
      description:
        'How often Australian councils collect general waste, recycling, organics and glass, their lid colours, and which take food scraps (FOGO), overall and by state.',
      input: z.object({}),
      run: () => binStats(service.registry.list()),
    },
  };
}

type Id = string | number | null;
const reply = (id: Id, result: unknown) => ({ jsonrpc: '2.0', id, result });
const failure = (id: Id, code: number, message: string) => ({
  jsonrpc: '2.0',
  id,
  error: { code, message },
});

/** A tool's answer: the data for the model, as text and as structured content. */
const answer = (data: unknown, isError = false) => ({
  content: [{ type: 'text', text: JSON.stringify(data) }],
  ...(isError ? { isError } : { structuredContent: data }),
});

export function addMcpRoutes(app: Hono, service: BinDaysService): void {
  const available = tools(service);
  app.use('/mcp', cors({ origin: '*', exposeHeaders: ['mcp-protocol-version'] }));
  // Stateless: nothing to stream back to, and no session to end.
  app.on(['GET', 'DELETE'], '/mcp', (c) => c.body(null, 405, { allow: 'POST' }));
  app.post('/mcp', async (c) => {
    const message = await c.req.json().catch(() => undefined);
    if (!message || typeof message !== 'object' || Array.isArray(message))
      return c.json(failure(null, -32600, 'Send one JSON-RPC request per POST.'), 400);
    const { id, method, params } = message as {
      id?: Id;
      method?: string;
      params?: { protocolVersion?: string; name?: string; arguments?: unknown };
    };
    // A notification (no id) needs no answer.
    if (id === undefined) return c.body(null, 202);
    switch (method) {
      case 'initialize': {
        const asked = params?.protocolVersion;
        return c.json(
          reply(id, {
            protocolVersion:
              asked && PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[1],
            capabilities: { tools: {} },
            serverInfo: { name: 'bin-days', title: 'Bin Days', version: '1' },
            instructions:
              'Use get_bin_days to answer when bin day is, or which bins go out, for an Australian street address. Dates marked "projected" are worked out from the regular cycle, so a public holiday can move them.',
          }),
        );
      }
      case 'ping':
        return c.json(reply(id, {}));
      case 'tools/list':
        return c.json(
          reply(id, {
            tools: Object.entries(available).map(([name, tool]) => ({
              name,
              description: tool.description,
              inputSchema: schema(tool.input),
              annotations: { readOnlyHint: true, openWorldHint: true },
            })),
          }),
        );
      case 'tools/call': {
        const tool = available[params?.name ?? ''];
        if (!tool) return c.json(failure(id, -32602, `Unknown tool: ${params?.name}`));
        const input = tool.input.safeParse(params?.arguments ?? {});
        if (!input.success)
          return c.json(
            reply(id, answer({ error: input.error.issues.map((i) => i.message).join('; ') }, true)),
          );
        try {
          return c.json(reply(id, answer(await tool.run(input.data as never))));
        } catch (error) {
          // The model can act on these: try another address, or say the council isn't covered.
          if (error instanceof BinDaysError)
            return c.json(
              reply(
                id,
                answer({ code: error.code, message: error.message, ...error.details }, true),
              ),
            );
          throw error;
        }
      }
      default:
        return c.json(failure(id, -32601, `Unknown method: ${method}`));
    }
  });
}
