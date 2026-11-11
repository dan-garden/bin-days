import { Anchor, Stack, Text, Title } from '@mantine/core';
import type { PageData } from '../../../src/api/site.js';
import {
  councilPath,
  STATE_NAMES,
  shortCouncilName,
  sourceDescription,
  statePath,
} from '../../../src/councils/names.js';
import { MapPanel } from './MapPanel.js';
import { Outbound } from './Outbound.js';
import { SuburbLinks } from './SuburbLinks.js';

interface CouncilAboutProps {
  /** The council whose page this is, or the one a looked-up address is in. */
  council: NonNullable<PageData['council']>;
  nearby: NonNullable<PageData['nearby']>;
  pin?: { latitude: number; longitude: number } | undefined;
  /** The suburb whose page this is, if it is one. */
  suburb?: PageData['suburb'];
  /** Suburbs to link to: all of the council's on its own page, the nearest on a suburb's. */
  suburbs?: string[];
}

/** About one council: the area it covers, where its dates come from, and the councils around it. */
export function CouncilAbout({ council, nearby, pin, suburb, suburbs = [] }: CouncilAboutProps) {
  const place = shortCouncilName(council.name);
  const state = STATE_NAMES[council.state];
  return (
    <section id="area" className="coverage">
      <Title order={2} mb="lg">
        Bin collection in {suburb?.name ?? place}
      </Title>

      <div className="coverage-grid">
        <MapPanel frame={[council.id]} highlight={council.id} pin={pin} />
        <Stack gap="lg">
          <Text>
            {suburb
              ? `${suburb.name} is in the ${council.name} area, outlined on the map.`
              : `${council.name} collects household bins across the area outlined on the map.`}{' '}
            Bin Days gets your dates from {sourceDescription(council)}.
          </Text>
          <dl className="facts">
            <dt>Council</dt>
            <dd>{council.name}</dd>
            <dt>State</dt>
            <dd>
              <Anchor href={statePath(council.state)} inherit>
                {state}
              </Anchor>
            </dd>
            {council.website && (
              <>
                <dt>Official site</dt>
                <dd>
                  <Outbound href={council.website} inherit>
                    {new URL(council.website).hostname.replace(/^www\./, '')}
                  </Outbound>
                </dd>
              </>
            )}
          </dl>
          {nearby.length > 0 && (
            <div>
              <Text fw={700} mb={8}>
                Nearby councils
              </Text>
              <div className="chip-row">
                {nearby.map((other) => (
                  <a key={other.id} className="council-chip" href={councilPath(other)}>
                    {shortCouncilName(other.name)}
                  </a>
                ))}
              </div>
            </div>
          )}
          {suburb ? (
            <Anchor href={councilPath(council)} size="sm">
              All of {place}
            </Anchor>
          ) : (
            <Anchor href={statePath(council.state)} size="sm">
              All councils in {state}
            </Anchor>
          )}
        </Stack>
      </div>

      {suburbs.length > 0 && (
        <Stack gap="sm" mt="xl">
          <Title order={3} size="h4">
            {suburb ? `Suburbs near ${suburb.name}` : `Suburbs in ${place}`}
          </Title>
          <SuburbLinks council={council} suburbs={suburbs} />
        </Stack>
      )}
    </section>
  );
}
