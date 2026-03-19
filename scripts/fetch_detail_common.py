"""
Fetch detailCommon for all places and store into place_details table.
Usage: python3 scripts/fetch_detail_common.py [--limit 100]
"""

import argparse
import time
from config import get_db, api_request, QuotaExhaustedError


def fetch_detail_common(limit: int | None = None):
    """Fetch detail info for places missing details."""
    db = get_db()
    cur = db.cursor()

    # Find places without details
    query = """
        SELECT p.content_id, p.content_type_id
        FROM places p
        LEFT JOIN place_details pd ON p.content_id = pd.content_id
        WHERE pd.content_id IS NULL
    """
    if limit:
        query += f" LIMIT {limit}"

    cur.execute(query)
    places = cur.fetchall()
    print(f"Found {len(places)} places without details")

    saved = 0
    for i, (content_id, content_type_id) in enumerate(places):
        try:
            body = api_request("detailCommon2", {
                "contentId": content_id,
            })
        except QuotaExhaustedError as e:
            print(f"\n{e}")
            print(f"  Saved {saved}/{len(places)} before quota ran out.")
            break

        if not isinstance(body, dict):
            if (i + 1) % 50 == 0:
                print(f"  Processed {i + 1}/{len(places)}, saved {saved}")
            time.sleep(1)
            continue

        items = body.get("items", {}).get("item", [])
        if isinstance(items, dict):
            items = [items]

        if items:
            item = items[0]
            cur.execute("""
                INSERT INTO place_details (content_id, overview, homepage)
                VALUES (%s, %s, %s)
                ON CONFLICT (content_id) DO UPDATE SET
                    overview = EXCLUDED.overview,
                    homepage = EXCLUDED.homepage
            """, (
                content_id,
                item.get("overview"),
                item.get("homepage"),
            ))
            db.commit()
            saved += 1

        if (i + 1) % 50 == 0:
            print(f"  Processed {i + 1}/{len(places)}, saved {saved}")

        time.sleep(1)  # Rate limiting — 1 req/sec

    cur.close()
    db.close()
    print(f"\nDone. Saved {saved}/{len(places)} places.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, help="Max places to process")
    args = parser.parse_args()
    fetch_detail_common(args.limit)
