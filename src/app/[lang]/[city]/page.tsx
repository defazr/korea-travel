import { notFound } from "next/navigation";
import type { Metadata } from "next";
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

export const revalidate = 3600;

interface PageProps {
  params: Promise<{
    lang: string;
    city: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  return {
    title: `Things to Do in ${cityName} – Korea Travel Guide`,
    description: `Discover attractions, restaurants, and travel destinations in ${cityName}, Korea.`,
    openGraph: {
      title: `Things to Do in ${cityName} – Korea Travel Guide`,
      description: `Discover attractions, restaurants, and travel destinations in ${cityName}, Korea.`,
    },
  };
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "City",
            name: cityName,
            url: `https://travel.in-book.co.kr/${lang}/${city}`,
            description: `Discover attractions, restaurants, and travel destinations in ${cityName}, Korea.`,
            containedInPlace: {
              "@type": "Country",
              name: "South Korea",
            },
          }),
        }}
      />
    </main>
  );
}
