import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';

/** Switches between light and dark. Until it's used, the page follows the system setting. */
export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const dark = useComputedColorScheme('light') === 'dark';
  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      radius="xl"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setColorScheme(dark ? 'light' : 'dark')}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
        )}
      </svg>
    </ActionIcon>
  );
}
