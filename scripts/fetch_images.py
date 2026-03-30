"""
Fetch detailImage for all places and store into place_images table.
Usage: python3 scripts/fetch_images.py [--limit 100]
"""

import argparse
import time
from config import get_db, api_request, QuotaExhaustedError


def fetch_images(limit: int | None = None):
    """Fetch images for places without images."""
    db = get_db()
    cur = db.cursor()

    query = """
        SELECT p.content_id
        FROM places p
        LEFT JOIN place_images pi ON p.content_id = pi.content_id
        WHERE pi.content_id IS NULL
    """
    if limit:
        query += f" LIMIT {limit}"

    cur.execute(query)
    places = cur.fetchall()
    print(f"Found {len(places)} places without images")

    saved = 0
    for i, (content_id,) in enumerate(places):
        try:
            body = api_request("detailImage2", {
                "contentId": content_id,
                "imageYN": "Y",
                "subImageYN": "Y",
            })
        except QuotaExhaustedError as e:
            print(f"\n{e}")
            print(f"  Saved {saved}/{len(places)} before quota ran out.")
            break

        items = body.get("items", {}).get("item", [])
        if isinstance(items, dict):
            items = [items]

        for j, item in enumerate(items):
            image_url = item.get("originimgurl")
            if not image_url:
                continue

            cur.execute("""
                INSERT INTO place_images (content_id, image_url, is_main)
                VALUES (%s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (content_id, image_url, j == 0))

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
    fetch_images(args.limit)
