import { Sparkles } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { Bin as ApiBin } from '../../api.js';
import { lidPaint } from '../../lib.js';
import {
  Bin,
  Ground,
  House,
  type Palette,
  StoryStart,
  Tree,
  Truck,
  useStoryTime,
} from './parts.js';

/**
 * A street of houses with the address's bins in a driveway. When a day is
 * chosen, the bins due that day roll to the kerb and the bin truck pulls up.
 * Loaded only once there's a result to show, so the 3D library never slows the
 * first page load.
 */
export interface StreetBin {
  type: ApiBin['type'];
  name: string;
  colour?: string | undefined;
  /** Rolled out to the kerb on the chosen day. */
  due: boolean;
}

interface StreetSceneProps {
  bins: StreetBin[];
  /** Changes whenever the story should play again (a new address or a new day). */
  play: string;
  night: boolean;
}

const DAY: Palette = {
  ground: '#9fd47e',
  footpath: '#e8e2d8',
  road: '#4a4656',
  roof: '#5b4a6b',
  walls: ['#f4a6a6', '#ffe0a3', '#b9d7f4'],
  window: '#ffcf70',
  windowGlow: 2.2,
  leaves: '#6bbf59',
};
const NIGHT: Palette = {
  ground: '#3c5c48',
  footpath: '#6d6a78',
  road: '#25232f',
  roof: '#2b2438',
  walls: ['#8a5a6a', '#9a8460', '#56708c'],
  window: '#ffd27a',
  windowGlow: 4,
  leaves: '#3e7a45',
};

/** Run when the browser is idle (or soon, where it can't say). */
const idle = (task: () => void) =>
  'requestIdleCallback' in window
    ? requestIdleCallback(task, { timeout: 2000 })
    : setTimeout(task, 300);

const still =
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** From this width the answer card sits over the street's sky (see `.street-caption`). */
export const CAPTION_BESIDE = 1200;

/**
 * Frames the street. On a narrow screen the camera steps back so the whole scene still fits. Where
 * the answer card sits over the street, the picture slides right so the bins and the truck stand
 * clear of the card (see `.street-caption`'s left edge). The truck stops about 440px left of the bins.
 */
function Camera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const far = size.width < 640 ? 1.7 : 1;
    camera.position.set(6.5 * far, 5.2 * far, 9.5 * far);
    camera.lookAt(0, 0.6, 0);
    if (size.width >= CAPTION_BESIDE && 'setViewOffset' in camera) {
      const cardRight = Math.max(20, size.width / 2 - 640) + 384;
      const bins = cardRight + 480;
      camera.setViewOffset(
        size.width,
        size.height,
        size.width / 2 - bins,
        0,
        size.width,
        size.height,
      );
    } else if ('clearViewOffset' in camera) {
      camera.clearViewOffset();
    }
  }, [camera, size.width, size.height]);
  return null;
}

/** Restarts the story when `play` changes, and sparkles at the kerb once the truck arrives. */
function Story({ play, children }: { play: string; children: React.ReactNode }) {
  const start = useRef(0);
  const clock = useThree((state) => state.clock);
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new `play` is what restarts the story.
  useEffect(() => {
    start.current = clock.elapsedTime;
  }, [play, clock]);
  return (
    <StoryStart.Provider value={start}>
      {children}
      <Arrival />
    </StoryStart.Provider>
  );
}

function Arrival() {
  const time = useStoryTime(still);
  const [arrived, setArrived] = useState(still);
  useFrame(({ clock }) => {
    const now = time(clock.elapsedTime) > 3.6;
    if (now !== arrived) setArrived(now);
  });
  return arrived ? (
    <Sparkles
      position={[0, 1.1, 0.9]}
      count={40}
      scale={[2, 1.2, 1]}
      size={4}
      speed={0.6}
      color="#fff2b0"
    />
  ) : null;
}

export default function StreetScene({ bins, play, night }: StreetSceneProps) {
  const palette = night ? NIGHT : DAY;
  const frame = useRef<HTMLDivElement>(null);
  // Only draw while the street is on screen.
  const [visible, setVisible] = useState(true);
  // The story plays the first time the street is seen, not while it's still below the fold.
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!!entry?.isIntersecting);
      // Built when the browser has a moment, so it never holds up the page loading.
      if (entry?.isIntersecting) idle(() => setSeen(true));
    });
    if (frame.current) observer.observe(frame.current);
    return () => observer.disconnect();
  }, []);
  const shown = bins.slice(0, 4);
  const spacing = 0.6;
  return (
    <div ref={frame} className="street-canvas">
      {seen && (
        <Canvas
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ fov: 30, position: [6.5, 5.2, 9.5] }}
          frameloop={visible && !still ? 'always' : 'demand'}
        >
          <Camera />
          <fog attach="fog" args={[night ? '#1a2142' : '#f6cdc6', 16, 34]} />
          <hemisphereLight
            args={night ? ['#7d8cd0', '#1a1f38', 1.1] : ['#fff1e0', '#8a7bb0', 0.9]}
          />
          <directionalLight
            position={[-6, 9, 6]}
            intensity={night ? 1.4 : 2.2}
            color={night ? '#a9b8ff' : '#ffd9b0'}
          />
          <directionalLight
            position={[6, 3, -6]}
            intensity={night ? 0.3 : 0.6}
            color={night ? '#6f7cc8' : '#c9b6f2'}
          />
          <Story play={play}>
            <Ground palette={palette} />
            {palette.walls.map((wall, i) => (
              <House key={wall} x={(i - 1) * 4.2} wall={wall} palette={palette} />
            ))}
            <Tree x={-6.6} z={-1.2} scale={1.2} leaves={palette.leaves} />
            <Tree x={2.2} z={-1.6} leaves={palette.leaves} />
            <Tree x={6.7} z={-1} scale={1.1} leaves={palette.leaves} />
            {shown.map((bin, i) => (
              <Bin
                key={bin.name}
                x={(i - (shown.length - 1) / 2) * spacing}
                lid={lidPaint(bin)}
                due={bin.due}
                delay={0.2 + i * 0.15}
                still={still}
              />
            ))}
            <Truck still={still} night={night} />
          </Story>
          <Sparkles
            count={night ? 120 : 60}
            scale={[18, night ? 8 : 4, 8]}
            position={[0, night ? 4 : 2.5, -1]}
            size={night ? 2 : 2.5}
            speed={0.25}
            color={night ? '#dfe6ff' : '#fff6d5'}
            opacity={0.7}
          />
        </Canvas>
      )}
    </div>
  );
}
