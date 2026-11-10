import { Anchor, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import type { AustralianState } from '../../../src/core/types.js';
import { STATE_NAMES, shortCouncilName, statePath } from '../../../src/councils/names.js';
import type { CouncilInfo } from '../api.js';
import { groupByState } from '../lib.js';
import { CouncilLinks } from './CouncilLinks.js';
import { MapPanel } from './MapPanel.js';

interface StateDirectoryProps {
  state: AustralianState;
  councils: CouncilInfo[];
  /** The council of the address just looked up, outlined on the map. */
  highlight?: string | undefined;
  pin?: { latitude: number; longitude: number } | undefined;
}

/** A state's page: its councils as links, beside a map of where they are. */
export function StateDirectory({ state, councils, highlight, pin }: StateDirectoryProps) {
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<string>();
  const inState = councils.filter((c) => c.state === state);
  const words = query.trim().toLowerCase();
  const shown = inState
    .filter((c) => c.name.toLowerCase().includes(words))
    .sort((a, b) => shortCouncilName(a.name).localeCompare(shortCouncilName(b.name)));
  const otherStates = groupByState(councils).filter(([other]) => other !== state);

  return (
    <section id="coverage" className="coverage">
      <Stack gap={4} mb="lg">
        <Title order={2}>Councils in {STATE_NAMES[state]}</Title>
        <Text c="dimmed">
          {inState.length === 1 ? 'One council' : `${inState.length} councils`} so far. Pick yours
          for its bin days.
        </Text>
      </Stack>

      <div className="coverage-grid">
        <MapPanel frame={inState.map((c) => c.id)} highlight={hovered ?? highlight} pin={pin} />
        <Stack gap="md">
          {inState.length > 12 && (
            <TextInput
              aria-label={`Search councils in ${STATE_NAMES[state]}`}
              placeholder="Search councils"
              radius="xl"
              size="md"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          )}
          {shown.length > 0 ? (
            <CouncilLinks councils={shown} onHover={setHovered} />
          ) : (
            <Text c="dimmed" size="sm">
              No supported council in {STATE_NAMES[state]} matches “{query}” yet.
            </Text>
          )}
          {otherStates.length > 0 && (
            <Group gap="sm" className="other-states">
              <Text size="sm" c="dimmed">
                Other states:
              </Text>
              {otherStates.map(([other]) => (
                <Anchor key={other} href={statePath(other)} size="sm">
                  {STATE_NAMES[other]}
                </Anchor>
              ))}
            </Group>
          )}
        </Stack>
      </div>
    </section>
  );
}
