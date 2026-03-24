# Korea Travel Data Platform — 프로젝트 현황 보고서

> **작성일**: 2026-03-17 (최종 업데이트: 2026-03-24)
> **Repository**: https://github.com/defazr/korea-travel
> **도메인**: https://travel.in-book.co.kr
> **브랜치**: `claude/add-github-repo-url-knsbO`

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | Korea Travel Data Platform |
| **목적** | 한국관광공사 TourAPI 데이터 기반 SEO 중심 여행 정보 플랫폼 |
| **타겟 사용자** | 외국인 관광객 (영어 우선) |
| **특성** | 블로그가 아닌 **데이터 플랫폼** — 수천 개 페이지 자동 생성 |
| **목표 페이지 수** | 초기 3,000~5,000 / 장기 20,000+ |
| **트래픽 목표** | 월 100K → 1M 방문자 |

---

## 2. 기술 스택

| 분류 | 기술 |
|------|------|
| **프론트엔드** | Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui |
| **백엔드** | Node.js, Python (데이터 크롤러) |
| **데이터베이스** | PostgreSQL |
| **지도** | OpenStreetMap / Mapbox |
| **서버** | Vultr (Ubuntu 22.04, 1 vCPU, 2GB RAM, 64GB NVMe) |
| **디자인** | Antigravity Kit |

---

## 3. 완료된 작업 요약

### Phase 1 — 초기 구축

| 작업 | 상태 | 비고 |
|------|------|------|
| 프로젝트 초기화 (Next.js + TypeScript) | ✅ 완료 | `79f36d0` |
| 데이터베이스 스키마 설계 | ✅ 완료 | places, place_details, place_images |
| Python 크롤러 파이프라인 구축 | ✅ 완료 | 6개 스크립트 |
| UI 컴포넌트 개발 (shadcn/ui) | ✅ 완료 | 10개 컴포넌트 |
| 동적 라우팅 설정 | ✅ 완료 | `[lang]/[city]/[category]/[slug]` |
| .gitignore 설정 | ✅ 완료 | logs/, __pycache__/, .env 제외 |
| 서버 셋업 가이드 작성 | ✅ 완료 | 모바일 접근용 |

### Phase 2 — SEO 인프라 & 카테고리 페이지

| 작업 | 상태 | 비고 |
|------|------|------|
| content_type_id 매핑 수정 | ✅ 완료 | EngService2 정확한 값 반영 |
| `src/lib/constants.ts` 업데이트 | ✅ 완료 | 75→courses, 76→attractions, 79→shopping, 82→restaurants, 85→festivals |
| `scripts/config.py` 업데이트 | ✅ 완료 | 동일 매핑 + QuotaExhaustedError 추가 |
| `CLAUDE.md` 업데이트 | ✅ 완료 | EngService2 매핑 테이블 반영 |
| 크롤러 개선 | ✅ 완료 | quota 감지 자동중단 |
| 카테고리 페이지 구현 | ✅ 완료 | 메타데이터, breadcrumb, JSON-LD 포함 |
| SEO 인프라 (robots.ts, sitemap.ts) | ✅ 완료 | 6개 라우트 |
| Next.js 빌드 | ✅ 성공 | 에러 없이 완료 |
| Git push | ✅ 완료 | `claude/add-github-repo-url-knsbO` |

---

## 4. 데이터 파이프라인

```
TourAPI (EngService1) → Python 크롤러 → PostgreSQL → Next.js 페이지
```

> ⚠️ 데이터는 실시간 페칭하지 않음. 크롤링 → DB 저장 → 정적 렌더링 방식.

### 크롤러 스크립트 (실행 순서)

| # | 스크립트 | 역할 |
|---|---------|------|
| 1 | `scripts/fetch_area_list.py` | 지역별 장소 목록 수집 → `places` 테이블 |
| 2 | `scripts/fetch_detail_common.py` | 상세정보 수집 → `place_details` 테이블 |
| 3 | `scripts/fetch_detail_intro.py` | 소개/설명 데이터 수집 |
| 4 | `scripts/fetch_images.py` | 이미지 URL 수집 → `place_images` 테이블 |
| 5 | `scripts/update_data.py` | 위 스크립트 순차 실행 (통합 러너) |
| 6 | `scripts/config.py` | 공통 설정, DB 연결, API 유틸리티 |

---

## 5. 콘텐츠 타입 매핑

| contentTypeId | 카테고리 | 영문 슬러그 |
|:---:|-----------|-------------|
| 12 | 관광지 | attractions |
| 14 | 문화시설 | culture |
| 15 | 축제/행사 | festivals |
| 25 | 여행코스 | courses |
| 28 | 레포츠 | leisure |
| 32 | 숙박 | hotels |
| 38 | 쇼핑 | shopping |
| 39 | 음식점 | restaurants |

---

## 6. URL 구조

```
/[lang]/[city]/[category]/[slug]
```

**예시:**
- `/en/seoul/attractions/gyeongbokgung-palace`
- `/en/seoul/restaurants/myeongdong-kyoja`
- `/en/busan/hotels/haeundae-grand-hotel`

**지원 도시**: 서울, 인천, 대전, 대구, 광주, 부산, 울산, 세종, 경기, 강원, 충북, 충남, 경북, 경남, 전북, 전남, 제주 (17개 지역)

**지원 언어**: English (en), Korean (ko)

---

## 7. 데이터베이스 스키마

### places (메인 테이블)
```sql
content_id       VARCHAR PRIMARY KEY
content_type_id  INTEGER
title            VARCHAR
slug             VARCHAR UNIQUE
addr1, addr2     VARCHAR
area_code        INTEGER
sigungucode      INTEGER
mapx, mapy       DOUBLE PRECISION  -- 좌표 (내부 연결용)
tel              VARCHAR
first_image      VARCHAR
created_at       TIMESTAMP DEFAULT NOW()
```

### place_details (상세 정보)
```sql
content_id  VARCHAR REFERENCES places
overview    TEXT
homepage    VARCHAR
open_time   VARCHAR
rest_date   VARCHAR
parking     VARCHAR
use_time    VARCHAR
```

### place_images (이미지)
```sql
id          SERIAL PRIMARY KEY
content_id  VARCHAR REFERENCES places
image_url   VARCHAR
is_main     BOOLEAN
```

---

## 8. 사이트 접속 테스트 결과

| URL | HTTP | 상태 |
|-----|:----:|------|
| https://travel.in-book.co.kr | 200 | ✅ 정상 |
| /en/seoul | 200 | ✅ 3,125 places |
| /en/seoul/attractions | 200 | ✅ 정상 |
| /en/seoul/restaurants | 200 | ✅ 정상 |
| /en/seoul/shopping | 200 | ✅ 정상 |

---

## 9. Git 커밋 히스토리

```
8021a2a  Tune crawler for operational account: sleep 0.3, default limit 2000
5646fa4  feat: add SEO infrastructure and category pages (Phase 2)
a9f7545  feat: improve UI for TourAPI operational account application
54fdf63  chore: add logs/ and __pycache__/ to .gitignore
d9af9b4  docs: add server setup guide for mobile access
0817f8b  feat: initialize Korea Travel Data Platform (SSOT v1)
79f36d0  feat: initial commit
```

---

## 10. 프로젝트 구조

```
korea-travel/
├── CLAUDE.md                    # 프로젝트 지침서 (SSOT)
├── REPORT.md                    # 이 보고서
├── package.json                 # Next.js 프로젝트 설정
├── tsconfig.json
├── next.config.ts
├── components.json              # shadcn/ui 설정
├── public/
│   └── favicon.ico
├── scripts/                     # Python 데이터 크롤러
│   ├── config.py
│   ├── fetch_area_list.py
│   ├── fetch_detail_common.py
│   ├── fetch_detail_intro.py
│   ├── fetch_images.py
│   └── update_data.py
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # 홈페이지
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── robots.ts            # SEO robots.txt
│   │   ├── sitemap.ts           # 동적 사이트맵
│   │   └── [lang]/
│   │       └── [city]/
│   │           ├── page.tsx     # 도시 페이지
│   │           └── [category]/
│   │               ├── page.tsx # 카테고리 목록
│   │               └── [slug]/
│   │                   └── page.tsx  # 장소 상세
│   ├── components/
│   │   ├── city/
│   │   │   ├── CityHero.tsx
│   │   │   └── CategorySection.tsx
│   │   ├── place/
│   │   │   ├── PlaceHero.tsx
│   │   │   ├── PlaceInfo.tsx
│   │   │   ├── PlaceMap.tsx
│   │   │   └── NearbySection.tsx
│   │   └── ui/                  # shadcn 컴포넌트
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── tabs.tsx
│   ├── db/
│   │   ├── index.ts             # DB 연결
│   │   └── schema.sql           # 테이블 정의
│   └── lib/
│       ├── constants.ts         # 매핑 데이터
│       └── utils.ts             # 유틸리티
└── logs/                        # 크롤러 로그 (git 제외)
```

---

### Phase 3 — 운영계정 승인 & 크롤러 튜닝 (2026-03-24)

| 작업 | 상태 | 비고 |
|------|------|------|
| data.go.kr 운영계정 승인 | ✅ 완료 | 일일 호출 한도 상향 |
| 크롤러 sleep 튜닝 | ✅ 완료 | 1초 → 0.3초 |
| 기본 limit 설정 | ✅ 완료 | default 2000건/회 |
| 크론 자동 수집 설정 | ✅ 완료 | 매일 KST 01:00 실행 |
| detail 수집 (6,613/15,272) | 🔄 진행 중 | 4~5일 후 완료 예상 |

---

## 11. 남은 작업 (TODO)

### 즉시 실행 가능

| 우선순위 | 작업 | 명령어/방법 |
|:---:|------|-------------|
| 🔴 | Detail 크롤링 완료 대기 | 크론 자동 실행 중 (하루 2,000건) |
| 🔴 | Intro 크롤링 실행 | `python3 scripts/fetch_detail_intro.py` |
| 🔴 | Image 크롤링 실행 | `python3 scripts/fetch_images.py` |

> ⚠️ detail 수집 완료 후 intro → image 순서로 진행.

### 향후 계획

| 우선순위 | 작업 | 비고 |
|:---:|------|------|
| 🟡 | 프로덕션 도메인 연결 | explorekorea.com |
| 🟡 | 301 리다이렉트 설정 | 테스트 → 프로덕션 마이그레이션 |
| 🟡 | 내부 연결 구현 | 5km 반경 주변 장소 추천 (mapx/mapy 기반) |
| 🟢 | 한국어 지원 추가 | ko 언어 크롤링 및 페이지 |
| 🟢 | 지도 통합 | OpenStreetMap 또는 Mapbox |
| 🟢 | 이미지 최적화 | TourAPI → Wikimedia Commons → fallback |

---

## 12. 도메인 전략

| 구분 | 도메인 | 상태 |
|------|--------|------|
| 테스트 1 | travel.in-book.co.kr | ✅ 운영 중 |
| 테스트 2 | travel.fazr.co.kr | 대기 |
| 프로덕션 | explorekorea.com | 미연결 |

> 프로덕션 전환 시 301 리다이렉트로 SEO 자산 보존

---

## 13. 서버 환경

| 항목 | 사양 |
|------|------|
| 호스팅 | Vultr |
| OS | Ubuntu 22.04 |
| CPU | 1 vCPU |
| RAM | 2GB |
| 스토리지 | 64GB NVMe |
| 런타임 | Node.js + Python 3 |
| DB | PostgreSQL |

---

*이 보고서는 2026년 3월 24일 기준 프로젝트 현황을 반영합니다.*
