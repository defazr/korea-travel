import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { AREA_CODE_MAP, CONTENT_TYPE_MAP } from "@/lib/constants";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("q");

  if (!keyword || keyword.length < 2) {
    return NextResponse.json([]);
  }

  const result = await query(
    `SELECT content_id, title, slug, area_code, content_type_id
     FROM places
     WHERE title ILIKE '%' || $1 || '%'
     ORDER BY (first_image IS NOT NULL) DESC, title
     LIMIT 10`,
    [keyword]
  );

  const items = result.rows.map((row) => ({
    contentId: row.content_id,
    title: row.title,
    slug: row.slug,
    city: AREA_CODE_MAP[row.area_code] || "seoul",
    category: CONTENT_TYPE_MAP[row.content_type_id] || "attractions",
  }));

  return NextResponse.json(items);
}
