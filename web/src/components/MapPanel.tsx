import { Skeleton, Text } from '@mantine/core';
import { useInViewport } from '@mantine/hooks';
import { lazy, Suspense, useEffect, useState } from 'react';
import { councilPath } from '../../../src/councils/names.js';
import { type Coverage, getCoverage } from '../api.js';
import type { CoverageMapProps } from './CoverageMap.js';

// The map library is by far the biggest thing on the page, so it loads only when needed.
const CoverageMap = lazy(() => import('./CoverageMap.js'));

type MapPanelProps = Pick<CoverageMapProps, 'frame' | 'highlight' | 'pin'>;

/** The coverage map in its frame. Clicking a council's area goes to that council's page. */
export function MapPanel(props: MapPanelProps) {
  const [coverage, setCoverage] = useState<Coverage>();
  const [failed, setFailed] = useState(false);
  // Fetch the boundaries (and the map code) once the map first scrolls into view.
  const { ref, inViewport } = useInViewport();
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);
  useEffect(() => {
    if (seen) getCoverage().then(setCoverage, () => setFailed(true));
  }, [seen]);

  return (
    <div className="coverage-map-frame" ref={ref}>
      {failed ? (
        <Text c="dimmed" p="lg">
          The map couldn't be loaded. Everything else on the page still works.
        </Text>
      ) : coverage ? (
        <Suspense fallback={<Skeleton h="100%" radius={0} />}>
          <CoverageMap
            coverage={coverage}
            onSelect={(id) => window.location.assign(councilPath({ id }))}
            {...props}
          />
        </Suspense>
      ) : (
        <Skeleton h="100%" radius={0} />
      )}
    </div>
  );
}
