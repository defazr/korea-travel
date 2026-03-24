"""
TourAPI configuration and shared utilities.
Set TOURAPI_KEY environment variable before running crawlers.
"""

import os
import re
import time
from pathlib import Path

import requests
import psycopg2
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# TourAPI
TOURAPI_KEY = os.environ.get("TOURAPI_KEY", "")
TOURAPI_BASE = "https://apis.data.go.kr/B551011/EngService2"

# Database
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", "5432")),
    "dbname": os.environ.get("DB_NAME", "korea_travel"),
    "user": os.environ.get("DB_USER", "postgres"),
    "password": os.environ.get("DB_PASSWORD", ""),
}

# Content type mapping (EngService2)
CONTENT_TYPE_MAP = {
    75: "courses",
    76: "attractions",
    77: "leisure",
    78: "culture",
    79: "shopping",
    80: "hotels",
    82: "restaurants",
    85: "festivals",
}


def get_db():
    """Get a database connection."""
    return psycopg2.connect(**DB_CONFIG)


def to_slug(title: str) -> str:
    """Convert title to URL-friendly slug (ASCII only)."""
    slug = title.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    slug = slug.strip("-")
    return slug


class QuotaExhaustedError(Exception):
    """Raised when TourAPI daily quota is exhausted."""
    pass


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
            if resp.status_code == 429:
                body_text = resp.text.strip().lower()
                if "quota" in body_text or "exceeded" in body_text:
                    raise QuotaExhaustedError(
                        "TourAPI daily quota exhausted. Wait until midnight KST for reset."
                    )
                wait = 10 * (attempt + 1)
                print(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", {}).get("body", {})
        except QuotaExhaustedError:
            raise
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(3 * (attempt + 1))

    return {}
