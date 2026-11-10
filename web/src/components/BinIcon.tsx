import { motion } from 'motion/react';
import { type ReactNode, useState } from 'react';
import type { BinType } from '../../../src/core/types.js';
import { lidPaint } from '../lib.js';

interface BinIconProps {
  type: BinType;
  /** Lid colour as the API names it ("red", "yellow"...). Falls back to the usual one for the type. */
  colour?: string | undefined;
  /** Height in pixels. */
  size?: number;
  /** Accessible name. Leave out when a visible label sits next to the icon. */
  label?: string;
  /** Flip the lid open and shut once on arrival, after this many seconds. */
  greet?: number;
}

/**
 * One drawing for every bin: a wheelie bin whose lid takes the council's
 * colour and whose front carries a mark for the type. Bulky collections have
 * no bin, so they get an armchair.
 */
export function BinIcon({ type, colour, size = 48, label, greet }: BinIconProps) {
  const lid = lidPaint({ type, colour });
  // A phone has no hover, so a tap opens the lid for a moment instead.
  const [tapped, setTapped] = useState<'open' | 'shut'>();
  return (
    <motion.svg
      className="bin-icon"
      viewBox="0 0 64 72"
      height={size}
      width={(size * 64) / 72}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      initial="shut"
      animate={tapped ?? (greet === undefined ? 'shut' : 'greet')}
      whileHover="open"
      onTap={() => {
        setTapped('open');
        setTimeout(() => setTapped('shut'), 900);
      }}
    >
      <ellipse cx="32" cy="67" rx="19" ry="3" className="bin-shadow" />
      {type === 'bulky' ? (
        <Armchair />
      ) : (
        <>
          <circle cx="45" cy="62" r="6" className="bin-wheel" />
          <circle cx="45" cy="62" r="2.2" className="bin-hub" />
          <path d="M15 25H49L45.5 60Q45.2 64 41.5 64H22.5Q18.8 64 18.5 60Z" className="bin-body" />
          <path d="M25 32L26.3 57M39 32L37.7 57" className="bin-ribs" />
          <g transform="translate(32 45)" className="bin-mark">
            {MARKS[type]}
          </g>
          <motion.g
            style={{ originX: 0.93, originY: 1 }}
            variants={{
              shut: { rotate: 0 },
              open: { rotate: 26 },
              greet: {
                rotate: [0, 30, 0],
                transition: { delay: greet ?? 0, duration: 0.7, ease: 'easeInOut' },
              },
            }}
          >
            <path d="M11 27V22Q11 16 17 16H47Q53 16 53 22V27Z" fill={lid} />
            <path d="M10 23H54V25.5Q54 27.5 52 27.5H12Q10 27.5 10 25.5Z" className="bin-lip" />
            <rect x="51.5" y="18" width="6" height="3.4" rx="1.7" fill={lid} />
            <path d="M18 19.6H36" className="bin-shine" />
          </motion.g>
        </>
      )}
    </motion.svg>
  );
}

/** Three chasing arrows, drawn as arcs of one circle with an arrowhead on each. */
function RecyclingMark() {
  const radius = 7.5;
  const sweep = 1.42; // radians of each arc
  return (
    <>
      <circle
        r={radius}
        fill="none"
        strokeWidth="2.4"
        strokeDasharray={`${(radius * sweep).toFixed(2)} ${(radius * ((2 * Math.PI) / 3 - sweep)).toFixed(2)}`}
      />
      {[0, 1, 2].map((arc) => {
        const end = (arc * 2 * Math.PI) / 3 + sweep;
        const [x, y] = [radius * Math.cos(end), radius * Math.sin(end)];
        // Tangent (direction of travel) and normal at the end of the arc.
        const [tx, ty] = [-Math.sin(end), Math.cos(end)];
        const [nx, ny] = [Math.cos(end), Math.sin(end)];
        const points = [
          [x + 3.6 * tx, y + 3.6 * ty],
          [x + 2.9 * nx, y + 2.9 * ny],
          [x - 2.9 * nx, y - 2.9 * ny],
        ];
        return (
          <polygon
            key={arc}
            stroke="none"
            points={points.map((p) => p.map((n) => n.toFixed(2)).join(',')).join(' ')}
          />
        );
      })}
    </>
  );
}

/** What's painted on the front of the bin. General waste and "other" stay plain. */
const MARKS: Partial<Record<BinType, ReactNode>> = {
  recycling: <RecyclingMark />,
  organics: (
    <>
      <path d="M-7 6.5C-8.5-3-1-8.5 8-8.5 8 1 3 8.5-7 6.5Z" stroke="none" />
      <path d="M-5.5 5L3.5-4" className="bin-mark-cut" />
    </>
  ),
  food: (
    <>
      <path d="M0-3C-3-6-8-4-8 1-8 6-4 9.5 0 7.5 4 9.5 8 6 8 1 8-4 3-6 0-3Z" stroke="none" />
      <path d="M0-3.5Q0-7.5 3.5-8.5" fill="none" strokeWidth="1.8" />
    </>
  ),
  glass: (
    <path
      d="M-2.2-9.5H2.2V-4.5Q5-2.5 5 1V7.5Q5 9.5 3 9.5H-3Q-5 9.5-5 7.5V1Q-5-2.5-2.2-4.5Z"
      stroke="none"
    />
  ),
};

function Armchair() {
  return (
    <g className="bin-armchair">
      <rect x="15" y="20" width="34" height="28" rx="8" />
      <rect x="19" y="40" width="26" height="16" rx="4" className="bin-armchair-seat" />
      <rect x="9" y="34" width="11" height="24" rx="5.5" />
      <rect x="44" y="34" width="11" height="24" rx="5.5" />
      <path d="M15 58V64M49 58V64" className="bin-armchair-legs" />
    </g>
  );
}
