"""
Fetch detailImage for all places and store into place_images table.
Usage: python3 scripts/fetch_images.py [--limit 100]
"""

import argparse
import time
from config import get_db, api_request


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

    for i, (content_id,) in enumerate(places):
        body = api_request("detailImage1", {
            "contentId": content_id,
            "imageYN": "Y",
            "subImageYN": "Y",
        })

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

        if (i + 1) % 50 == 0:
            print(f"  Processed {i + 1}/{len(places)}")

        time.sleep(0.1)

    cur.close()
    db.close()
    print(f"\nDone. Processed {len(places)} places.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, help="Max places to process")
    args = parser.parse_args()
    fetch_images(args.limit)
