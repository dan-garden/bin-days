import {
  Anchor,
  Badge,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
} from '@mantine/core';
import { m } from 'motion/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { Bin, BinDaysResult, CollectionDay, ServiceSummary } from '../api.js';
import { daysUntil, formatDate, lidPaint, lidStripe, relativeDay, tidyAddress } from '../lib.js';
import { canDraw3d } from '../webgl.js';
import { BinIcon } from './BinIcon.js';
import { SaveAndShare } from './SaveAndShare.js';
import { ServiceChip } from './ServiceChip.js';
import { WEEK, WeekStrip } from './WeekStrip.js';

// The 3D street and its library load only once there's a result, and only where they can be drawn.
const StreetScene = lazy(() => import('./street/StreetScene.js'));

/** Bins that go out at the kerb; the street has no room for hard waste and the like. */
const KERBSIDE = new Set(['general', 'recycling', 'organics', 'food', 'glass']);

const PROJECTED = 'Estimated from the regular cycle. Public holidays can shift it.';

/** Children rise in one after another. */
const stagger = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rise = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
} as const;

export function Result({ result, onShown }: { result: BinDaysResult; onShown?: () => void }) {
  // Lets the page add what goes below the answer only once the answer is on screen.
  // biome-ignore lint/correctness/useExhaustiveDependencies: once, when first shown.
  useEffect(() => onShown?.(), []);
  const { next, today, council, address } = result;
  // biome-ignore lint/correctness/useExhaustiveDependencies: once, when first shown.
  useEffect(() => {
    if (next?.date === today)
      import('../secrets/index.js').then((secrets) => secrets.play('binday'));
  }, []);
  // The day the street shows: the next collection, until another is chosen in the week.
  const [selected, setSelected] = useState<string>(next?.date ?? today);
  const chosen = result.days.find((day) => day.date === selected) ?? next;
  const later = result.days.filter((day) => daysUntil(day.date, today) >= WEEK);
  const estimated = result.days.some((day) => day.bins.some((b) => b.confidence === 'projected'));
  const night = useComputedColorScheme('light') === 'dark';
  const street = result.services
    .filter((service) => KERBSIDE.has(service.type))
    .map((service) => ({
      type: service.type,
      name: service.name,
      colour: service.colour,
      due: !!chosen?.bins.some((bin) => bin.name === service.name),
    }));

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="shown"
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <Stack gap="lg">
        <m.div variants={rise}>
          {next && chosen && canDraw3d() ? (
            <Paper
              className="next-card street-card"
              radius="lg"
              style={{ '--lids': lidStripe(chosen.bins) }}
            >
              {/* First, so a phone shows the answer before the picture. */}
              <StreetCaption
                day={chosen}
                today={today}
                isNext={chosen.date === next.date}
                place={<Place address={address.matched} council={council.name} />}
              />
              <Suspense fallback={<div className="street-canvas" />}>
                <StreetScene
                  bins={street}
                  play={`${address.matched}|${chosen.date}`}
                  night={night}
                />
              </Suspense>
            </Paper>
          ) : (
            <Paper
              className="next-card"
              radius="lg"
              p={{ base: 'lg', sm: 'xl' }}
              style={{ '--lids': lidStripe(next?.bins ?? []) }}
            >
              <Place address={address.matched} council={council.name} />
              {next ? (
                <NextCollection day={next} today={today} />
              ) : (
                <Title order={2}>No upcoming collections found</Title>
              )}
            </Paper>
          )}
        </m.div>

        {next && (
          <m.div variants={rise}>
            <WeekStrip
              days={result.days}
              today={today}
              selected={selected}
              onSelect={setSelected}
            />
          </m.div>
        )}

        {later.length > 0 && (
          <m.div variants={rise}>
            <Stack gap="xs">
              <Title order={3} size="h4">
                After that
              </Title>
              <m.ol className="timeline" variants={stagger}>
                {later.map((day) => (
                  <m.li key={day.date} variants={rise}>
                    <DayRow day={day} today={today} />
                  </m.li>
                ))}
              </m.ol>
            </Stack>
          </m.div>
        )}

        <m.div variants={rise}>
          <Stack gap="xs">
            <Title order={3} size="h4">
              Your bins
            </Title>
            <Group gap="sm">
              {result.services.map((service) => (
                <NotedServiceChip key={service.name} service={service} />
              ))}
            </Group>
            {estimated && (
              <Text c="dimmed" size="xs">
                “est.” dates are worked out from the regular cycle, so public holidays can shift
                them.
              </Text>
            )}
          </Stack>
        </m.div>

        <m.div variants={rise}>
          <SaveAndShare address={address.input} />
        </m.div>
      </Stack>
    </m.div>
  );
}

/** What the street shows, in words: over the scene's sky, and all a screen reader needs. */
function StreetCaption({
  day,
  today,
  isNext,
  place,
}: {
  day: CollectionDay;
  today: string;
  isNext: boolean;
  place: React.ReactNode;
}) {
  const nudge = daysUntil(day.date, today) === 1 ? 'Put them out tonight.' : undefined;
  return (
    <div className="street-caption" aria-live="polite">
      <Text className="eyebrow">{isNext ? 'Next collection' : 'Collection'}</Text>
      <Title order={2} className="next-when">
        {relativeDay(day.date, today)}
      </Title>
      <Text size="lg" fw={600}>
        {formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long' })}
        {nudge && <Text span c="dimmed">{` · ${nudge}`}</Text>}
      </Text>
      <Group gap={6} mt={8}>
        {day.bins.map((bin) => (
          <span
            key={bin.name}
            className="caption-bin"
            style={{ '--lid': lidPaint(bin) } as React.CSSProperties}
          >
            {bin.name}
            {bin.confidence === 'projected' && <Estimated />}
          </span>
        ))}
      </Group>
      {place}
    </div>
  );
}

/**
 * Which property, and which council, the answer is for, as the council knows them. Worth showing:
 * it's how a visitor spots that a street of the same name elsewhere was matched.
 */
function Place({ address, council }: { address: string; council: string }) {
  return (
    <Text className="place" size="sm" c="dimmed">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11Z" />
        <circle cx="12" cy="10" r="2.3" />
      </svg>
      <span>
        {tidyAddress(address)} ·{' '}
        <Anchor href="#area" inherit>
          {council}
        </Anchor>
      </span>
    </Text>
  );
}

function NextCollection({ day, today }: { day: CollectionDay; today: string }) {
  const nudge = daysUntil(day.date, today) === 1 ? 'Put them out tonight.' : undefined;
  return (
    <Group justify="space-between" align="flex-end" gap="xl">
      <div>
        <Text className="eyebrow">Next collection</Text>
        <Title order={2} className="next-when">
          {relativeDay(day.date, today)}
        </Title>
        <Text size="lg">
          {formatDate(day.date, { weekday: 'long', day: 'numeric', month: 'long' })}
          {nudge && <Text span c="dimmed">{` · ${nudge}`}</Text>}
        </Text>
      </div>
      <Group gap="lg" align="flex-start" wrap="wrap">
        {day.bins.map((bin, index) => (
          <Stack
            key={bin.name}
            gap={4}
            align="center"
            className="next-bin"
            style={{ '--lid': lidPaint(bin) }}
          >
            <BinIcon type={bin.type} colour={bin.colour} size={96} greet={0.5 + index * 0.18} />
            <Text size="sm" fw={600} ta="center">
              {bin.name}
            </Text>
            {bin.confidence === 'projected' && <Estimated />}
          </Stack>
        ))}
      </Group>
    </Group>
  );
}

function DayRow({ day, today }: { day: CollectionDay; today: string }) {
  return (
    <div
      className="day-row"
      style={{ '--lids': lidStripe(day.bins, '180deg') } as React.CSSProperties}
    >
      <div className="day-date">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed">
          {formatDate(day.date, { weekday: 'short' })}
        </Text>
        <Text className="day-number">{formatDate(day.date, { day: 'numeric' })}</Text>
        <Text size="xs" c="dimmed">
          {formatDate(day.date, { month: 'short' })}
        </Text>
      </div>
      <div className="day-bins">
        <Text size="sm" c="dimmed">
          {relativeDay(day.date, today)}
        </Text>
        <Group gap="md">
          {day.bins.map((bin) => (
            <BinChip key={bin.name} bin={bin} />
          ))}
        </Group>
      </div>
    </div>
  );
}

function BinChip({ bin }: { bin: Bin }) {
  return (
    <Group gap={6} wrap="nowrap">
      <BinIcon type={bin.type} colour={bin.colour} size={34} />
      <Text size="sm" fw={500}>
        {bin.name}
      </Text>
      {bin.confidence === 'projected' && <Estimated />}
    </Group>
  );
}

function Estimated() {
  return (
    <Tooltip
      label={PROJECTED}
      multiline
      w={220}
      withArrow
      events={{ hover: true, focus: true, touch: true }}
    >
      <Badge variant="default" size="xs" tabIndex={0} className="estimated">
        est.
      </Badge>
    </Tooltip>
  );
}

/** A bin and how often it goes, with the council's note about it if there is one. */
function NotedServiceChip({ service }: { service: ServiceSummary }) {
  const chip = <ServiceChip service={service} />;
  return service.notes ? (
    <Tooltip label={service.notes} multiline w={220} withArrow>
      <div>{chip}</div>
    </Tooltip>
  ) : (
    chip
  );
}
