# Korea Travel Data Platform — SSOT v1

Repository: https://github.com/defazr/korea-travel

## Project Overview

Data-driven Korea travel platform for international users.
Automatically generates thousands of pages using Korea Tourism Organization TourAPI data.

- SEO-driven travel database
- Target: international tourists
- English first, Korean optional
- NOT a blog — this is a data platform

## Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS, shadcn/ui
- **Design Intelligence**: Antigravity Kit
- **Backend**: Node.js, Python (data crawler)
- **Database**: PostgreSQL
- **Map**: OpenStreetMap or Mapbox
- **Server**: Vultr (Ubuntu 22.04, 1 vCPU, 2GB RAM, 64GB NVMe)

## Git Workflow

Never push directly to main. Always:

```bash
git checkout -b feat/feature-name
git commit
git push -u origin branch
gh pr create
```

## Domain Strategy

- Testing: travel.in-book.co.kr, travel.fazr.co.kr
- Production: explorekorea.com
- Migration: 301 redirect

## Data Source

Korea Tourism Organization TourAPI

- APIs: areaBasedList, detailCommon, detailIntro, detailImage
- Language: English API first
- Key identifier: contentId (shared across languages)

## Content Type Mapping (EngService2 — DB 기준)

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

## URL Structure

`/[lang]/[city]/[category]/[slug]`

Examples:
- /en/seoul/attractions/gyeongbokgung-palace
- /en/seoul/restaurants/myeongdong-kyoja
- /en/busan/beaches/haeundae-beach

## Data Pipeline

```
TourAPI → Python crawler → PostgreSQL → Next.js pages
```

Data must NOT be fetched in real time.

## Database Tables

- **places**: content_id, content_type_id, title, slug, addr1, addr2, area_code, sigungucode, mapx, mapy, tel, first_image, created_at
- **place_details**: content_id, overview, homepage, open_time, rest_date, parking, use_time
- **place_images**: id, content_id, image_url, is_main

## Image Strategy

Priority: TourAPI images > Wikimedia Commons > fallback
Store only image_url — do not download images.

## Internal Linking

Each place page shows nearby attractions, restaurants, hotels within 5km radius using mapx/mapy coordinates.

## Data Volume

- Initial launch: 3,000–5,000 pages
- Long term: 20,000+ pages
- Traffic target: 100k → 1M monthly visitors
