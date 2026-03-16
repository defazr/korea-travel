import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_IMAGE } from "@/lib/image";
import type { Place } from "@/lib/queries";

interface CategorySectionProps {
  lang: string;
  city: string;
  category: string;
  places: Place[];
  totalCount: number;
}

export default function CategorySection({
  lang,
  city,
  category,
  places,
  totalCount,
}: CategorySectionProps) {
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{categoryLabel}</h2>
        {totalCount > 6 && (
          <Link href={`/${lang}/${city}/${category}`}>
            <Button variant="outline" size="sm">
              View all {totalCount.toLocaleString()}
            </Button>
          </Link>
        )}
      </div>
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
    </section>
  );
}
