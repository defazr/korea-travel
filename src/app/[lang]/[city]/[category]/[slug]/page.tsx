import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getPlaceBySlug,
  getPlaceDetails,
  getPlaceImages,
  getNearbyPlaces,
} from "@/lib/queries";
import { CONTENT_TYPE_MAP, AREA_CODE_MAP } from "@/lib/constants";
import { PLACEHOLDER_IMAGE } from "@/lib/image";
import PlaceHero from "@/components/place/PlaceHero";
import PlaceInfo from "@/components/place/PlaceInfo";
import PlaceMap from "@/components/place/PlaceMap";
import NearbySection from "@/components/place/NearbySection";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{
    lang: string;
    city: string;
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) return {};

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const address = [place.addr1, place.addr2].filter(Boolean).join(" ");

  return {
    title: `${place.title} – Korea Travel Guide`,
    description: address
      ? `Visit ${place.title} in ${cityName}, Korea. ${address}`
      : `Visit ${place.title} in ${cityName}, Korea. Discover travel information, photos, and nearby attractions.`,
    openGraph: {
      title: `${place.title} – Korea Travel Guide`,
      description: `Visit ${place.title} in ${cityName}, Korea.`,
      images: place.first_image ? [place.first_image] : undefined,
    },
  };
}

export default async function PlacePage({ params }: PageProps) {
  const { lang, city, category, slug } = await params;

  const place = await getPlaceBySlug(slug);
  if (!place) notFound();

  const [details, images, nearby] = await Promise.all([
    getPlaceDetails(place.content_id),
    getPlaceImages(place.content_id),
    getNearbyPlaces(place.mapx, place.mapy, 5, place.content_id, 6),
  ]);

  const resolvedCategory = CONTENT_TYPE_MAP[place.content_type_id] || "attractions";
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const categoryLabel = resolvedCategory.charAt(0).toUpperCase() + resolvedCategory.slice(1);
  const imageUrl = images[0]?.image_url || place.first_image || PLACEHOLDER_IMAGE;
  const address = [place.addr1, place.addr2].filter(Boolean).join(" ");

  // JSON-LD structured data
  const jsonLd = buildJsonLd(place, details, resolvedCategory, imageUrl, address, lang, city);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <nav className="text-muted-foreground mb-4 text-sm">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${lang}/${city}`} className="hover:text-foreground">{cityName}</Link>
        <span className="mx-2">/</span>
        <Link href={`/${lang}/${city}/${resolvedCategory}`} className="hover:text-foreground">{categoryLabel}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{place.title}</span>
      </nav>

      <PlaceHero
        title={place.title}
        image={imageUrl}
        address={address}
        category={resolvedCategory}
      />

      <PlaceInfo
        overview={details?.overview}
        tel={place.tel}
        homepage={details?.homepage}
        openTime={details?.open_time}
        restDate={details?.rest_date}
        parking={details?.parking}
        useTime={details?.use_time}
      />

      {place.mapx && place.mapy && (
        <PlaceMap lat={place.mapy} lng={place.mapx} title={place.title} />
      )}

      {nearby.length > 0 && <NearbySection places={nearby} />}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}

function buildJsonLd(
  place: { title: string; mapx: number; mapy: number; content_type_id: number },
  details: { overview?: string | null } | null,
  category: string,
  imageUrl: string,
  address: string,
  lang: string,
  city: string,
) {
  const typeMap: Record<string, string> = {
    attractions: "TouristAttraction",
    culture: "TouristAttraction",
    festivals: "Event",
    hotels: "Hotel",
    restaurants: "Restaurant",
    shopping: "Store",
    leisure: "SportsActivityLocation",
    courses: "TouristAttraction",
  };

  return {
    "@context": "https://schema.org",
    "@type": typeMap[category] || "Place",
    name: place.title,
    description: details?.overview?.replace(/<[^>]*>/g, "").slice(0, 300) || undefined,
    image: imageUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: address || undefined,
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: place.mapy,
      longitude: place.mapx,
    },
    url: `https://travel.in-book.co.kr/${lang}/${city}/${category}/${encodeURIComponent(place.title)}`,
  };
}
