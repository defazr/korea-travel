import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getPlacesByCategory,
  countPlacesByCategory,
} from "@/lib/queries";
import {
  CITY_TO_AREA,
  CATEGORY_TO_TYPE,
  AREA_CODE_MAP,
  CONTENT_TYPE_MAP,
} from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { PLACEHOLDER_IMAGE } from "@/lib/image";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{
    lang: string;
    city: string;
    category: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, city, category } = await params;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  const areaCode = CITY_TO_AREA[city];
  const contentTypeId = CATEGORY_TO_TYPE[category];
  const count = areaCode && contentTypeId ? await countPlacesByCategory(areaCode, contentTypeId) : 0;

  return {
    title: `${categoryName} in ${cityName} – Korea Travel Guide`,
    description: `Discover the best ${category} in ${cityName}, South Korea. Browse ${category} with photos, addresses, and travel information.`,
    alternates: {
      canonical: `/${lang}/${city}/${category}`,
    },
    openGraph: {
      title: `${categoryName} in ${cityName} – Korea Travel Guide`,
      description: `Discover the best ${category} in ${cityName}, South Korea.`,
    },
    ...(count === 0 && { robots: { index: false, follow: true } }),
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { lang, city, category } = await params;

  const areaCode = CITY_TO_AREA[city];
  if (!areaCode) notFound();

  const contentTypeId = CATEGORY_TO_TYPE[category];
  if (!contentTypeId) notFound();

  const cityName =
    AREA_CODE_MAP[areaCode].charAt(0).toUpperCase() +
    AREA_CODE_MAP[areaCode].slice(1);
  const categoryLabel =
    category.charAt(0).toUpperCase() + category.slice(1);

  const [places, totalCount] = await Promise.all([
    getPlacesByCategory(areaCode, contentTypeId, 100),
    countPlacesByCategory(areaCode, contentTypeId),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-10">
        <nav className="text-muted-foreground mb-4 text-sm">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/${lang}/${city}`} className="hover:text-foreground">{cityName}</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{categoryLabel}</span>
        </nav>
        <h1 className="text-4xl font-bold">{categoryLabel} in {cityName}</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {totalCount.toLocaleString()} {category} found in {cityName}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <Link
            key={place.content_id}
            href={`/${lang}/${city}/${category}/${place.slug}`}
          >
            <Card className="hover:bg-muted/50 h-full transition-colors">
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                <Image
                  src={place.first_image || PLACEHOLDER_IMAGE}
                  alt={place.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <CardContent className="p-3">
                <h3 className="text-sm font-medium">{place.title}</h3>
                {place.addr1 && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {place.addr1}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {places.length === 0 && (
        <p className="text-muted-foreground py-12 text-center">
          No {category} found in {cityName} yet.
        </p>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${categoryLabel} in ${cityName}`,
            description: `Discover the best ${category} in ${cityName}, South Korea.`,
            url: `https://travel.in-book.co.kr/${lang}/${city}/${category}`,
          }),
        }}
      />
    </main>
  );
}
