import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CITIES = [
  { slug: "seoul", name: "Seoul", description: "Capital city with palaces, markets, and nightlife" },
  { slug: "busan", name: "Busan", description: "Coastal city famous for beaches and seafood" },
  { slug: "jeju", name: "Jeju", description: "Volcanic island with stunning natural scenery" },
  { slug: "gyeongju", name: "Gyeongbuk", description: "Ancient capital with UNESCO heritage sites" },
  { slug: "incheon", name: "Incheon", description: "Gateway city with Chinatown and islands" },
  { slug: "daegu", name: "Daegu", description: "Cultural hub known for markets and temples" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          Explore Korea
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Discover thousands of attractions, restaurants, hotels, and festivals
          across South Korea. Your data-driven guide to Korean travel.
        </p>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Popular Destinations</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city) => (
            <Link key={city.slug} href={`/en/${city.slug}`}>
              <Card className="hover:bg-muted/50 h-full transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">{city.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {city.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 text-center">
        <Link href="/en/seoul">
          <Button size="lg">Start Exploring Seoul</Button>
        </Link>
      </section>
    </main>
  );
}
