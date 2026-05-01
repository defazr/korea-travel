import type { MetadataRoute } from "next";
import { getAllPlacesForSitemap, countPlacesByCategory } from "@/lib/queries";
import { CONTENT_TYPE_MAP, AREA_CODE_MAP } from "@/lib/constants";

const BASE_URL = "https://travel.in-book.co.kr";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  entries.push({
    url: BASE_URL,
    changeFrequency: "weekly",
    priority: 1.0,
  });

  // City pages
  const cities = Object.values(AREA_CODE_MAP);
  for (const city of cities) {
    entries.push({
      url: `${BASE_URL}/en/${city}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // Category pages per city (skip empty combinations)
  const areaEntries = Object.entries(AREA_CODE_MAP);
  const typeEntries = Object.entries(CONTENT_TYPE_MAP);
  for (const [areaCode, city] of areaEntries) {
    for (const [typeId, category] of typeEntries) {
      const count = await countPlacesByCategory(parseInt(areaCode), parseInt(typeId));
      if (count > 0) {
        entries.push({
          url: `${BASE_URL}/en/${city}/${category}`,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }

  // Individual place pages
  const places = await getAllPlacesForSitemap();
  for (const place of places) {
    const city = AREA_CODE_MAP[place.area_code];
    const category = CONTENT_TYPE_MAP[place.content_type_id];
    if (city && category) {
      entries.push({
        url: `${BASE_URL}/en/${city}/${category}/${place.slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
