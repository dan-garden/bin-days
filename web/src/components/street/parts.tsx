// biome-ignore-all lint/a11y/noStaticElementInteractions: these are three.js objects, not DOM elements; the taps are bonus extras.
import { Float, RoundedBox } from '@react-three/drei';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { createContext, useContext, useRef, useState } from 'react';
import { CanvasTexture, type Group, type Mesh, type MeshStandardMaterial } from 'three';
import type { SecretId } from '../../secrets/catalogue.js';
import { play } from '../../secrets/index.js';

/** The pieces of the street: houses, trees, bins, the truck and the ground. */

/** When the current story started, in the scene clock's seconds. Everything plays off it. */
export const StoryStart = createContext<{ current: number }>({ current: 0 });

/** Seconds since the story started; in reduced motion, a time after everything has finished. */
export function useStoryTime(still: boolean) {
  const start = useContext(StoryStart);
  return (elapsed: number) => (still ? 99 : elapsed - start.current);
}

/**
 * A soft round shadow under something standing on the ground. Much cheaper than real-time
 * shadows, which cost the first load a second or more on a phone.
 */
let blob: CanvasTexture | undefined;
function blobTexture() {
  if (!blob) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const paint = canvas.getContext('2d');
    if (paint) {
      const fade = paint.createRadialGradient(32, 32, 0, 32, 32, 32);
      fade.addColorStop(0, 'rgba(0,0,0,0.55)');
      fade.addColorStop(1, 'rgba(0,0,0,0)');
      paint.fillStyle = fade;
      paint.fillRect(0, 0, 64, 64);
    }
    blob = new CanvasTexture(canvas);
  }
  return blob;
}

export function Shadow({
  width,
  depth,
  x = 0,
  z = 0,
}: {
  width: number;
  depth: number;
  x?: number;
  z?: number;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]} renderOrder={1}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial map={blobTexture()} transparent depthWrite={false} />
    </mesh>
  );
}

/** A tap on something in the street plays its secret where the tap landed. */
function secret(id: SecretId) {
  return (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    play(id, { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY });
  };
}

/** A poke that dies away over about half a second: 1 when tapped, down to 0. */
function usePoke() {
  const poke = useRef(0);
  useFrame((_, delta) => {
    poke.current = Math.max(0, poke.current - delta * 1.8);
  });
  return poke;
}

export const ease = (t: number) => 1 - (1 - Math.min(Math.max(t, 0), 1)) ** 3;

/** Colours that change between day and night. */
export interface Palette {
  ground: string;
  footpath: string;
  road: string;
  roof: string;
  walls: [string, string, string];
  window: string;
  windowGlow: number;
  leaves: string;
}

export function House({ x, wall, palette }: { x: number; wall: string; palette: Palette }) {
  // Tapping a house switches its lights off, and on again.
  const [dark, setDark] = useState(false);
  const lights = secret('lights');
  return (
    <group
      position={[x, 0, -2.6]}
      onClick={(event) => {
        setDark(!dark);
        lights(event);
      }}
    >
      <Shadow width={3.2} depth={2.8} />
      <RoundedBox args={[2.2, 1.6, 1.8]} radius={0.08} position={[0, 0.8, 0]}>
        <meshStandardMaterial color={wall} roughness={0.8} />
      </RoundedBox>
      <mesh position={[0, 2.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.75, 0.95, 4]} />
        <meshStandardMaterial color={palette.roof} roughness={0.7} />
      </mesh>
      {[-0.55, 0.55].map((wx) => (
        <mesh key={wx} position={[wx, 0.95, 0.91]}>
          <planeGeometry args={[0.45, 0.42]} />
          <meshStandardMaterial
            color={dark ? '#3d3a4a' : palette.window}
            emissive={palette.window}
            emissiveIntensity={dark ? 0 : palette.windowGlow}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.4, 0.91]}>
        <planeGeometry args={[0.4, 0.8]} />
        <meshStandardMaterial color="#6d4c41" />
      </mesh>
    </group>
  );
}

export function Tree({
  x,
  z,
  scale = 1,
  leaves,
}: {
  x: number;
  z: number;
  scale?: number;
  leaves: string;
}) {
  return (
    <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
      <group position={[x, 0, z]} scale={scale} onClick={secret('koala')}>
        <Shadow width={1.6} depth={1.6} />
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.08, 0.11, 0.9]} />
          <meshStandardMaterial color="#7a5c48" />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <icosahedronGeometry args={[0.55, 1]} />
          <meshStandardMaterial color={leaves} flatShading roughness={0.9} />
        </mesh>
      </group>
    </Float>
  );
}

/** A wheelie bin. A bin that's due rolls from the driveway to the kerb, then pops its lid. */
export function Bin({
  x,
  lid,
  due,
  delay,
  still,
}: {
  x: number;
  lid: string;
  due: boolean;
  delay: number;
  still: boolean;
}) {
  const body = useRef<Group>(null);
  const hinge = useRef<Group>(null);
  const paint = useRef<MeshStandardMaterial>(null);
  const time = useStoryTime(still);
  // Tapped, the lid flips open and the flies get out.
  const poke = usePoke();
  const flies = secret('flies');
  useFrame(({ clock }) => {
    const t = time(clock.elapsedTime);
    const out = due ? ease((t - delay) / 0.9) : 0;
    if (!body.current || !hinge.current || !paint.current) return;
    body.current.position.z = -1.3 + out * 2.15;
    body.current.position.y = Math.sin(out * Math.PI) * 0.12;
    const pop = Math.sin(Math.min(Math.max((t - delay - 1) / 0.45, 0), 1) * Math.PI);
    const flip = Math.sin(poke.current * Math.PI) * 1.4;
    hinge.current.rotation.x = -Math.max(due ? Math.max(0, pop) * 0.9 : 0, flip);
    paint.current.emissiveIntensity = due && t > delay + 1 ? 0.35 : 0;
  });
  return (
    <group
      ref={body}
      position={[x, 0, -1.3]}
      onClick={(event) => {
        poke.current = 1;
        flies(event);
      }}
    >
      <Shadow width={0.8} depth={0.8} />
      <RoundedBox args={[0.48, 0.66, 0.5]} radius={0.05} position={[0, 0.38, 0]}>
        <meshStandardMaterial color="#3a3f4a" roughness={0.5} />
      </RoundedBox>
      <group ref={hinge} position={[0, 0.72, -0.26]}>
        <RoundedBox args={[0.54, 0.08, 0.56]} radius={0.03} position={[0, 0, 0.26]}>
          <meshStandardMaterial ref={paint} color={lid} emissive={lid} roughness={0.35} />
        </RoundedBox>
      </group>
      {[-0.18, 0.18].map((wx) => (
        <mesh key={wx} position={[wx, 0.07, -0.22]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
}

/** The bin truck drives in from the left and pulls up just short of the bins. */
export function Truck({ still, night }: { still: boolean; night: boolean }) {
  const truck = useRef<Group>(null);
  const wheels = useRef<Array<Mesh | null>>([]);
  const time = useStoryTime(still);
  // Tapped, it honks and hops.
  const poke = usePoke();
  const honk = secret('truck');
  useFrame(({ clock }) => {
    const t = time(clock.elapsedTime);
    const p = ease((t - 1.1) / 2.6);
    const x = -12 + p * 8.4;
    if (!truck.current) return;
    truck.current.position.x = x;
    truck.current.position.y =
      (p < 1 ? Math.abs(Math.sin(t * 18)) * 0.015 : 0) + Math.sin(poke.current * Math.PI) * 0.3;
    for (const wheel of wheels.current) if (wheel) wheel.rotation.y = -x / 0.32;
  });
  return (
    <group
      ref={truck}
      position={[-12, 0, 2.2]}
      onClick={(event) => {
        poke.current = 1;
        honk(event);
      }}
    >
      <Shadow width={4.4} depth={2} x={0.1} />
      <RoundedBox args={[2.6, 1.25, 1.2]} radius={0.12} position={[-0.35, 0.95, 0]}>
        <meshStandardMaterial color="#2f9e44" roughness={0.35} metalness={0.1} />
      </RoundedBox>
      <mesh position={[-0.35, 1.3, 0.61]}>
        <planeGeometry args={[2.2, 0.16]} />
        <meshStandardMaterial color="#fcc419" emissive="#fcc419" emissiveIntensity={0.5} />
      </mesh>
      <RoundedBox args={[0.95, 1, 1.15]} radius={0.12} position={[1.45, 0.82, 0]}>
        <meshStandardMaterial color="#2b8a3e" roughness={0.35} />
      </RoundedBox>
      <mesh position={[1.93, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.95, 0.42]} />
        <meshStandardMaterial color="#cfe8ff" roughness={0.05} metalness={0.4} />
      </mesh>
      {[0.42, -0.42].map((z) => (
        <mesh key={z} position={[1.94, 0.5, z]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#fff4c2"
            emissive="#ffe08a"
            emissiveIntensity={night ? 6 : 3}
            toneMapped={false}
          />
        </mesh>
      ))}
      {(
        [
          [-1.2, 0.6],
          [-1.2, -0.6],
          [1.3, 0.6],
          [1.3, -0.6],
        ] as const
      ).map(([x, z], i) => (
        <group key={`${x}${z}`} position={[x, 0.32, z]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh
            ref={(wheel) => {
              wheels.current[i] = wheel;
            }}
          >
            <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
            <meshStandardMaterial color="#1d1a1f" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function Ground({ palette }: { palette: Palette }) {
  const flat = [-Math.PI / 2, 0, 0] as const;
  return (
    <group>
      <mesh rotation={flat}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color={palette.ground} />
      </mesh>
      <mesh rotation={flat} position={[0, 0.01, 1.05]}>
        <planeGeometry args={[200, 0.7]} />
        <meshStandardMaterial color={palette.footpath} />
      </mesh>
      <mesh rotation={flat} position={[0, 0.012, 2.6]}>
        <planeGeometry args={[200, 2.4]} />
        <meshStandardMaterial color={palette.road} roughness={0.9} />
      </mesh>
      {Array.from({ length: 40 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed row of road markings.
        <mesh key={i} rotation={flat} position={[-80 + i * 4, 0.014, 2.6]}>
          <planeGeometry args={[1.6, 0.08]} />
          <meshStandardMaterial color="#fcc419" emissive="#fcc419" emissiveIntensity={0.3} />
        </mesh>
      ))}
      <mesh rotation={flat} position={[0, 0.011, -0.4]}>
        <planeGeometry args={[1.4, 2.2]} />
        <meshStandardMaterial color={palette.footpath} />
      </mesh>
    </group>
  );
}
