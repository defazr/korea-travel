import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { CONTENT_TYPE_MAP, AREA_CODE_MAP } from "@/lib/constants";
import { PLACEHOLDER_IMAGE } from "@/lib/image";
import type { Place } from "@/lib/queries";

interface RelatedCategorySectionProps {
  places: Place[];
  categoryLabel: string;
  cityName: string;
}

export default function RelatedCategorySection({ places, categoryLabel, cityName }: RelatedCategorySectionProps) {
  if (places.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold">More {categoryLabel} in {cityName}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => {
          const category =
            CONTENT_TYPE_MAP[place.content_type_id] || "attractions";
          const city = AREA_CODE_MAP[place.area_code] || "seoul";
          const href = `/en/${city}/${category}/${place.slug}`;

          return (
            <Link key={place.content_id} href={href}>
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
          );
        })}
      </div>
    </section>
  );
}
