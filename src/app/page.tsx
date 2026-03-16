import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CITIES = [
  { slug: "seoul", name: "Seoul", description: "Capital city with palaces, markets, and nightlife" },
  { slug: "busan", name: "Busan", description: "Coastal city famous for beaches and seafood" },
  { slug: "jeju", name: "Jeju", description: "Volcanic island with stunning natural scenery" },
  { slug: "gyeongbuk", name: "Gyeongbuk", description: "Ancient capital with UNESCO heritage sites" },
  { slug: "incheon", name: "Incheon", description: "Gateway city with Chinatown and islands" },
  { slug: "daegu", name: "Daegu", description: "Cultural hub known for markets and temples" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground px-4 py-24 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          Korea Travel Guide
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
          Explore attractions, restaurants, festivals and travel destinations across Korea.
        </p>
        <Link href="/en/seoul">
          <Button size="lg" variant="secondary" className="text-base font-semibold">
            Explore Seoul
          </Button>
        </Link>
      </section>

      {/* Popular Destinations */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Popular Destinations</h2>
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

      {/* Stats Section */}
      <section className="bg-muted px-4 py-12 text-center">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold">15,000+</p>
            <p className="text-muted-foreground mt-1">Travel Destinations</p>
          </div>
          <div>
            <p className="text-3xl font-bold">17</p>
            <p className="text-muted-foreground mt-1">Cities & Regions</p>
          </div>
          <div>
            <p className="text-3xl font-bold">8</p>
            <p className="text-muted-foreground mt-1">Categories</p>
          </div>
        </div>
      </section>

    </main>
  );
}
