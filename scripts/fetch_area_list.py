"""
Fetch areaBasedList from TourAPI and store into places table.
Usage: python3 scripts/fetch_area_list.py [--content-type 12]
"""

import argparse
from config import get_db, to_slug, api_request, CONTENT_TYPE_MAP


def fetch_area_list(content_type_id: int | None = None):
    """Fetch places from areaBasedList2 endpoint."""
    db = get_db()
    cur = db.cursor()

    types = [content_type_id] if content_type_id else list(CONTENT_TYPE_MAP.keys())

    for ctype in types:
        print(f"\nFetching contentTypeId={ctype} ({CONTENT_TYPE_MAP.get(ctype, 'unknown')})")
        page = 1
        total_inserted = 0

        while True:
            body = api_request("areaBasedList2", {
                "contentTypeId": ctype,
                "numOfRows": 100,
                "pageNo": page,
                "arrange": "A",
            })

            raw_items = body.get("items", "")
            if not raw_items or not isinstance(raw_items, dict):
                break
            items = raw_items.get("item", [])
            if not items:
                break

            if isinstance(items, dict):
                items = [items]

            for item in items:
                content_id = item.get("contentid")
                title = item.get("title", "")
                if not content_id or not title:
                    continue

                slug = to_slug(title) or f"place-{content_id}"
                # Append content_id to ensure uniqueness
                slug = f"{slug}-{content_id}"

                def n(v):
                    """Convert empty string to None."""
                    return v if v else None

                cur.execute("""
                    INSERT INTO places (content_id, content_type_id, title, slug, addr1, addr2,
                                       area_code, sigungucode, mapx, mapy, tel, first_image)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (content_id) DO UPDATE SET
                        title = EXCLUDED.title,
                        slug = EXCLUDED.slug,
                        addr1 = EXCLUDED.addr1,
                        mapx = EXCLUDED.mapx,
                        mapy = EXCLUDED.mapy,
                        first_image = EXCLUDED.first_image
                """, (
                    content_id,
                    n(item.get("contenttypeid")),
                    title,
                    slug,
                    n(item.get("addr1")),
                    n(item.get("addr2")),
                    n(item.get("areacode")),
                    n(item.get("sigungucode")),
                    n(item.get("mapx")),
                    n(item.get("mapy")),
                    n(item.get("tel")),
                    n(item.get("firstimage")),
                ))
                total_inserted += 1

            db.commit()
            total = int(body.get("totalCount", 0))
            print(f"  Page {page}: {len(items)} items (total in API: {total})")

            if page * 100 >= total:
                break
            page += 1

        print(f"  Total inserted/updated: {total_inserted}")

    cur.close()
    db.close()
    print("\nDone.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--content-type", type=int, help="Specific contentTypeId to fetch")
    args = parser.parse_args()
    fetch_area_list(args.content_type)
