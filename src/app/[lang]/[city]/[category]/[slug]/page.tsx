import { notFound } from "next/navigation";
import {
  getPlaceBySlug,
  getPlaceDetails,
  getPlaceImages,
  getNearbyPlaces,
} from "@/lib/queries";
import { CONTENT_TYPE_MAP } from "@/lib/constants";
import PlaceHero from "@/components/place/PlaceHero";
import PlaceInfo from "@/components/place/PlaceInfo";
import PlaceMap from "@/components/place/PlaceMap";
import NearbySection from "@/components/place/NearbySection";

interface PageProps {
  params: Promise<{
    lang: string;
    city: string;
    category: string;
    slug: string;
  }>;
}

export default async function PlacePage({ params }: PageProps) {
  const { slug } = await params;

  const place = await getPlaceBySlug(slug);
  if (!place) notFound();

  const [details, images, nearby] = await Promise.all([
    getPlaceDetails(place.content_id),
    getPlaceImages(place.content_id),
    getNearbyPlaces(place.mapx, place.mapy, 5, place.content_id, 6),
  ]);

  const category = CONTENT_TYPE_MAP[place.content_type_id] || "attractions";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PlaceHero
        title={place.title}
        image={images[0]?.image_url || place.first_image}
        address={[place.addr1, place.addr2].filter(Boolean).join(" ")}
        category={category}
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
    </main>
  );
}
