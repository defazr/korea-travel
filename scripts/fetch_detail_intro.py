"""
Fetch detailIntro for all places and update place_details table.
Usage: python3 scripts/fetch_detail_intro.py [--limit 100]
"""

import argparse
import time
from config import get_db, api_request, QuotaExhaustedError, SKIP_CONTENT_IDS


def fetch_detail_intro(limit: int | None = None):
    """Fetch intro details (open_time, parking, etc.) for places."""
    db = get_db()
    cur = db.cursor()

    query = """
        SELECT p.content_id, p.content_type_id
        FROM places p
        JOIN place_details pd ON p.content_id = pd.content_id
        WHERE pd.open_time IS NULL AND pd.use_time IS NULL
          AND p.content_id != ALL(%s)
    """
    if limit:
        query += f" LIMIT {limit}"

    cur.execute(query, (list(SKIP_CONTENT_IDS),))
    places = cur.fetchall()
    print(f"Found {len(places)} places without intro details")

    saved = 0
    for i, (content_id, content_type_id) in enumerate(places):
        try:
            body = api_request("detailIntro2", {
                "contentId": content_id,
                "contentTypeId": content_type_id,
            })
        except QuotaExhaustedError as e:
            print(f"\n{e}")
            print(f"  Saved {saved}/{len(places)} before quota ran out.")
            break

        items = body.get("items", {}).get("item", [])
        if isinstance(items, dict):
            items = [items]

        if items:
            item = items[0]
            # Field names vary by content type
            open_time = (
                item.get("usetime") or
                item.get("opentime") or
                item.get("usetimeculture") or
                item.get("playtime") or
                item.get("opentimefood")
            )
            rest_date = (
                item.get("restdate") or
                item.get("restdateculture") or
                item.get("restdatefood")
            )
            parking = (
                item.get("parking") or
                item.get("parkingculture") or
                item.get("parkingfood")
            )
            use_time = item.get("usefee") or item.get("usetimefestival")

            cur.execute("""
                UPDATE place_details
                SET open_time = %s, rest_date = %s, parking = %s, use_time = %s
                WHERE content_id = %s
            """, (open_time, rest_date, parking, use_time, content_id))
            db.commit()
            saved += 1

        if (i + 1) % 50 == 0:
            print(f"  Processed {i + 1}/{len(places)}, saved {saved}")

        time.sleep(0.3)  # Rate limiting — operational account

    cur.close()
    db.close()
    print(f"\nDone. Saved {saved}/{len(places)} places.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=2000, help="Max places to process (default: 2000)")
    args = parser.parse_args()
    fetch_detail_intro(args.limit)
