import { query } from "@/db/connection";

export interface Place {
  content_id: number;
  content_type_id: number;
  title: string;
  slug: string;
  addr1: string | null;
  addr2: string | null;
  area_code: number;
  sigungucode: number;
  mapx: number;
  mapy: number;
  tel: string | null;
  first_image: string | null;
  created_at: string;
}

export interface PlaceDetail {
  content_id: number;
  overview: string | null;
  homepage: string | null;
  open_time: string | null;
  rest_date: string | null;
  parking: string | null;
  use_time: string | null;
}

export interface PlaceImage {
  id: number;
  content_id: number;
  image_url: string;
  is_main: boolean;
}

/** Get a single place by slug */
export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  const result = await query("SELECT * FROM places WHERE slug = $1", [slug]);
  return result.rows[0] || null;
}

/** Get place details */
export async function getPlaceDetails(
  contentId: number
): Promise<PlaceDetail | null> {
  const result = await query(
    "SELECT * FROM place_details WHERE content_id = $1",
    [contentId]
  );
  return result.rows[0] || null;
}

/** Get place images */
export async function getPlaceImages(contentId: number): Promise<PlaceImage[]> {
  const result = await query(
    "SELECT * FROM place_images WHERE content_id = $1 AND image_url != 'none' ORDER BY is_main DESC",
    [contentId]
  );
  return result.rows;
}

/** Get places by city (area_code) and category (content_type_id) */
export async function getPlacesByCategory(
  areaCode: number,
  contentTypeId: number,
  limit = 50,
  offset = 0
): Promise<Place[]> {
  const result = await query(
    `SELECT * FROM places
     WHERE area_code = $1 AND content_type_id = $2
     ORDER BY (first_image IS NOT NULL) DESC, title
     LIMIT $3 OFFSET $4`,
    [areaCode, contentTypeId, limit, offset]
  );
  return result.rows;
}

/** Get nearby places within radius (km) */
export async function getNearbyPlaces(
  mapx: number,
  mapy: number,
  radiusKm: number,
  excludeContentId?: number,
  limit = 10
): Promise<Place[]> {
  // Approximate degree-to-km conversion at Korea's latitude (~36°N)
  const latDeg = radiusKm / 111.0;
  const lngDeg = radiusKm / (111.0 * Math.cos((mapy * Math.PI) / 180));

  const result = await query(
    `SELECT *,
       SQRT(POW((mapx - $1) * 111.0 * COS(RADIANS($2)), 2) + POW((mapy - $2) * 111.0, 2)) AS distance_km
     FROM places
     WHERE mapx BETWEEN $1 - $3 AND $1 + $3
       AND mapy BETWEEN $2 - $4 AND $2 + $4
       ${excludeContentId ? "AND content_id != $6" : ""}
     ORDER BY distance_km
     LIMIT $5`,
    excludeContentId
      ? [mapx, mapy, lngDeg, latDeg, limit, excludeContentId]
      : [mapx, mapy, lngDeg, latDeg, limit]
  );
  return result.rows;
}

/** Get all places for a city */
export async function getPlacesByCity(
  areaCode: number,
  limit = 50
): Promise<Place[]> {
  const result = await query(
    `SELECT * FROM places WHERE area_code = $1 ORDER BY title LIMIT $2`,
    [areaCode, limit]
  );
  return result.rows;
}

/** Get all places for sitemap (slug, area_code, content_type_id, updated) */
export async function getAllPlacesForSitemap(): Promise<
  Pick<Place, "slug" | "area_code" | "content_type_id">[]
> {
  const result = await query(
    `SELECT slug, area_code, content_type_id FROM places ORDER BY content_id`
  );
  return result.rows;
}

/** Get related places in the same category (excluding current place) */
export async function getRelatedByCategory(
  areaCode: number,
  contentTypeId: number,
  excludeContentId: number,
  limit = 6
): Promise<Place[]> {
  const result = await query(
    `SELECT * FROM places
     WHERE area_code = $1 AND content_type_id = $2 AND content_id != $3
     ORDER BY RANDOM()
     LIMIT $4`,
    [areaCode, contentTypeId, excludeContentId, limit]
  );
  return result.rows;
}

/** Count places by city and category */
export async function countPlacesByCategory(
  areaCode: number,
  contentTypeId: number
): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) FROM places WHERE area_code = $1 AND content_type_id = $2`,
    [areaCode, contentTypeId]
  );
  return parseInt(result.rows[0].count);
}
