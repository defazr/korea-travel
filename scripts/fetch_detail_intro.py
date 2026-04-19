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
    errors = 0
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
        except Exception as e:
            print(f"  Error fetching {content_id}: {e}")
            errors += 1
            time.sleep(0.5)
            continue

        if not isinstance(body, dict):
            print(f"  Unexpected response for {content_id}: {str(body)[:200]}")
            errors += 1
            time.sleep(0.5)
            continue

        items_wrap = body.get("items", {})
        if not isinstance(items_wrap, dict):
            items = []
        else:
            items = items_wrap.get("item", [])
            if isinstance(items, dict):
                items = [items]

        # Extract fields — default to '' so NULL rows aren't re-processed
        open_time = ''
        rest_date = ''
        parking = ''
        use_time = ''

        if items:
            item = items[0]
            # Field names vary by content type:
            # 75 courses: usetimeleports, restdateleports, parkingleports, usefeeleports
            # 76 attractions: usetime, restdate, parking, usefee
            # 77 leisure: operationtimetraffic, parkingtraffic
            # 78 culture: usetimeculture, restdateculture, parkingculture, usefee
            # 79 shopping: opentime, restdateshopping, parkingshopping
            # 80 hotels: checkintime/checkouttime, parkinglodging
            # 82 restaurants: opentimefood, restdatefood, parkingfood
            # 85 festivals: playtime, usetimefestival
            open_time = (
                item.get("usetime") or
                item.get("opentime") or
                item.get("usetimeculture") or
                item.get("playtime") or
                item.get("opentimefood") or
                item.get("usetimeleports") or
                item.get("operationtimetraffic") or
                item.get("checkintime") or
                ''
            )
            rest_date = (
                item.get("restdate") or
                item.get("restdateculture") or
                item.get("restdatefood") or
                item.get("restdateshopping") or
                item.get("restdateleports") or
                ''
            )
            parking = (
                item.get("parking") or
                item.get("parkingculture") or
                item.get("parkingfood") or
                item.get("parkingshopping") or
                item.get("parkinglodging") or
                item.get("parkingleports") or
                item.get("parkingtraffic") or
                ''
            )
            use_time = (
                item.get("usefee") or
                item.get("usetimefestival") or
                item.get("usefeeleports") or
                ''
            )

        try:
            cur.execute("""
                UPDATE place_details
                SET open_time = %s, rest_date = %s, parking = %s, use_time = %s
                WHERE content_id = %s
            """, (open_time, rest_date, parking, use_time, content_id))
            db.commit()
            saved += 1
        except Exception as e:
            db.rollback()
            print(f"  DB error for {content_id}: {e}")
            errors += 1

        if (i + 1) % 50 == 0:
            print(f"  Processed {i + 1}/{len(places)}, saved {saved}, errors {errors}")

        time.sleep(0.3)  # Rate limiting — operational account

    cur.close()
    db.close()
    print(f"\nDone. Saved {saved}/{len(places)} places. Errors: {errors}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=2000, help="Max places to process (default: 2000)")
    args = parser.parse_args()
    fetch_detail_intro(args.limit)
