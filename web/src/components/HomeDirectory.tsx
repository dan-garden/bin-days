import { Stack, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { STATE_NAMES, shortCouncilName, statePath } from '../../../src/councils/names.js';
import type { CouncilLink } from '../api.js';
import { groupByState } from '../lib.js';
import { CouncilLinks } from './CouncilLinks.js';
import { MapPanel } from './MapPanel.js';

interface HomeDirectoryProps {
  councils: CouncilLink[];
  /** After a lookup the page is about one council, so this shrinks to a list without the map. */
  compact?: boolean;
}

/** The home page's way in to the councils: search for one, or start from a state. */
export function HomeDirectory({ councils, compact }: HomeDirectoryProps) {
  const [query, setQuery] = useState('');
  const words = query.trim().toLowerCase();
  const matches = words
    ? councils.filter((c) => `${c.name} ${STATE_NAMES[c.state]}`.toLowerCase().includes(words))
    : [];
  const states = groupByState(councils);

  return (
    <section id="coverage" className="coverage">
      <Stack gap={4} mb="lg">
        <Title order={2}>
          {compact
            ? 'Looking for somewhere else?'
            : councils.length > 0
              ? `${councils.length} councils across ${states.length} states and territories`
              : 'Supported councils'}
        </Title>
        <Text c="dimmed">
          {compact
            ? `Bin Days covers ${councils.length} councils. Search for one, or start from a state.`
            : 'Find your council for its bin days, or just type your address above.'}
        </Text>
      </Stack>

      <div className={compact ? undefined : 'coverage-grid'}>
        {!compact && <MapPanel />}
        <Stack gap="md">
          <TextInput
            aria-label="Search councils"
            placeholder="Search councils"
            radius="xl"
            size="md"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          {words ? (
            matches.length > 0 ? (
              <CouncilLinks councils={matches.slice(0, 16)} showState />
            ) : (
              <Text c="dimmed" size="sm">
                No supported council matches “{query}” yet.
              </Text>
            )
          ) : (
            <div className="state-grid">
              {states.map(([state, list]) => (
                <a key={state} className="state-card" href={statePath(state)}>
                  <Text fw={700}>{STATE_NAMES[state]}</Text>
                  <Text size="sm" c="dimmed">
                    {list.length === 1
                      ? shortCouncilName(list[0]?.name ?? '')
                      : `${list.length} councils`}
                  </Text>
                </a>
              ))}
            </div>
          )}
        </Stack>
      </div>
    </section>
  );
}
