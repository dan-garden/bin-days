import { expect, it } from 'vitest';
import { ALL_COUNCILS } from '../../src/councils/index.js';
import { ADDRESSES } from '../live/addresses.js';

// Offline, so a new council without one fails `npm test`, not just the weekly check.
it('has a sample address for every council, and none for councils that no longer exist', () => {
  const ids = ALL_COUNCILS.map((council) => council.id);
  expect(ids.filter((id) => !ADDRESSES[id]?.length)).toEqual([]);
  expect(Object.keys(ADDRESSES).filter((id) => !ids.includes(id))).toEqual([]);
});
