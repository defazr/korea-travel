import Link from "next/link";

const CITIES = [
  { slug: "seoul", name: "Seoul" },
  { slug: "busan", name: "Busan" },
  { slug: "jeju", name: "Jeju" },
  { slug: "incheon", name: "Incheon" },
  { slug: "daegu", name: "Daegu" },
  { slug: "gwangju", name: "Gwangju" },
];

const CATEGORIES = [
  { slug: "attractions", name: "Attractions" },
  { slug: "restaurants", name: "Restaurants" },
  { slug: "hotels", name: "Hotels" },
  { slug: "festivals", name: "Festivals" },
  { slug: "culture", name: "Culture" },
  { slug: "shopping", name: "Shopping" },
];

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-3 mb-8">
          <div>
            <h3 className="mb-3 text-sm font-semibold">Popular Cities</h3>
            <div className="flex flex-col gap-1">
              {CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/en/${city.slug}`}
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">Categories</h3>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/en/seoul/${cat.slug}`}
                  className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">Explore Korea</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Data-driven travel platform for international tourists visiting South Korea.
            </p>
          </div>
        </div>
        <div className="border-t pt-6 text-center">
          <p className="text-muted-foreground text-xs">
            Data powered by Korea Tourism Organization TourAPI
          </p>
        </div>
      </div>
    </footer>
  );
}
