import { Anchor, Badge, Group, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import { useInViewport } from '@mantine/hooks';
import { motion } from 'motion/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { councilPath, STATE_NAMES, shortCouncilName } from '../../../src/councils/names.js';
import { type CouncilInfo, type Coverage as CoverageData, getCoverage } from '../api.js';
import { groupByState } from '../lib.js';
import type { CoverageMapProps } from './CoverageMap.js';
import { Outbound } from './Outbound.js';

// The map library is by far the biggest thing on the page, so it loads only when needed.
const CoverageMap = lazy(() => import('./CoverageMap.js'));

interface CoverageProps extends Pick<CoverageMapProps, 'selected' | 'onSelect' | 'pin'> {
  councils: CouncilInfo[];
}

export function Coverage({ councils, selected, onSelect, pin }: CoverageProps) {
  const [filter, setFilter] = useState('');
  const [coverage, setCoverage] = useState<CoverageData>();
  const [mapFailed, setMapFailed] = useState(false);
  // Fetch the boundaries (and the map code) once the section first scrolls into view.
  const { ref, inViewport } = useInViewport();
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);
  useEffect(() => {
    if (seen) getCoverage().then(setCoverage, () => setMapFailed(true));
  }, [seen]);

  const words = filter.trim().toLowerCase();
  const matching = councils.filter((c) => `${c.name} ${c.state}`.toLowerCase().includes(words));
  const chosen = councils.find((c) => c.id === selected);

  return (
    <section id="coverage" className="coverage" ref={ref}>
      <Stack gap={4} mb="lg">
        <Title order={2}>
          {councils.length > 0 ? `${councils.length} councils so far` : 'Supported councils'}
        </Title>
        <Text c="dimmed">
          Bin Day reads each council's own collection calendar. Pick a council to see the area it
          covers.
        </Text>
      </Stack>

      <div className="coverage-grid">
        <div className="coverage-map-frame">
          {mapFailed ? (
            <Text c="dimmed" p="lg">
              The map couldn't be loaded. The list of councils is still complete.
            </Text>
          ) : coverage ? (
            <Suspense fallback={<Skeleton h="100%" radius={0} />}>
              <CoverageMap coverage={coverage} selected={selected} onSelect={onSelect} pin={pin} />
            </Suspense>
          ) : (
            <Skeleton h="100%" radius={0} />
          )}
        </div>

        <Stack gap="md" className="coverage-list">
          <TextInput
            aria-label="Filter councils"
            placeholder="Filter councils"
            radius="xl"
            value={filter}
            onChange={(event) => setFilter(event.currentTarget.value)}
          />
          {chosen && (
            <Text size="sm">
              <Anchor href={councilPath(chosen)} fw={600} inherit>
                {chosen.name}
              </Anchor>
              {chosen.website && (
                <>
                  {' · '}
                  <Outbound href={chosen.website} inherit>
                    Council website
                  </Outbound>
                </>
              )}
            </Text>
          )}
          {groupByState(matching).map(([state, list]) => (
            <div key={state}>
              <Group gap="xs" mb={8}>
                <Text fw={700}>{STATE_NAMES[state]}</Text>
                <Badge variant="light" size="sm">
                  {list.length}
                </Badge>
              </Group>
              <Group gap={6}>
                {list.map((council) => (
                  <motion.button
                    key={council.id}
                    type="button"
                    className="council-chip"
                    aria-pressed={council.id === selected}
                    onClick={() => onSelect(council.id)}
                    whileTap={{ scale: 0.95 }}
                    layout
                  >
                    {shortCouncilName(council.name)}
                  </motion.button>
                ))}
              </Group>
            </div>
          ))}
          {councils.length > 0 && matching.length === 0 && (
            <Text c="dimmed" size="sm">
              No supported council matches “{filter}” yet.
            </Text>
          )}
        </Stack>
      </div>
    </section>
  );
}
