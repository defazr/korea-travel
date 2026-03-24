"""
One-time migration: fix slugs that contain non-ASCII characters.
Regenerates slugs using ASCII-only to_slug function.
"""

from config import get_db, to_slug


def fix_slugs():
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT content_id, title, slug FROM places")
    rows = cur.fetchall()

    fixed = 0
    for content_id, title, old_slug in rows:
        new_slug = to_slug(title) or f"place-{content_id}"
        new_slug = f"{new_slug}-{content_id}"

        if new_slug != old_slug:
            cur.execute(
                "UPDATE places SET slug = %s WHERE content_id = %s",
                (new_slug, content_id),
            )
            fixed += 1

    db.commit()
    cur.close()
    db.close()
    print(f"Fixed {fixed} / {len(rows)} slugs.")


if __name__ == "__main__":
    fix_slugs()
