import type { Article } from '../articles.js';

export const binDayCalendar: Article = {
  path: '/guides/bin-day-calendar',
  title: 'Put your bin days in your calendar',
  seoTitle: 'Bin day reminders: add your bin days to Google, Apple or Outlook calendar | Bin Days',
  description:
    'Add a year of your bin days to Google, Apple or Outlook calendar, with a reminder the night before. It updates itself, and needs no app or account.',
  updated: '2026-11-25',
  body: `
Bin Days can put your bin days straight into the calendar on your phone. You subscribe once, and your calendar keeps itself up to date: if your council changes a date, it changes in your calendar too.

## Set it up

1. [Look up your address](/).
2. Under **Save and share**, choose **Google Calendar**, or **Apple or Outlook** for anything else.
3. Leave **Remind me at 6 pm the evening before** ticked if you want a reminder.
4. Confirm in your calendar app.

Each collection day appears as an all-day event, such as "Bins: General waste, Recycling".

## Reminders in each app

Calendar apps treat reminders in subscribed calendars differently:

- **Apple Calendar (iPhone, iPad, Mac):** when you subscribe, turn off **Remove alarms**, or the reminders are dropped.
- **Google Calendar:** reminders from the feed aren't used. Open the calendar's settings in Google Calendar and add a notification there, for example the day before at 6 pm. On a phone, also check that **Sync** is on for the new calendar, or it stays empty.
- **Outlook:** reminders from the feed are usually kept.

## How often it updates

Calendar apps fetch subscribed calendars on their own schedule, from a few hours to about a day apart. Google Calendar can take a few hours to show a newly added calendar.

## Removing it

Unsubscribe or delete the calendar in your calendar app's settings, the same as any other subscribed calendar.
`,
};
