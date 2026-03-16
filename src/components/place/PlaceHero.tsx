import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface PlaceHeroProps {
  title: string;
  image: string | null;
  address: string;
  category: string;
}

export default function PlaceHero({
  title,
  image,
  address,
  category,
}: PlaceHeroProps) {
  return (
    <section className="mb-8">
      {image && (
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        </div>
      )}
      <Badge variant="secondary" className="mb-2">
        {category}
      </Badge>
      <h1 className="mb-2 text-3xl font-bold">{title}</h1>
      {address && <p className="text-muted-foreground">{address}</p>}
    </section>
  );
}
