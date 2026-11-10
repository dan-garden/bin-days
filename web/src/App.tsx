import {
  Alert,
  Anchor,
  Breadcrumbs,
  Button,
  Container,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { AnimatePresence, m } from 'motion/react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { pageHeading, STATE_NAMES, shortCouncilName, statePath } from '../../src/councils/names.js';
import {
  ApiError,
  type BinDaysResult,
  type CouncilLink,
  getCollections,
  getCouncils,
  pageData,
} from './api.js';
import { AddressForm } from './components/AddressForm.js';
import { BinIcon } from './components/BinIcon.js';
import { CouncilAbout } from './components/CouncilAbout.js';
import { HomeDirectory } from './components/HomeDirectory.js';
import { Outbound } from './components/Outbound.js';
import { StateDirectory } from './components/StateDirectory.js';
import { ThemeToggle } from './components/ThemeToggle.js';

/** The last address submitted, so a returning visitor sees their bins straight away. */
const REMEMBERED = 'bin-days:address';
const REPO = 'https://github.com/dan-garden/bin-days';

function remembered(): string {
  try {
    return localStorage.getItem(REMEMBERED) ?? '';
  } catch {
    return ''; // storage can be blocked, e.g. in private windows
  }
}

function remember(address: string) {
  try {
    if (address) localStorage.setItem(REMEMBERED, address);
    else localStorage.removeItem(REMEMBERED);
  } catch {}
}

// The result view (and the tooltip code it brings) is only needed once an address is looked up.
const Result = lazy(() =>
  import('./components/Result.js').then((module) => ({ default: module.Result })),
);

/** Set when this is a council's landing page, e.g. `/bin-day/qld/brisbane`. */
const page = pageData();

/** The page's heading, and the trail back to the home page, for each kind of page. */
const isHome = !page.council && !page.state;
const heading = pageHeading(page);
const trail: Array<{ name: string; href?: string }> = page.council
  ? [
      { name: STATE_NAMES[page.council.state], href: statePath(page.council.state) },
      { name: shortCouncilName(page.council.name) },
    ]
  : page.state
    ? [{ name: STATE_NAMES[page.state] }]
    : [];

type Lookup =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; result: BinDaysResult }
  | { status: 'failed'; error: ApiError };

export function App() {
  const [address, setAddress] = useState(remembered);
  const [lookup, setLookup] = useState<Lookup>({ status: 'idle' });
  // The server puts the council list in the page; it is only fetched if that is missing.
  const [councils, setCouncils] = useState<CouncilLink[]>(page.councils ?? []);
  const request = useRef<AbortController>(null);

  const find = useCallback(async (submitted: string) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    // Remembered on submit only, never while typing.
    remember(submitted);
    setAddress(submitted);
    setLookup({ status: 'loading' });
    try {
      const result = await getCollections(submitted, controller.signal);
      setLookup({ status: 'done', result });
    } catch (error) {
      if (controller.signal.aborted) return;
      const failure =
        error instanceof ApiError ? error : new ApiError('Something went wrong', 'INTERNAL');
      setLookup({ status: 'failed', error: failure });
    }
  }, []);

  const clear = useCallback(() => {
    request.current?.abort();
    remember('');
    setAddress('');
    setLookup({ status: 'idle' });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once, for the address remembered from last time.
  useEffect(() => {
    if (address) find(address);
    if (!page.councils && !page.council) getCouncils().then(setCouncils, () => {});
  }, []);

  const located = lookup.status === 'done' ? lookup.result.address : undefined;
  /** The council the looked-up address turned out to be in. */
  const found = lookup.status === 'done' ? lookup.result.council.id : undefined;
  const pin = useMemo(
    () =>
      located?.latitude != null && located.longitude != null
        ? { latitude: located.latitude, longitude: located.longitude }
        : undefined,
    [located?.latitude, located?.longitude],
  );

  return (
    <Container size="md" className="page">
      <header className="topbar">
        <Anchor href="/" c="inherit" underline="never">
          <Group gap={8}>
            <BinIcon type="general" size={28} />
            <Text fw={700} size="lg">
              Bin Days
            </Text>
          </Group>
        </Anchor>
        <Group gap="md">
          <Anchor
            href={isHome ? '#coverage' : '/#coverage'}
            c="inherit"
            size="sm"
            underline="hover"
          >
            Councils
          </Anchor>
          <Outbound href="/docs" c="inherit" size="sm" underline="hover">
            API
          </Outbound>
          <Outbound href={REPO} c="inherit" aria-label="Source code on GitHub" lh={0}>
            <GitHubIcon />
          </Outbound>
          <ThemeToggle />
        </Group>
      </header>

      <main>
        {trail.length > 0 && (
          <Breadcrumbs className="trail" separator="›" aria-label="Breadcrumb">
            <Anchor href="/" size="sm">
              Bin Days
            </Anchor>
            {trail.map((step) =>
              step.href ? (
                <Anchor key={step.name} href={step.href} size="sm">
                  {step.name}
                </Anchor>
              ) : (
                <Text key={step.name} size="sm" c="dimmed" aria-current="page">
                  {step.name}
                </Text>
              ),
            )}
          </Breadcrumbs>
        )}
        <section className={isHome ? 'hero' : 'hero hero-compact'}>
          <m.div
            className="hero-bins"
            initial="hidden"
            animate="shown"
            variants={{ shown: { transition: { staggerChildren: 0.09 } } }}
          >
            {(['general', 'recycling', 'organics', 'glass'] as const).map((type, index) => (
              <m.div
                key={type}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.7 },
                  shown: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: 'spring', stiffness: 300, damping: 18 },
                  },
                }}
              >
                <BinIcon type={type} size={76} greet={0.7 + index * 0.16} />
              </m.div>
            ))}
          </m.div>
          {/* No entrance animation: the server already painted this heading in the same place. */}
          <div>
            <Title className="hero-title">{heading.title}</Title>
            <Text className="hero-lede" c="dimmed">
              {heading.lede}
            </Text>
            <AddressForm
              address={address}
              loading={lookup.status === 'loading'}
              onSubmit={find}
              onClear={clear}
            />
          </div>
        </section>

        <section className="result" aria-live="polite">
          <AnimatePresence mode="wait">
            {lookup.status === 'loading' && (
              <m.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Skeleton h={14} w="60%" mb="lg" />
                <Skeleton h={190} radius="xl" />
              </m.div>
            )}
            {lookup.status === 'done' && (
              <Suspense key={lookup.result.address.matched} fallback={null}>
                <Result result={lookup.result} pageCouncil={page.council?.id} />
              </Suspense>
            )}
            {lookup.status === 'failed' && (
              <m.div
                key="failed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Failure error={lookup.error} onPick={find} />
              </m.div>
            )}
          </AnimatePresence>
        </section>

        {page.council ? (
          <CouncilAbout council={page.council} nearby={page.nearby ?? []} pin={pin} />
        ) : page.state ? (
          <StateDirectory state={page.state} councils={councils} highlight={found} pin={pin} />
        ) : (
          <HomeDirectory councils={councils} highlight={found} pin={pin} />
        )}
      </main>

      <footer className="footer">
        <Text size="sm" c="dimmed">
          Dates come from each council's published calendar. Check with your council around public
          holidays. Bin Days is free and open:{' '}
          <Outbound href="/docs" inherit>
            use the API
          </Outbound>{' '}
          or{' '}
          <Outbound href={REPO} inherit>
            read the code
          </Outbound>
          . Made by{' '}
          <Outbound href="https://github.com/dan-garden" inherit>
            Dan Garden
          </Outbound>
          .
        </Text>
      </footer>
    </Container>
  );
}

const FAILURE_TITLES: Record<string, string> = {
  ADDRESS_NOT_FOUND: "We couldn't find that address",
  COUNCIL_NOT_SUPPORTED: "That council isn't covered yet",
  INVALID_INPUT: "That doesn't look like a street address",
  OFFLINE: "Can't connect",
};

function Failure({ error, onPick }: { error: ApiError; onPick: (address: string) => void }) {
  const unsupported = error.code === 'COUNCIL_NOT_SUPPORTED';
  return (
    <Alert
      radius="lg"
      color={unsupported ? 'yellow' : 'red'}
      title={FAILURE_TITLES[error.code] ?? "The council's site isn't answering"}
    >
      <Stack gap="sm" align="flex-start">
        <Text size="sm">{error.message}</Text>
        {error.suggestions.length > 0 && (
          <>
            <Text size="sm" fw={600}>
              Did you mean:
            </Text>
            <Group gap="xs">
              {error.suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="default"
                  size="xs"
                  radius="xl"
                  onClick={() => onPick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </Group>
          </>
        )}
        {unsupported && (
          <Anchor href="#coverage" size="sm" c="inherit" underline="always">
            See which councils are covered
          </Anchor>
        )}
      </Stack>
    </Alert>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
