import { Group, Text } from '@mantine/core';
import type { ServiceSummary } from '../api.js';
import { BinIcon } from './BinIcon.js';

/** One bin and how often it goes: a result's bins, and a council's on its page. */
export function ServiceChip({
  service,
}: {
  service: Pick<ServiceSummary, 'type' | 'name' | 'colour' | 'frequency' | 'optional'>;
}) {
  return (
    <Group gap={8} wrap="nowrap" className="service-chip">
      <BinIcon type={service.type} colour={service.colour} size={30} />
      <div>
        <Text size="sm" fw={600} lh={1.2}>
          {service.name}
        </Text>
        <Text size="xs" c="dimmed" lh={1.2}>
          {service.frequency === 'irregular' ? 'next date only' : service.frequency}
          {service.optional && ' · opt-in'}
        </Text>
      </div>
    </Group>
  );
}
