import { Button, Checkbox, Group, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { addressPath, calendarPath } from '../../../src/councils/names.js';

/** The hour of the evening before that the calendar reminds at. */
const REMINDER_HOUR = 18;

/**
 * Ways to keep a result: subscribe to its bin days in a calendar, which then
 * keeps itself up to date, or pass the address's link on.
 */
export function SaveAndShare({ address }: { address: string }) {
  const [remind, setRemind] = useState(true);
  // Calendar apps subscribe to a `webcal:` address, and fetch it again every so often.
  const feed = `webcal://${location.host}${calendarPath(address, remind ? REMINDER_HOUR : undefined)}`;
  const google = `https://calendar.google.com/calendar/r?${new URLSearchParams({ cid: feed })}`;

  return (
    <Stack gap="xs">
      <Title order={3} size="h4">
        Save and share
      </Title>
      <div className="action-card">
        <div>
          <Text fw={600}>Add to your calendar</Text>
          <Text size="sm" c="dimmed">
            A year of bin days that updates itself when dates change.
          </Text>
        </div>
        <Group gap="xs">
          <Button
            component="a"
            href={feed}
            variant="default"
            radius="xl"
            leftSection={<CalendarIcon />}
          >
            Apple or Outlook
          </Button>
          <Button
            component="a"
            href={google}
            target="_blank"
            rel="noopener"
            variant="default"
            radius="xl"
            leftSection={<CalendarIcon />}
          >
            Google Calendar
          </Button>
        </Group>
        <Checkbox
          className="action-card-wide"
          size="sm"
          label="Remind me at 6 pm the evening before"
          checked={remind}
          onChange={(event) => setRemind(event.currentTarget.checked)}
        />
      </div>
      <div className="action-card">
        <div>
          <Text fw={600}>Share this address</Text>
          <Text size="sm" c="dimmed">
            A link that opens straight to these bin days.
          </Text>
        </div>
        <ShareButton address={address} />
      </div>
    </Stack>
  );
}

/** Hands the address's link to the phone's share sheet, or copies it where there isn't one. */
function ShareButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = location.origin + addressPath(address);
    try {
      if (navigator.share) return await navigator.share({ title: 'Bin Days', url });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {} // the visitor closed the share sheet
  };
  return (
    <Button variant="default" radius="xl" leftSection={<ShareIcon />} onClick={share}>
      {copied ? 'Link copied' : 'Share link'}
    </Button>
  );
}

/** A small line icon, sized to sit beside a button's label. */
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function CalendarIcon() {
  return (
    <Icon>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Icon>
  );
}

function ShareIcon() {
  return (
    <Icon>
      <path d="M12 15V3M8 7l4-4 4 4M5 12v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6" />
    </Icon>
  );
}
