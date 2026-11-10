import { compareDates, parseAustralianDate } from '../../core/date.js';
import { parseError } from '../../core/errors.js';
import { getJson } from '../../core/http.js';
import { binService, intervalDays } from '../../core/schedule.js';
import type { BinService, BinType } from '../../core/types.js';
import { findArcGisAddress } from '../../platforms/arcgis.js';
import type { CouncilAdapter } from '../types.js';

/**
 * Merri-bek City Council, via the two steps behind the council's own bin day
 * page: its list of properties gives a property's collection codes, and the
 * council's website turns those into the year's dates for each bin.
 */
const PROPERTIES =
  'https://services6.arcgis.com/8L5sOwfzTAvcvQur/ArcGIS/rest/services/WasteServices4Bin/FeatureServer/0';
const API = 'https://www.merri-bek.vic.gov.au/api/AddressDetails';

/** Each bin's list of dates in the website's answer, written `24-12-2026`. */
const BINS: Array<{ dates: string; type: BinType; name: string }> = [
  { dates: 'allBinDays', type: 'general', name: 'General waste' },
  { dates: 'allRecycleDays', type: 'recycling', name: 'Recycling' },
  { dates: 'allFogoDays', type: 'organics', name: 'Food and garden organics' },
  { dates: 'allGlassDays', type: 'glass', name: 'Glass' },
];

export const merriBek: CouncilAdapter = {
  id: 'vic/merri-bek',
  name: 'Merri-bek City Council',
  state: 'VIC',
  lgaCodes: ['24700'],
  timezone: 'Australia/Melbourne',
  website: 'https://www.merri-bek.vic.gov.au/living-in-merri-bek/waste-and-recycling',
  platform: 'council-api',

  async getSchedule(address, { http, today }) {
    const { attributes: property, geometry } = await findArcGisAddress(
      http,
      PROPERTIES,
      'EZI_Address',
      address,
      { council: 'Merri-bek City Council', withLocation: true },
    );
    const text = (field: string) => String(property[field] ?? '');
    const url = `${API}?${new URLSearchParams({
      xPoint: String(geometry?.x ?? ''),
      yPoint: String(geometry?.y ?? ''),
      wasteDay: text('Day'),
      wasteRateCode: text('Waste_Rate_Code'),
      recycleRateCode: text('Recycling_Rate_Code'),
      fogoRateCode: text('FOGO_Rate_Code'),
      glassRateCode: text('Glass_Rate_Code'),
      zone: text('Zone'),
      glassWeekNumber: text('GlassWeek'),
      address: text('EZI_Address'),
      // The council's bin day page, which the website insists on being told.
      cpage: '86612',
    })}`;
    const [answer] = await getJson<Array<Record<string, unknown>>>(http, url);

    const services: BinService[] = [];
    for (const bin of BINS) {
      const listed = answer?.[bin.dates];
      const dates = (Array.isArray(listed) ? listed : [])
        .map((date) => parseAustralianDate(String(date)))
        .filter((date) => date != null)
        .sort(compareDates);
      const next = dates.find((date) => compareDates(date, today) >= 0);
      // The lists stop at the end of the year, so carry on from the next date at the cycle they show.
      if (next) {
        services.push(binService(bin.type, bin.name, next, intervalDays({ kind: 'dates', dates })));
      }
    }
    if (!services.length) {
      throw parseError(`No bin services found for ${text('EZI_Address')}`, { url });
    }
    return { matchedAddress: text('EZI_Address'), services, sourceUrl: url };
  },
};
