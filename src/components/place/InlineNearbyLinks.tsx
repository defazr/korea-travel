import Link from "next/link";
import { CONTENT_TYPE_MAP, AREA_CODE_MAP } from "@/lib/constants";

interface NearbyPlace {
  title: string;
  slug: string;
  content_type_id: number;
  area_code: number;
}

interface InlineNearbyLinksProps {
  nearby: NearbyPlace[];
  lang: string;
}

export default function InlineNearbyLinks({ nearby, lang }: InlineNearbyLinksProps) {
  const filtered = nearby
    .filter((p) => p.title.length <= 60 && p.slug && p.area_code)
    .slice(0, 3);

  if (filtered.length < 2) return null;

  const buildHref = (p: NearbyPlace) => {
    const city = AREA_CODE_MAP[p.area_code] || "seoul";
    const category = CONTENT_TYPE_MAP[p.content_type_id] || "attractions";
    return `/${lang}/${city}/${category}/${p.slug}`;
  };

  return (
    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
      {"Visitors also explore "}
      {filtered.map((place, i) => (
        <span key={place.slug}>
          {i > 0 && i === filtered.length - 1 && " and "}
          {i > 0 && i < filtered.length - 1 && ", "}
          <Link
            href={buildHref(place)}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            {place.title}
          </Link>
        </span>
      ))}
      {" near this location."}
    </p>
  );
}
