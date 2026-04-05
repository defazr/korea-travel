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


# 148 content_ids that permanently return empty/broken responses from TourAPI.
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
