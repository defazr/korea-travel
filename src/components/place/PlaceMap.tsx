"use client";

interface PlaceMapProps {
  lat: number;
  lng: number;
  title: string;
}

export default function PlaceMap({ lat, lng, title }: PlaceMapProps) {
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold">Location</h2>
      <div className="aspect-video w-full overflow-hidden rounded-lg border">
        <iframe
          src={osmUrl}
          className="h-full w-full"
          title={`Map of ${title}`}
          loading="lazy"
        />
      </div>
      <p className="text-muted-foreground mt-1 text-xs">
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
    </section>
  );
}
