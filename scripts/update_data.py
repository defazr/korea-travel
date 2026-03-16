"""
Daily data update script. Run via cron:
0 3 * * * cd /var/www/korea-travel && python3 scripts/update_data.py

This runs all crawlers in sequence to fetch new/updated data.
"""

import subprocess
import sys
from datetime import datetime


def run_script(name: str):
    print(f"\n{'='*50}")
    print(f"Running {name} at {datetime.now()}")
    print(f"{'='*50}")
    result = subprocess.run(
        [sys.executable, f"scripts/{name}"],
        capture_output=False,
    )
    if result.returncode != 0:
        print(f"WARNING: {name} exited with code {result.returncode}")


def main():
    print(f"Data update started at {datetime.now()}")

    run_script("fetch_area_list.py")
    run_script("fetch_detail_common.py")
    run_script("fetch_detail_intro.py")
    run_script("fetch_images.py")

    print(f"\nData update completed at {datetime.now()}")


if __name__ == "__main__":
    main()
