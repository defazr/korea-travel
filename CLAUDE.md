# Korea Travel Data Platform — SSOT v2

Repository: https://github.com/defazr/korea-travel

## Project Overview

Data-driven Korea travel platform for international users.
Automatically generates thousands of pages using Korea Tourism Organization TourAPI data.

- SEO-driven travel database (NOT a blog)
- Target: international tourists
- English first, Korean optional
- Data platform with 15,000+ auto-generated place pages

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router, React 19.2.3)
- **Styling**: Tailwind CSS 4, shadcn/ui, tw-animate-css
- **Database**: PostgreSQL (pg 8.20.0)
- **Data Crawler**: Python 3
- **Server**: Vultr (Ubuntu 22.04, 1 vCPU, 2GB RAM, 64GB NVMe)
- **Process Manager**: PM2
- **Reverse Proxy**: Apache (mod_proxy)
- **Map**: OpenStreetMap (iframe embed)
- **Icons**: Lucide React

## Server Info

- IP: 141.164.41.235
- App path: /var/www/korea-travel
- Next.js runs on port 3000 (PM2, fork mode)
- Apache proxies external traffic to localhost:3000 (no Nginx installed)
- DB: PostgreSQL on localhost:5432, database `korea_travel`, user `postgres`

## Domain Strategy

- Testing: travel.in-book.co.kr, travel.fazr.co.kr
- Production: explorekorea.com
- Migration: 301 redirect

## Git Workflow

Never push directly to main. Always:

```bash
git checkout -b feat/feature-name
git commit
git push -u origin branch
gh pr create
```

## Project Structure

```
korea-travel/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Homepage
│   │   ├── layout.tsx                        # Root layout
│   │   ├── robots.ts                         # robots.txt
│   │   ├── sitemap.ts                        # Dynamic sitemap (all 15k+ pages)
│   │   └── [lang]/
│   │       └── [city]/
│   │           ├── page.tsx                  # City page (top 6 per category)
│   │           └── [category]/
│   │               ├── page.tsx              # Category listing (up to 100 places)
│   │               └── [slug]/
│   │                   └── page.tsx          # Place detail page
│   ├── components/
│   │   ├── place/                            # PlaceHero, PlaceInfo, PlaceMap, NearbySection
│   │   └── city/                             # CityHero, CategorySection
│   ├── lib/
│   │   ├── queries.ts                        # DB queries (getPlaceBySlug, getNearbyPlaces, etc.)
│   │   ├── constants.ts                      # CONTENT_TYPE_MAP, AREA_CODE_MAP, LANGUAGES
│   │   ├── slug.ts                           # toSlug() function
│   │   ├── image.ts                          # PLACEHOLDER_IMAGE constant
│   │   └── utils.ts                          # cn() utility
│   └── db/
│       ├── connection.ts                     # PostgreSQL Pool (pg library)
│       └── schema.sql                        # DB schema
├── scripts/
│   ├── config.py                             # API key, DB config
│   ├── fetch_area_list.py                    # Fetch place list from TourAPI
│   ├── fetch_detail_common.py                # Fetch detail data (cron job)
│   ├── fetch_detail_intro.py                 # Fetch intro data
│   ├── fetch_images.py                       # Fetch image data
│   ├── fix_slugs.py                          # Slug repair script
│   └── update_data.py                        # Data update utility
├── next.config.ts                            # Image domains: tong.visitkorea.or.kr, images.unsplash.com
├── package.json
└── CLAUDE.md
```

## URL Structure & Routing

`/[lang]/[city]/[category]/[slug]`

Examples:
- /en/seoul/attractions/gyeongbokgung-palace-264337
- /en/seoul/restaurants/myeongdong-kyoja-774785
- /en/busan/festivals/busan-international-film-festival-900170

**Important**: Slug always includes content_id suffix (e.g. `gyeongbokgung-palace-264337`, NOT `gyeongbokgung-palace`).

### Routing Flow

```
URL → Next.js Router → [lang]/[city]/[category]/[slug]/page.tsx
  → getPlaceBySlug(slug) — DB lookup by slug only
  → if null → notFound() → 404
  → if found → fetch details, images, nearby in parallel
  → render PlaceHero, PlaceInfo, PlaceMap, NearbySection
```

Important: The page does NOT validate city/category against the place data. It only checks if slug exists in DB.

## Content Type Mapping (EngService2)

| contentTypeId | Category    |
|---------------|-------------|
| 75            | courses     |
| 76            | attractions |
| 77            | leisure     |
| 78            | culture     |
| 79            | shopping    |
| 80            | hotels      |
| 82            | restaurants |
| 85            | festivals   |

## Area Code Mapping

| Code | City       |
|------|------------|
| 1    | seoul      |
| 2    | incheon    |
| 3    | daejeon    |
| 4    | daegu      |
| 5    | gwangju    |
| 6    | busan      |
| 7    | ulsan      |
| 8    | sejong     |
| 31   | gyeonggi   |
| 32   | gangwon    |
| 33   | chungbuk   |
| 34   | chungnam   |
| 35   | gyeongbuk  |
| 36   | gyeongnam  |
| 37   | jeonbuk    |
| 38   | jeonnam    |
| 39   | jeju       |

## Database

### Connection

- File: `src/db/connection.ts`
- Uses `pg` Pool with env vars: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- Defaults: localhost:5432, korea_travel, postgres, empty password
- Server .env has password set to `postgres`

### Tables

**places** (Primary key: content_id, Unique index: slug)
- content_id BIGINT PK
- content_type_id INTEGER NOT NULL
- title VARCHAR(500) NOT NULL
- slug VARCHAR(500) NOT NULL UNIQUE
- addr1, addr2 VARCHAR(500)
- area_code INTEGER, sigungucode INTEGER
- mapx DOUBLE PRECISION, mapy DOUBLE PRECISION
- tel VARCHAR(200), first_image TEXT
- created_at TIMESTAMP

**place_details** (FK: content_id)
- content_id BIGINT PK
- overview TEXT, homepage TEXT
- open_time, rest_date, parking, use_time TEXT

**place_images**
- id SERIAL PK, content_id BIGINT
- image_url TEXT, is_main BOOLEAN

### Key Queries (src/lib/queries.ts)

- `getPlaceBySlug(slug)` — WHERE slug = $1, no try/catch (throws on DB error)
- `getPlaceDetails(contentId)` — place_details by content_id
- `getPlaceImages(contentId)` — place_images ordered by is_main DESC
- `getNearbyPlaces(mapx, mapy, radiusKm, excludeId, limit)` — geographic distance calc
- `getPlacesByCategory(areaCode, contentTypeId, limit, offset)` — paginated listing
- `getAllPlacesForSitemap()` — slug, area_code, content_type_id for all places

## Data Pipeline

```
TourAPI → Python crawler → PostgreSQL → Next.js pages
```

Data must NOT be fetched in real time. All data is pre-crawled and stored in PostgreSQL.

## Data Source

Korea Tourism Organization TourAPI

- APIs: areaBasedList, detailCommon, detailIntro, detailImage
- Language: English API first (EngService2)
- Key identifier: contentId (shared across languages)

## Crawler Settings

- Account: data.go.kr 운영계정 승인 완료
- API Service: EngService2 (영문 관광정보서비스_GW)
- Sleep: 0.3s (operational account)
- Default limit: 2000 per cron run
- Cron: `0 16 * * *` (UTC 16:00 = KST 01:00, daily)
- Safety: QuotaExhaustedError on 429 → auto-stop
- 실제 일일 수집량: ~900건 (quota 제한, 설정은 2000이지만 ~900에서 소진)

### EngService2 Parameter Notes

EngService2 does NOT support several parameters that KorService does:
- `detailCommon2`: Do NOT pass `contentTypeId`, `defaultYN`, `overviewYN`
- `detailImage2`: Do NOT pass `subImageYN`
- `detailIntro2`: **May need testing** — check if `contentTypeId` works (it's required per docs but verify)

### Data Collection Status (2026-04-05)

| Step | Script | Status |
|------|--------|--------|
| 1. Place list | fetch_area_list.py | ✅ COMPLETE (15,272 places) |
| 2. Detail common | fetch_detail_common.py | ✅ COMPLETE (overview, homepage) |
| 3. Images | fetch_images.py | ✅ COMPLETE (place_images populated) |
| 4. Detail intro | fetch_detail_intro.py | ⏳ NEXT (open_time, rest_date, parking, use_time) |

### Cron Job — NEEDS UPDATE

Current cron runs `fetch_images.py` (completed). Switch to `fetch_detail_intro.py`:

```bash
# Current (OUTDATED):
0 16 * * * cd /var/www/korea-travel && git pull origin claude/add-github-repo-url-knsbO >> /var/log/korea-travel-cron.log 2>&1 && cd scripts && python3 fetch_images.py >> /var/log/korea-travel-cron.log 2>&1

# New (switch to detail_intro):
0 16 * * * cd /var/www/korea-travel && git pull >> /var/log/korea-travel-cron.log 2>&1 && cd scripts && python3 fetch_detail_intro.py >> /var/log/korea-travel-cron.log 2>&1
```

To update: `crontab -e` on server and replace the line.

### Server Aliases (~/.bashrc)

```bash
alias 진행률='sudo -u postgres psql -d korea_travel -c "SELECT (SELECT COUNT(*) FROM place_images) as images, (SELECT COUNT(*) FROM place_details) as details, (SELECT COUNT(*) FROM places) as total"'
alias 로그='tail -10 /var/log/korea-travel-cron.log'
alias 남은거='sudo -u postgres psql -d korea_travel -c "SELECT COUNT(*) FROM places p LEFT JOIN place_images pi ON p.content_id = pi.content_id WHERE pi.content_id IS NULL"'
```

### Known Issues in Crawlers

- 148 content_ids permanently return broken responses from detailCommon2 — excluded in `SKIP_CONTENT_IDS` set in `fetch_detail_common.py`
- Places with no images get a `'none'` marker row in place_images to prevent re-fetching
- `queries.ts` filters these out: `WHERE image_url != 'none'`

## Image Strategy

- Priority: TourAPI images > fallback (Unsplash placeholder)
- Store only image_url — do not download images
- Next.js Image allowed domains: tong.visitkorea.or.kr, images.unsplash.com

## Internal Linking

Each place page shows nearby places within 5km radius using mapx/mapy coordinates (getNearbyPlaces query).

## SEO

- Dynamic sitemap at /sitemap.xml (homepage + 17 cities + 136 categories + all places)
- JSON-LD structured data on every page (TouristAttraction, Hotel, Restaurant, etc.)
- ISR: revalidate = 3600 (1 hour)
- robots.txt allows all bots

## PM2 Commands

```bash
pm2 start npm --name korea-travel -- start    # Start
pm2 restart korea-travel                       # Restart
pm2 logs korea-travel --lines 50               # View logs
pm2 status                                     # Check status
```

## PostgreSQL Access (Server)

```bash
# Direct access (peer auth requires sudo)
sudo -u postgres psql -d korea_travel

# TCP access (uses password from .env)
psql -U postgres -d korea_travel -h 127.0.0.1
```

## Data Volume

- Current: 15,272 places
- Long term: 20,000+ pages
- Traffic target: 100k → 1M monthly visitors

---

## Resolved Issues

### 404 Issue — RESOLVED (2026-03-25)

**Problem**: Some place pages returning 404 when accessed externally.

**Root cause**: Not a bug. Slug format includes content_id suffix.
- `gyeongbokgung-palace` → 404 (incomplete slug)
- `gyeongbokgung-palace-264337` → 200 (correct slug with content_id)

**Server investigation results**:
- Nginx is NOT installed on this server
- Apache is the sole reverse proxy (80 + 443 → localhost:3000)
- Apache proxy works correctly — external and localhost both return 200 with correct slug
- DB, PM2, Next.js all functioning normally

**Verified**:
- `curl localhost:3000/en/seoul/attractions/gyeongbokgung-palace-264337` → 200
- `curl https://travel.in-book.co.kr/en/seoul/attractions/gyeongbokgung-palace-264337` → 200

---

## Next Steps (2026-04-05)

Priority order:

1. **Switch cron to fetch_detail_intro.py** — images are done, now collect open_time/rest_date/parking/use_time
2. **Test fetch_detail_intro.py** — may need EngService2 parameter fixes (like detailCommon2 and detailImage2 needed). Run manually first: `cd /var/www/korea-travel/scripts && python3 fetch_detail_intro.py --limit 10`
3. **Rebuild Next.js** after intro data is collected: `cd /var/www/korea-travel && npm run build && pm2 restart korea-travel`
4. **Google Search Console** — submit sitemap.xml
5. **Production domain** — migrate to explorekorea.com with 301 redirects
