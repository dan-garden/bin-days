import type { CollectionDay } from '../api.js';
import { formatDate, lidPaint } from '../lib.js';

interface WeekStripProps {
  /** The collection days of the result; days with nothing collected are left out. */
  days: CollectionDay[];
  today: string;
  /** The day shown in the street above. */
  selected: string;
  onSelect: (date: string) => void;
}

/** How many days the strip shows. */
export const WEEK = 7;

const plusDays = (date: string, n: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/**
 * The next seven days as tiles, each showing the bins it collects. Choosing a
 * collection day shows it in the street above.
 */
export function WeekStrip({ days, today, selected, onSelect }: WeekStripProps) {
  const byDate = new Map<string, CollectionDay>(days.map((day) => [day.date, day]));
  return (
    <ol className="week-strip" aria-label="The next seven days">
      {Array.from({ length: WEEK }, (_, i) => {
        const date = plusDays(today, i);
        const day = byDate.get(date);
        const label = formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' });
        const tile = (
          <>
            <span className="week-day">
              {i === 0 ? 'Today' : formatDate(date, { weekday: 'short' })}
            </span>
            <span className="week-date">{formatDate(date, { day: 'numeric' })}</span>
            <span className="week-bins" aria-hidden="true">
              {day?.bins.map((bin) => (
                <i key={bin.name} style={{ '--lid': lidPaint(bin) } as React.CSSProperties} />
              ))}
            </span>
          </>
        );
        const classes = ['week-tile', i === 0 && 'is-today', date === selected && 'is-selected']
          .filter(Boolean)
          .join(' ');
        return (
          <li key={date}>
            {day ? (
              <button
                type="button"
                className={classes}
                aria-pressed={date === selected}
                aria-label={`${label}: ${day.bins.map((bin) => bin.name).join(', ')}`}
                onClick={() => onSelect(date)}
              >
                {tile}
              </button>
            ) : (
              <div className={classes}>
                <span className="visually-hidden">{`${label}: no collection`}</span>
                <span className="week-tile-body" aria-hidden="true">
                  {tile}
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
