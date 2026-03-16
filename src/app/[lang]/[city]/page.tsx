import { notFound } from "next/navigation";
import {
  getPlacesByCategory,
  countPlacesByCategory,
} from "@/lib/queries";
import {
  CITY_TO_AREA,
  CONTENT_TYPE_MAP,
  AREA_CODE_MAP,
} from "@/lib/constants";
import CityHero from "@/components/city/CityHero";
import CategorySection from "@/components/city/CategorySection";

interface PageProps {
  params: Promise<{
    lang: string;
    city: string;
  }>;
}

export default async function CityPage({ params }: PageProps) {
  const { lang, city } = await params;

  const areaCode = CITY_TO_AREA[city];
  if (!areaCode) notFound();

  const cityName =
    AREA_CODE_MAP[areaCode].charAt(0).toUpperCase() +
    AREA_CODE_MAP[areaCode].slice(1);

  // Fetch top places for each category
  const categories = Object.entries(CONTENT_TYPE_MAP);
  const sections = await Promise.all(
    categories.map(async ([typeId, categorySlug]) => {
      const contentTypeId = parseInt(typeId);
      const [places, count] = await Promise.all([
        getPlacesByCategory(areaCode, contentTypeId, 6),
        countPlacesByCategory(areaCode, contentTypeId),
      ]);
      return { categorySlug, places, count };
    })
  );

  const activeSections = sections.filter((s) => s.places.length > 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <CityHero cityName={cityName} totalPlaces={activeSections.reduce((sum, s) => sum + s.count, 0)} />

      {activeSections.map((section) => (
        <CategorySection
          key={section.categorySlug}
          lang={lang}
          city={city}
          category={section.categorySlug}
          places={section.places}
          totalCount={section.count}
        />
      ))}
    </main>
  );
}
