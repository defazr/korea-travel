"""
TourAPI configuration and shared utilities.
Set TOURAPI_KEY environment variable before running crawlers.
"""

import os
import re
import time
import requests
import psycopg2

# TourAPI
TOURAPI_KEY = os.environ.get("TOURAPI_KEY", "")
TOURAPI_BASE = "http://apis.data.go.kr/B551011/EngService1"

# Database
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", "5432")),
    "dbname": os.environ.get("DB_NAME", "korea_travel"),
    "user": os.environ.get("DB_USER", "postgres"),
    "password": os.environ.get("DB_PASSWORD", ""),
}

# Content type mapping
CONTENT_TYPE_MAP = {
    12: "attractions",
    14: "culture",
    15: "festivals",
    25: "courses",
    28: "leisure",
    32: "hotels",
    38: "shopping",
    39: "restaurants",
}


def get_db():
    """Get a database connection."""
    return psycopg2.connect(**DB_CONFIG)


def to_slug(title: str) -> str:
    """Convert title to URL-friendly slug."""
    slug = title.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip("-")
    return slug


def api_request(endpoint: str, params: dict) -> dict:
    """Make a TourAPI request with retry logic."""
    params["serviceKey"] = TOURAPI_KEY
    params["MobileOS"] = "ETC"
    params["MobileApp"] = "KoreaTravel"
    params["_type"] = "json"

    url = f"{TOURAPI_BASE}/{endpoint}"

    for attempt in range(3):
        try:
            resp = requests.get(url, params=params, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", {}).get("body", {})
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(2 ** attempt)

    return {}
