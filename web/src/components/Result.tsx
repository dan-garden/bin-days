import { Anchor, Badge, Group, Paper, Stack, Text, Title, Tooltip } from '@mantine/core';
import { motion } from 'motion/react';
import { councilPath } from '../../../src/councils/names.js';
import type { Bin, BinDaysResult, CollectionDay, ServiceSummary } from '../api.js';
import { daysUntil, formatDate, relativeDay } from '../lib.js';
import { BinIcon } from './BinIcon.js';

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

interface ResultProps {
  result: BinDaysResult;
  /** The council whose page this is, if any, so the result doesn't link to the page it is on. */
  pageCouncil?: string | undefined;
}

export function Result({ result, pageCouncil }: ResultProps) {
  const { next, today, council, address } = result;
  const later = result.days.filter((day) => day.date !== next?.date);
  const estimated = result.days.some((day) => day.bins.some((b) => b.confidence === 'projected'));

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="shown"
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <Stack gap="lg">
        <motion.div variants={rise}>
          <Text c="dimmed" size="sm">
            {address.matched} ·{' '}
            {council.id === pageCouncil ? (
              council.name
            ) : (
              <Anchor href={councilPath(council)} inherit>
                {council.name}
              </Anchor>
            )}
            {' · '}
            <Anchor href="#coverage" inherit>
              Show on map
            </Anchor>
          </Text>
        </motion.div>

        <motion.div variants={rise}>
          <Paper className="next-card" radius="xl" p={{ base: 'lg', sm: 'xl' }}>
            {next ? (
              <NextCollection day={next} today={today} />
            ) : (
              <Title order={2}>No upcoming collections found</Title>
            )}
          </Paper>
        </motion.div>

        {later.length > 0 && (
          <motion.div variants={rise}>
            <Stack gap="xs">
              <Title order={3} size="h4">
                After that
              </Title>
              <motion.ol className="timeline" variants={stagger}>
                {later.map((day) => (
                  <motion.li key={day.date} variants={rise}>
                    <DayRow day={day} today={today} />
                  </motion.li>
                ))}
              </motion.ol>
            </Stack>
          </motion.div>
        )}

        <motion.div variants={rise}>
          <Stack gap="xs">
            <Title order={3} size="h4">
              Your bins
            </Title>
            <Group gap="sm">
              {result.services.map((service) => (
                <ServiceChip key={service.name} service={service} />
              ))}
            </Group>
            {estimated && (
              <Text c="dimmed" size="xs">
                “est.” dates are worked out from the regular cycle, so public holidays can shift
                them.
              </Text>
            )}
          </Stack>
        </motion.div>
      </Stack>
    </motion.div>
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
          <Stack key={bin.name} gap={4} align="center" className="next-bin">
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
    <div className="day-row">
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

function ServiceChip({ service }: { service: ServiceSummary }) {
  const chip = (
    <Group gap={8} wrap="nowrap" className="service-chip">
      <BinIcon type={service.type} colour={service.colour} size={30} />
      <div>
        <Text size="sm" fw={600} lh={1.2}>
          {service.name}
        </Text>
        <Text size="xs" c="dimmed" lh={1.2}>
          {service.frequency}
          {service.optional && ' · opt-in'}
        </Text>
      </div>
    </Group>
  );
  return service.notes ? (
    <Tooltip label={service.notes} multiline w={220} withArrow>
      {chip}
    </Tooltip>
  ) : (
    chip
  );
}
