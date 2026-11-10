import { describe, expect, it } from 'vitest';
import { parseAustralianAddress } from '../../src/core/address.js';
import { createIntraMapsCouncil, parsePanelDate } from '../../src/platforms/intramaps.js';
import { ctx, d, fakeHttp, json } from '../helpers.js';

describe('IntraMaps panel dates', () => {
  // Each of these wordings is what a real council's panel returned on 2026-11-10 (a Tuesday).
  const today = d('2026-11-10');
  it.each([
    ['Friday, 13 November 2026', undefined, '2026-11-13'],
    ['Fortnightly on Thursday, Next: 19 Nov 2026', 14, '2026-11-19'],
    ['Monday - 16 November 2026', undefined, '2026-11-16'],
    ['next Friday - 20 Nov 2026', 14, '2026-11-20'],
    ['Collected fortnightly Wednesday 18 November 2026', 14, '2026-11-18'],
    ['Every Monday', 7, '2026-11-16'],
    ['Weekly on Thursdays', 7, '2026-11-12'],
    ['Friday This Week', 14, '2026-11-13'],
    ['MondayThis Week', 14, '2026-11-09'],
    ['Tuesday Next Week', 14, '2026-11-17'],
    // A bare weekday doesn't say which week for a fortnightly bin.
    ['Thursday', 14, undefined],
    ['FOGO transition period scheduled to start Summer 2028.', undefined, undefined],
    ['', 7, undefined],
  ])('%s', (text, everyDays, expected) => {
    expect(parsePanelDate(text, today, everyDays)).toBe(expected);
  });
});

describe('IntraMaps adapter', () => {
  const council = createIntraMapsCouncil({
    id: 'wa/test',
    name: 'Test City',
    state: 'WA',
    lgaCodes: ['59999'],
    timezone: 'Australia/Perth',
    baseUrl: 'https://maps.test',
    instance: 'spatial/intramaps',
    project: 'project-1',
    bins: [
      { field: 'Waste (Red Lid)', type: 'general', name: 'General waste' },
      { field: 'Recycle (Yellow Lid)', type: 'recycling', name: 'Recycling' },
      { field: 'Refuse Day', type: 'organics', name: 'Organics', everyDays: 7 },
      { field: 'Missing', type: 'glass', name: 'Glass' },
    ],
  });

  const panel = (fields: Record<string, string>) => ({
    infoPanels: {
      info1: {
        feature: {
          fields: Object.entries(fields).map(([name, value]) => ({ name, value: { value } })),
        },
      },
      info2: null,
    },
  });

  function setup() {
    return fakeHttp((url, init) => {
      const step = url.pathname.replace('/spatial/intramaps/ApplicationEngine', '');
      if (step === '/Projects/') {
        return new Response(JSON.stringify({ moduleList: [{ id: 'module-1' }] }), {
          headers: { 'x-intramaps-session': 'session-1', 'content-type': 'application/json' },
        });
      }
      expect(url.searchParams.get('IntraMapsSession')).toBe('session-1');
      if (step === '/Modules/') {
        return json({ forms: [{ name: 'Address', subType: 'FullText', templateId: 'form-1' }] });
      }
      if (step === '/Search/') {
        expect(JSON.parse(String(init?.body))).toEqual({ fields: ['59 Makybe Drive Baldivis'] });
        return json({
          fullText: [
            { displayValue: '5 Makybe Drive BALDIVIS', dbKey: '1', mapKey: 'a' },
            { displayValue: '59 Makybe Drive BALDIVIS', dbKey: '2', mapKey: 'b' },
          ],
        });
      }
      if (step === '/Search/Refine/Set') {
        expect(JSON.parse(String(init?.body))).toMatchObject({ dbKey: '2', mapKey: 'b' });
        return json(
          panel({
            'Waste (Red Lid)': 'Collected fortnightly Wednesday 11 November 2026',
            'Recycle (Yellow Lid)': '<b>Friday, 20 November 2026</b>',
            'Refuse Day': 'Friday',
          }),
        );
      }
    });
  }

  const address = (input: string) => ({ input, parts: parseAustralianAddress(input) });

  it('opens a session, finds the property and reads its bins', async () => {
    const http = setup();
    const schedule = await council.getSchedule(
      address('59 Makybe Dr, Baldivis WA 6171'),
      ctx(http),
    );
    expect(http.calls).toHaveLength(4);
    expect(schedule.matchedAddress).toBe('59 Makybe Drive BALDIVIS');
    expect(schedule.services.map((s) => [s.type, s.recurrence])).toEqual([
      // The council's own wording gives the cycle.
      ['general', { kind: 'interval', everyDays: 14, anchor: '2026-11-11' }],
      // No cycle known: just the date the council gave.
      ['recycling', { kind: 'dates', dates: ['2026-11-20'] }],
      // A weekday plus the configured weekly cycle.
      ['organics', { kind: 'interval', everyDays: 7, anchor: '2026-11-13' }],
    ]);
  });

  it('reports an address it cannot match', async () => {
    await expect(
      council.getSchedule(address('7 Makybe Dr, Baldivis WA'), ctx(setupNoMatch())),
    ).rejects.toMatchObject({ code: 'ADDRESS_NOT_FOUND' });
  });

  function setupNoMatch() {
    return fakeHttp((url) => {
      if (url.pathname.endsWith('/Projects/')) {
        return new Response('{"moduleList":[{"id":"m"}]}', {
          headers: { 'x-intramaps-session': 's' },
        });
      }
      if (url.pathname.endsWith('/Modules/')) {
        return json({ forms: [{ subType: 'FullText', templateId: 'f' }] });
      }
      return json({ fullText: [{ displayValue: '59 Makybe Drive BALDIVIS', dbKey: '2' }] });
    });
  }
});
