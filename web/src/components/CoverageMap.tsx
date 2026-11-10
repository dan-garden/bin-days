import { useComputedColorScheme } from '@mantine/core';
import {
  GeolocateControl,
  type LngLatBoundsLike,
  Map as MapLibre,
  type MapMouseEvent,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';
import { type Bounds, boundsOf, centreOf } from '../../../src/geo/bounds.js';
import type { Coverage } from '../api.js';

// The bundler renames the worker file, so the library can't find it by itself.
setWorkerUrl(workerUrl);

/** Free vector basemaps from OpenFreeMap (OpenStreetMap data), no API key. */
const STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};
const GREEN = '#2f9e44';
const AREAS = ['coverage-fill', 'coverage-dot'];
/** Room around whatever is framed; extra at the bottom, where the attribution sits. */
const PADDING = { top: 40, right: 56, bottom: 76, left: 40 };

export interface CoverageMapProps {
  coverage: Coverage;
  /** Council ids to frame: a state's councils, or one council. Leave out to show them all. */
  frame?: readonly string[] | undefined;
  /** Council id to outline. */
  highlight?: string | undefined;
  onSelect: (council: string) => void;
  /** The address that was looked up. */
  pin?: { latitude: number; longitude: number } | undefined;
}

const box = (bounds: Bounds): LngLatBoundsLike => [
  [bounds[0], bounds[1]],
  [bounds[2], bounds[3]],
];

/** The bounding box of the framed councils, or of every council. */
function frameBounds(coverage: Coverage, frame?: readonly string[]): Bounds | undefined {
  const features = frame
    ? coverage.features.filter((f) => frame.includes(f.properties.council))
    : coverage.features;
  return boundsOf(features.map((f) => f.geometry.coordinates));
}

export default function CoverageMap({
  coverage,
  frame,
  highlight,
  onSelect,
  pin,
}: CoverageMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibre>(null);
  // Read the scheme straight away, so the map doesn't start light and then reload dark.
  const scheme = useComputedColorScheme('light', { getInitialValueInEffect: false });
  // The map outlives renders, so its event handlers read the latest props from here.
  const latest = useRef({ coverage, frame, highlight, onSelect });
  latest.current = { coverage, frame, highlight, onSelect };

  // Create the map once.
  // biome-ignore lint/correctness/useExhaustiveDependencies: later scheme changes are handled by the effect below.
  useEffect(() => {
    if (!container.current) return;
    const everything = frameBounds(latest.current.coverage, latest.current.frame);
    const instance = new MapLibre({
      container: container.current,
      style: STYLES[scheme],
      ...(everything ? { bounds: box(everything), fitBoundsOptions: { padding: PADDING } } : {}),
      // Scrolling the page shouldn't zoom the map; zooming takes ctrl/two fingers.
      cooperativeGestures: true,
      attributionControl: {
        compact: true,
        customAttribution: 'Council boundaries © Australian Bureau of Statistics',
      },
    });
    map.current = instance;
    instance.addControl(new NavigationControl({ showCompass: false }));
    // Shows where the viewer is, so they can see whether they're inside a supported area.
    instance.addControl(new GeolocateControl({}));

    // Runs for the first style and again whenever the style is swapped (light/dark).
    instance.on('style.load', () => {
      const { coverage, highlight } = latest.current;
      // Our API types geometry loosely; the map only needs it to be GeoJSON, which it is.
      const source = { type: 'geojson', data: coverage } as Parameters<MapLibre['addSource']>[1];
      instance.addSource('coverage', source);
      // Small councils vanish at country scale, so each also gets a dot until you zoom in.
      instance.addSource('coverage-centres', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: coverage.features.flatMap((feature) => {
            const b = boundsOf(feature.geometry.coordinates);
            if (!b) return [];
            const coordinates = centreOf(b);
            return [
              {
                type: 'Feature' as const,
                properties: feature.properties,
                geometry: { type: 'Point' as const, coordinates },
              },
            ];
          }),
        },
      });
      instance.addLayer({
        id: 'coverage-fill',
        type: 'fill',
        source: 'coverage',
        paint: { 'fill-color': GREEN, 'fill-opacity': 0.22 },
      });
      instance.addLayer({
        id: 'coverage-line',
        type: 'line',
        source: 'coverage',
        paint: { 'line-color': GREEN, 'line-width': 1.4 },
      });
      // The highlighted council gets a bold outline rather than a heavy fill, so the streets stay readable.
      instance.addLayer({
        id: 'coverage-selected',
        type: 'line',
        source: 'coverage',
        filter: ['==', ['get', 'council'], highlight ?? ''],
        paint: { 'line-color': '#fcc419', 'line-width': 3.5 },
      });
      instance.addLayer({
        id: 'coverage-dot',
        type: 'circle',
        source: 'coverage-centres',
        maxzoom: 7,
        paint: {
          'circle-radius': 5,
          'circle-color': GREEN,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 1.5,
        },
      });
    });

    const popup = new Popup({ closeButton: false, closeOnClick: false, offset: 10 });
    const councilAt = (event: MapMouseEvent) =>
      instance.queryRenderedFeatures(event.point, { layers: AREAS })[0]?.properties;
    instance.on('mousemove', (event) => {
      const council = instance.getLayer('coverage-fill') ? councilAt(event) : undefined;
      instance.getCanvas().style.cursor = council ? 'pointer' : '';
      if (council) popup.setLngLat(event.lngLat).setText(String(council.name)).addTo(instance);
      else popup.remove();
    });
    instance.on('mouseout', () => popup.remove());
    instance.on('click', (event) => {
      const council = instance.getLayer('coverage-fill') ? councilAt(event) : undefined;
      if (council) latest.current.onSelect(String(council.council));
    });

    return () => {
      map.current = null;
      instance.remove();
    };
  }, []);

  // Follow the page's light/dark scheme.
  const firstScheme = useRef(scheme);
  useEffect(() => {
    if (firstScheme.current === scheme) return;
    firstScheme.current = scheme;
    map.current?.setStyle(STYLES[scheme]);
  }, [scheme]);

  // Outline the highlighted council. (If the style is still loading, its
  // `style.load` handler applies the outline instead.)
  useEffect(() => {
    const instance = map.current;
    if (instance?.getLayer('coverage-selected')) {
      instance.setFilter('coverage-selected', ['==', ['get', 'council'], highlight ?? '']);
    }
  }, [highlight]);

  // Bring the framed councils into view when the frame changes.
  const framed = frame?.join(',');
  // biome-ignore lint/correctness/useExhaustiveDependencies: `framed` stands in for `frame`, which is a new array each render.
  useEffect(() => {
    const area = frameBounds(coverage, frame);
    if (area) map.current?.fitBounds(box(area), { padding: PADDING, maxZoom: 11, duration: 1200 });
  }, [framed, coverage]);

  // Drop a pin on the looked-up address and fly there. Runs after the effect
  // above, so a lookup lands on the address rather than the whole frame.
  useEffect(() => {
    const instance = map.current;
    if (!instance || !pin) return;
    const marker = new Marker({ color: '#e03131' })
      .setLngLat([pin.longitude, pin.latitude])
      .addTo(instance);
    instance.flyTo({ center: [pin.longitude, pin.latitude], zoom: 11, duration: 1800 });
    return () => {
      marker.remove();
    };
  }, [pin]);

  return <div ref={container} className="coverage-map" />;
}
