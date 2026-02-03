
import { PlaceData, RapidApiKey } from '../types';

export const OPENCAGE_API_KEYS = [
  "88af21aa1b914aa5a5224bb0dc584bf6",
  "62a52ca094f748618938744a23892b19",
  "2669ccecf10b4ded9fbc4f1a9645a435",
  "c20185b43cac46f788990a4fa282923a",
  "c3a07a541be548f290f95fb22170332a"
];

export const RAPIDAPI_KEYS: RapidApiKey[] = [
  { "key": "02ad4fd6f3msh1f0390da51ae627p19a5cfjsn7f2b23cadfdb", "host": "google-map-places.p.rapidapi.com" },
  { "key": "ffbaceaaeamsh9084aa32f4d5dfdp13028bjsn2366c1d9a5c9", "host": "google-map-places.p.rapidapi.com" },
  { "key": "cf1b379a98msh116f2d78aa3d55ep1a4602jsndbd91f1a8bb4", "host": "google-map-places.p.rapidapi.com" },
  { "key": "a8e7379197msh81d17cdf3eb3011p1d33edjsn80f3ab12c760", "host": "google-map-places.p.rapidapi.com" },
  { "key": "c196374069msh778243a9fe86ab0p18f5e5jsn70ead7ba888d", "host": "google-map-places.p.rapidapi.com" },
  { "key": "9036bbd933mshe2c1df67124cf82p17e447jsn62bbd79e7831", "host": "google-map-places.p.rapidapi.com" },
  { "key": "735ca1b3d4msh684c6a048484bc0p1518abjsn820873249d01", "host": "google-map-places.p.rapidapi.com" }
];

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OPENCAGE_URL = "https://api.opencagedata.com/geocode/v1/json";
const GOOGLE_TEXTSEARCH_URL = "https://google-map-places.p.rapidapi.com/maps/api/place/textsearch/json";

let openCageKeyIndex = 0;
let rapidApiKeyIndex = 0;

/**
 * Thử tìm kiếm với Nominatim (OpenStreetMap) - Miễn phí, không key
 */
const searchWithNominatim = async (query: string): Promise<PlaceData | null> => {
  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.append('q', query);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '1');
    url.searchParams.append('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'TourArchitect/1.0 (Enterprise Data Lab)' }
    });

    const data = await response.json();
    if (data && data.length > 0) {
      const item = data[0];
      return {
        name: item.display_name.split(',')[0],
        formatted_address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        types: [item.type, item.class].filter(Boolean)
      };
    }
  } catch (e) {
    console.warn("Nominatim failed:", e);
  }
  return null;
};

/**
 * Thử tìm kiếm với OpenCage - Có key, cần rotate
 */
const searchWithOpenCage = async (query: string): Promise<PlaceData | null> => {
  for (let i = 0; i < OPENCAGE_API_KEYS.length; i++) {
    const key = OPENCAGE_API_KEYS[(openCageKeyIndex + i) % OPENCAGE_API_KEYS.length];
    try {
      const url = new URL(OPENCAGE_URL);
      url.searchParams.append('q', query);
      url.searchParams.append('key', key);
      url.searchParams.append('limit', '1');
      url.searchParams.append('no_annotations', '1');

      const response = await fetch(url.toString());
      const data = await response.json();

      if (response.status === 402 || response.status === 429) continue; // Hết quota

      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        openCageKeyIndex = (openCageKeyIndex + i) % OPENCAGE_API_KEYS.length;
        return {
          name: item.formatted.split(',')[0],
          formatted_address: item.formatted,
          lat: item.geometry.lat,
          lng: item.geometry.lng
        };
      }
      return null;
    } catch (e) {
      console.warn("OpenCage failed with key index", i, e);
    }
  }
  return null;
};

/**
 * Thử tìm kiếm với Google Maps (qua RapidAPI) - Phụ trợ cuối cùng
 */
const searchWithGoogleMaps = async (query: string): Promise<PlaceData | null> => {
  for (let i = 0; i < RAPIDAPI_KEYS.length; i++) {
    const currentKey = RAPIDAPI_KEYS[(rapidApiKeyIndex + i) % RAPIDAPI_KEYS.length];
    try {
      const url = new URL(GOOGLE_TEXTSEARCH_URL);
      url.searchParams.append('query', query);
      url.searchParams.append('language', 'vi');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-key': currentKey.key,
          'x-rapidapi-host': currentKey.host
        }
      });

      if (response.status === 429) continue;

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        rapidApiKeyIndex = (rapidApiKeyIndex + i) % RAPIDAPI_KEYS.length;
        return {
          name: result.name,
          formatted_address: result.formatted_address,
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          rating: result.rating,
          user_ratings_total: result.user_ratings_total,
          place_id: result.place_id,
          types: result.types
        };
      }
      return null;
    } catch (error) {
      console.error("Google Maps API failed:", error);
    }
  }
  return null;
};

/**
 * Main Search Logic với Fallback: Nominatim -> OpenCage -> Google Maps
 */
export const searchPlace = async (query: string): Promise<PlaceData | null> => {
  if (!query) return null;

  // 1. Thử Nominatim
  let result = await searchWithNominatim(query);
  if (result) return { ...result, types: [...(result.types || []), 'osm'] };

  // 2. Thử OpenCage
  result = await searchWithOpenCage(query);
  if (result) return { ...result, types: ['opencage'] };

  // 3. Thử Google Maps
  result = await searchWithGoogleMaps(query);
  if (result) return result;

  return null;
};
