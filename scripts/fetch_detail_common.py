"""
Fetch detailCommon for all places and store into place_details table.
Usage: python3 scripts/fetch_detail_common.py [--limit 100]
"""

import argparse
import time
from config import get_db, api_request, QuotaExhaustedError

# 148 content_ids that permanently return empty/broken responses from TourAPI detailCommon.
# Confirmed over 5+ consecutive runs (2026-03-25 ~ 2026-03-30). Excluded to save quota.
SKIP_CONTENT_IDS = {
    822907, 3098620, 3109975, 2681836, 2478901, 3111191, 926688, 2700275,
    3095041, 3110056, 3097476, 3097134, 2659076, 3110029, 3095251, 274400,
    3099732, 3095212, 1337063, 3110618, 1024682, 3110086, 1365759, 3110943,
    3095088, 2668106, 2689284, 1334709, 3111194, 2671251, 2695697, 3095128,
    3102637, 3095220, 3110462, 3111103, 2686606, 3095261, 2672766, 351117,
    3095218, 1366046, 3095257, 1755406, 2696100, 3110437, 2686822, 3110532,
    1365269, 2685821, 3098567, 1065432, 2659716, 2658756, 3095258, 3110677,
    2659726, 932560, 2665666, 3110540, 3095245, 2700816, 2693075, 2709979,
    3110069, 2700071, 2685860, 2472978, 2676953, 3110732, 3109974, 2682210,
    2692633, 2687175, 3098415, 3095196, 398458, 3110583, 349028, 3110598,
    3095051, 3109999, 2480848, 3111133, 3095246, 3095244, 2672966, 2672954,
    3103031, 3110996, 2473015, 2481001, 3095080, 1810927, 2658967, 2659320,
    1962414, 1065450, 2668885, 2442590, 3095199, 2952457, 3480194, 3482788,
    3108100, 1802938, 3095216, 3111216, 3098588, 2701268, 2681810, 2696072,
    3109899, 1945709, 3110557, 3098601, 3110524, 3110567, 351034, 2590011,
    3338417, 293085, 997163, 1663903, 1753001, 1770428, 2622622, 264317,
    1924857, 815935, 2031679, 1065200, 264587, 2027452, 1056860, 264612,
    1917319, 1875262, 3031754, 1635452, 1407491, 1030384, 1343427, 1145438,
    1268339, 1799331, 3109910, 3111131,
}


def fetch_detail_common(limit: int | None = None):
    """Fetch detail info for places missing details."""
    db = get_db()
    cur = db.cursor()

    # Find places without details (excluding permanently broken IDs)
    query = """
        SELECT p.content_id, p.content_type_id
        FROM places p
        LEFT JOIN place_details pd ON p.content_id = pd.content_id
        WHERE pd.content_id IS NULL
          AND p.content_id != ALL(%s)
    """
    if limit:
        query += f" LIMIT {limit}"

    cur.execute(query, (list(SKIP_CONTENT_IDS),))
    places = cur.fetchall()
    print(f"Found {len(places)} places without details")

    saved = 0
    skipped = []
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
            skipped.append(content_id)
            print(f"  Skipped content_id={content_id} (invalid response)")
            time.sleep(0.3)
            continue

        items_wrap = body.get("items", {})
        if not isinstance(items_wrap, dict):
            skipped.append(content_id)
            print(f"  Skipped content_id={content_id} (items not dict)")
            time.sleep(0.3)
            continue

        items = items_wrap.get("item", [])
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

        time.sleep(0.3)  # Rate limiting — operational account

    cur.close()
    db.close()
    print(f"\nDone. Saved {saved}/{len(places)} places.")
    if skipped:
        print(f"Skipped {len(skipped)} items (will retry next run): {skipped[:20]}{'...' if len(skipped) > 20 else ''}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=2000, help="Max places to process (default: 2000)")
    args = parser.parse_args()
    fetch_detail_common(args.limit)
