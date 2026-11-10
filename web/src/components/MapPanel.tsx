import { Skeleton, Text } from '@mantine/core';
import { useInViewport } from '@mantine/hooks';
import { lazy, Suspense, useEffect, useState } from 'react';
import { councilPath } from '../../../src/councils/names.js';
import { type Coverage, getCoverage, pageData } from '../api.js';
import type { CoverageMapProps } from './CoverageMap.js';

// The map library is by far the biggest thing on the page, so it loads only when needed.
const CoverageMap = lazy(() => import('./CoverageMap.js'));

type MapPanelProps = Pick<CoverageMapProps, 'frame' | 'highlight' | 'pin'>;

/** The coverage map in its frame. Clicking a council's area goes to that council's page. */
export function MapPanel(props: MapPanelProps) {
  const [coverage, setCoverage] = useState<Coverage>();
  const [failed, setFailed] = useState(false);
  // The map is the heaviest thing on the page by far, so it waits until it is on screen
  // and the visitor has shown signs of life (or a few seconds have passed). That keeps
  // the page quick to become usable; the map follows a moment later.
  const { ref, inViewport } = useInViewport();
  const ready = useVisitorActive(5000);
  const [wanted, setWanted] = useState(false);
  useEffect(() => {
    if (inViewport && ready) setWanted(true);
  }, [inViewport, ready]);
  useEffect(() => {
    if (wanted) getCoverage(pageData().councilCount).then(setCoverage, () => setFailed(true));
  }, [wanted]);

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

/** True once the visitor moves, scrolls, taps or types, or after `fallbackMs` at the latest. */
function useVisitorActive(fallbackMs: number): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const events = ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'];
    const activate = () => setActive(true);
    const options = { once: true, passive: true };
    for (const event of events) window.addEventListener(event, activate, options);
    const timer = setTimeout(activate, fallbackMs);
    return () => {
      for (const event of events) window.removeEventListener(event, activate);
      clearTimeout(timer);
    };
  }, [fallbackMs]);
  return active;
}
