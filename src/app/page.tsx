import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CITIES = [
  { slug: "seoul", name: "Seoul", description: "Capital city with palaces, markets, and nightlife", image: "http://tong.visitkorea.or.kr/cms/resource/44/3109344_image2_1.JPG" },
  { slug: "busan", name: "Busan", description: "Coastal city famous for beaches and seafood", image: "http://tong.visitkorea.or.kr/cms/resource/44/1605344_image2_1.jpg" },
  { slug: "jeju", name: "Jeju", description: "Volcanic island with stunning natural scenery", image: "http://tong.visitkorea.or.kr/cms/resource/13/2525613_image2_1.jpg" },
  { slug: "gyeongbuk", name: "Gyeongbuk", description: "Ancient capital with UNESCO heritage sites", image: "http://tong.visitkorea.or.kr/cms/resource/55/3082355_image2_1.jpg" },
  { slug: "incheon", name: "Incheon", description: "Gateway city with Chinatown and islands", image: "http://tong.visitkorea.or.kr/cms/resource/09/2674909_image2_1.jpg" },
  { slug: "daegu", name: "Daegu", description: "Cultural hub known for markets and temples", image: "http://tong.visitkorea.or.kr/cms/resource/57/1573857_image2_1.jpg" },
];

const CATEGORIES = [
  { slug: "attractions", label: "Attractions", icon: "🏛️", description: "Palaces, temples, landmarks" },
  { slug: "restaurants", label: "Restaurants", icon: "🍜", description: "Korean cuisine & local food" },
  { slug: "hotels", label: "Hotels", icon: "🏨", description: "Accommodation & stays" },
  { slug: "festivals", label: "Festivals", icon: "🎊", description: "Events & celebrations" },
  { slug: "culture", label: "Culture", icon: "🎭", description: "Museums, galleries, theaters" },
  { slug: "shopping", label: "Shopping", icon: "🛍️", description: "Markets & shopping districts" },
  { slug: "leisure", label: "Leisure", icon: "⛷️", description: "Activities & recreation" },
  { slug: "courses", label: "Courses", icon: "🗺️", description: "Travel routes & itineraries" },
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
          Explore 15,000+ attractions, restaurants, festivals, and travel destinations across South Korea.
        </p>
        <Link href="/en/seoul">
          <Button size="lg" variant="secondary" className="text-base font-semibold">
            Explore Seoul
          </Button>
        </Link>
      </section>

      {/* Cities Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-2 text-center text-3xl font-bold">Popular Destinations</h2>
        <p className="text-muted-foreground mb-8 text-center">Discover Korea&apos;s most visited cities and regions</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city) => (
            <Link key={city.slug} href={`/en/${city.slug}`}>
              <Card className="hover:bg-muted/50 group h-full overflow-hidden transition-colors">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <h3 className="absolute bottom-3 left-3 text-xl font-bold text-white">
                    {city.name}
                  </h3>
                </div>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">{city.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold">Browse by Category</h2>
          <p className="text-muted-foreground mb-8 text-center">Find exactly what you&apos;re looking for</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/en/seoul/${cat.slug}`}>
                <Card className="hover:bg-muted/50 h-full transition-colors">
                  <CardContent className="p-5">
                    <span className="mb-2 block text-2xl">{cat.icon}</span>
                    <h3 className="font-semibold">{cat.label}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{cat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold">15,000+</p>
            <p className="text-muted-foreground mt-1">Travel Destinations</p>
          </div>
          <div>
            <p className="text-3xl font-bold">17</p>
            <p className="text-muted-foreground mt-1">Cities &amp; Regions</p>
          </div>
          <div>
            <p className="text-3xl font-bold">8</p>
            <p className="text-muted-foreground mt-1">Categories</p>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Explore Korea",
            url: "https://travel.in-book.co.kr",
            description: "Data-driven Korea travel platform for international tourists. Discover attractions, restaurants, hotels, and festivals across South Korea.",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://travel.in-book.co.kr/en/seoul?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
    </main>
  );
}
