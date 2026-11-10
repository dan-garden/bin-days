/**
 * Library entry point. Use it as a package:
 *
 *   import { BinDaysService } from 'bin-days';
 *   const result = await new BinDaysService().lookup({ address: '833 Southport Nerang Rd Nerang' });
 */
export * from './core/address.js';
export * from './core/bin-types.js';
export * from './core/cache.js';
export * from './core/date.js';
export * from './core/errors.js';
export * from './core/http.js';
export * from './core/schedule.js';
export * from './core/types.js';
export * from './councils/index.js';
export * from './geo/abs-lga.js';
export * from './geo/nominatim.js';
export type * from './geo/types.js';
export { createOpenCitiesCouncil, type OpenCitiesConfig } from './platforms/opencities.js';
export { odsString, queryOpendatasoft } from './platforms/opendatasoft.js';
export * from './service.js';
