// TourAPI EngService2 contentTypeId → category mapping
export const CONTENT_TYPE_MAP: Record<number, string> = {
  75: "courses",
  76: "attractions",
  77: "leisure",
  78: "culture",
  79: "shopping",
  80: "hotels",
  82: "restaurants",
  85: "festivals",
};

// Reverse mapping: category → contentTypeId
export const CATEGORY_TO_TYPE: Record<string, number> = Object.fromEntries(
  Object.entries(CONTENT_TYPE_MAP).map(([k, v]) => [v, parseInt(k)])
);

// Area codes → city slugs
export const AREA_CODE_MAP: Record<number, string> = {
  1: "seoul",
  2: "incheon",
  3: "daejeon",
  4: "daegu",
  5: "gwangju",
  6: "busan",
  7: "ulsan",
  8: "sejong",
  31: "gyeonggi",
  32: "gangwon",
  33: "chungbuk",
  34: "chungnam",
  35: "gyeongbuk",
  36: "gyeongnam",
  37: "jeonbuk",
  38: "jeonnam",
  39: "jeju",
};

// Reverse mapping: city slug → area code
export const CITY_TO_AREA: Record<string, number> = Object.fromEntries(
  Object.entries(AREA_CODE_MAP).map(([k, v]) => [v, parseInt(k)])
);

// Nearby radius in km
export const NEARBY_RADIUS_KM = 5;

// Supported languages
export const LANGUAGES = ["en", "ko"] as const;
export type Language = (typeof LANGUAGES)[number];
