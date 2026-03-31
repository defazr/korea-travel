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
    images_total = 0
    no_images = 0
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

        # Debug: log first 3 responses to see API structure
        if i < 3:
            print(f"  DEBUG content_id={content_id}: items type={type(body.get('items')).__name__}, body keys={list(body.keys())[:5]}")

        items_wrap = body.get("items", {})
        if not isinstance(items_wrap, dict):
            no_images += 1
            db.commit()
            saved += 1
            if (i + 1) % 50 == 0:
                print(f"  Processed {i + 1}/{len(places)}, saved {saved}, images {images_total}, no_images {no_images}")
            time.sleep(0.3)
            continue

        items = items_wrap.get("item", [])
        if isinstance(items, dict):
            items = [items]

        count = 0
        for j, item in enumerate(items):
            image_url = item.get("originimgurl")
            if not image_url:
                continue

            cur.execute("""
                INSERT INTO place_images (content_id, image_url, is_main)
                VALUES (%s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (content_id, image_url, j == 0))
            count += 1

        if count == 0:
            no_images += 1
        images_total += count
        db.commit()
        saved += 1

        if (i + 1) % 50 == 0:
            print(f"  Processed {i + 1}/{len(places)}, saved {saved}, images {images_total}, no_images {no_images}")

        time.sleep(0.3)  # Rate limiting — operational account

    cur.close()
    db.close()
    print(f"\nDone. Processed {saved}/{len(places)} places. Images inserted: {images_total}. Places without images: {no_images}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=2000, help="Max places to process (default: 2000)")
    args = parser.parse_args()
    fetch_images(args.limit)
