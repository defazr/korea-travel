interface CityHeroProps {
  cityName: string;
  totalPlaces: number;
}

export default function CityHero({ cityName, totalPlaces }: CityHeroProps) {
  return (
    <section className="mb-10">
      <h1 className="text-4xl font-bold">Explore {cityName}</h1>
      <p className="text-muted-foreground mt-2 text-lg">
        Discover {totalPlaces.toLocaleString()} places — attractions,
        restaurants, hotels, and more.
      </p>
    </section>
  );
}
