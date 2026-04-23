"""
Generate AI summaries for place_details using local Ollama (gemma4).
Requires SSH tunnel: ssh -L 5433:localhost:5432 root@141.164.41.235
"""

import argparse
import re
import time

import psycopg2
import requests

# Content type → human-readable category for prompt
CATEGORY_MAP = {
    75: "Travel Course",
    76: "Attraction",
    77: "Leisure Activity",
    78: "Cultural Site",
    79: "Shopping",
    80: "Hotel",
    82: "Restaurant",
    85: "Festival",
}

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "dbname": "korea_travel",
    "user": "postgres",
    "password": "postgres",
}

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma4"


def strip_html(text: str) -> str:
    """Remove HTML tags from text."""
    return re.sub(r"<[^>]*>", "", text).strip()


def generate_summary(title: str, overview: str, category: str) -> str | None:
    """Call Ollama API with retry."""
    clean_overview = strip_html(overview)[:500]

    prompt = f"""You are a travel guide writer. Based on the following information about a place in Korea, write a brief, helpful summary for international tourists. Include: what to expect, who should visit, and best timing if possible. Keep it under 100 words. Write naturally, not as bullet points. Vary sentence structure and avoid repeating patterns across entries.

Place: {title}
Category: {category}
Description: {clean_overview}"""

    for attempt in range(2):
        try:
            resp = requests.post(
                OLLAMA_URL,
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
                timeout=30,
            )
            resp.raise_for_status()
            summary = resp.json().get("response", "").strip()
            return summary
        except Exception as e:
            if attempt == 0:
                print(f"  Retry after error: {e}")
                time.sleep(2)
            else:
                print(f"  Failed: {e}")
                return None


def main():
    parser = argparse.ArgumentParser(description="Generate AI summaries via Ollama")
    parser.add_argument("--limit", type=int, default=50, help="Number of places to process")
    args = parser.parse_args()

    db = psycopg2.connect(**DB_CONFIG)
    cur = db.cursor()

    cur.execute(
        """
        SELECT p.content_id, p.title, p.content_type_id, pd.overview
        FROM places p
        JOIN place_details pd ON p.content_id = pd.content_id
        WHERE pd.overview IS NOT NULL
          AND LENGTH(pd.overview) > 100
          AND pd.ai_summary IS NULL
        ORDER BY p.content_id
        LIMIT %s
        """,
        (args.limit,),
    )
    rows = cur.fetchall()
    print(f"Found {len(rows)} places to summarize (limit={args.limit})")

    done = 0
    errors = 0

    for i, (content_id, title, content_type_id, overview) in enumerate(rows, 1):
        category = CATEGORY_MAP.get(content_type_id, "Place")
        summary = generate_summary(title, overview, category)

        if summary is None or len(summary) < 50:
            print(f"  Skipped {content_id}: summary too short or empty")
            errors += 1
            continue

        cur.execute(
            "UPDATE place_details SET ai_summary = %s WHERE content_id = %s",
            (summary, content_id),
        )
        done += 1

        if done % 20 == 0:
            db.commit()

        if i % 50 == 0:
            print(f"  Progress: {i}/{len(rows)} (done={done}, errors={errors})")

        time.sleep(0.5)

    db.commit()
    cur.close()
    db.close()

    print(f"\nComplete: {done} saved, {errors} skipped, {len(rows)} total")


if __name__ == "__main__":
    main()
