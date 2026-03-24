# Korea Travel Data Platform — GPT 보고서

> **작성일**: 2026-03-24
> **목적**: GPT/AI 어시스턴트에게 프로젝트 현황을 전달하기 위한 컨텍스트 문서

---

## 프로젝트 요약

한국관광공사 TourAPI 데이터를 기반으로 외국인 관광객 대상 SEO 중심 여행 정보 플랫폼을 구축하는 프로젝트.

- **성격**: 블로그가 아닌 데이터 플랫폼 (자동 페이지 생성)
- **언어**: 영어 우선
- **목표**: 15,000+ 장소 페이지, 월 100K~1M 방문자

---

## 현재 진행 상태 (2026-03-24 기준)

### 완료된 것

| 항목 | 상태 |
|------|------|
| Next.js 16 + App Router 프로젝트 초기화 | ✅ |
| PostgreSQL 스키마 (places, place_details, place_images) | ✅ |
| Python 크롤러 6개 스크립트 | ✅ |
| shadcn/ui 기반 UI 컴포넌트 10개 | ✅ |
| 동적 라우팅 `/[lang]/[city]/[category]/[slug]` | ✅ |
| SEO 인프라 (robots.ts, sitemap.ts, JSON-LD) | ✅ |
| 카테고리 페이지 (breadcrumb, 메타데이터) | ✅ |
| data.go.kr 운영계정 승인 | ✅ |
| 크롤러 튜닝 (sleep 0.3s, limit 2000) | ✅ |
| 크론 자동 수집 설정 (매일 KST 01:00) | ✅ |
| 서버 배포 (Vultr, travel.in-book.co.kr) | ✅ |

### 현재 진행 중

| 항목 | 진행률 | 비고 |
|------|--------|------|
| detailCommon 수집 | 6,613 / 15,272 (43%) | 크론 자동 실행, 하루 2,000건 |
| 예상 완료일 | 2026-03-28~29 | 4~5일 소요 |

### 아직 안 한 것

| 항목 | 우선순위 |
|------|----------|
| detailIntro 크롤링 | detail 완료 후 |
| image 크롤링 | intro 완료 후 |
| 프로덕션 도메인 (explorekorea.com) 연결 | 중 |
| 301 리다이렉트 설정 | 중 |
| 5km 반경 주변 장소 추천 (내부 연결) | 중 |
| 한국어 지원 | 낮 |
| 지도 통합 (Mapbox/OSM) | 낮 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프론트엔드 | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| 백엔드 | Node.js, Python 3 (크롤러) |
| DB | PostgreSQL |
| 서버 | Vultr (Ubuntu 22.04, 1 vCPU, 2GB RAM, 64GB NVMe) |
| 데이터 소스 | 한국관광공사 TourAPI (EngService2) |

---

## 데이터 파이프라인

```
TourAPI (EngService2) → Python 크롤러 → PostgreSQL → Next.js 정적 렌더링
```

- 실시간 페칭 **아님** — 크롤링 후 DB 저장 방식
- 크론으로 매일 자동 수집

---

## 크롤러 설정

| 항목 | 값 |
|------|-----|
| API 계정 | data.go.kr 운영계정 (승인 완료) |
| Sleep | 0.3초 |
| Limit | 2,000건/회 |
| 크론 | `0 16 * * *` (UTC) = 매일 KST 01:00 |
| 안전장치 | 429 응답 시 QuotaExhaustedError → 자동 중단 |
| 진행률 확인 | 서버에서 `진행률` 명령어 |

---

## 콘텐츠 타입 매핑 (EngService2)

| contentTypeId | 카테고리 |
|:---:|----------|
| 75 | courses |
| 76 | attractions |
| 77 | leisure |
| 78 | culture |
| 79 | shopping |
| 80 | hotels |
| 82 | restaurants |
| 85 | festivals |

---

## URL 구조

```
/[lang]/[city]/[category]/[slug]
```

예: `/en/seoul/attractions/gyeongbokgung-palace`

---

## 서버 환경

- **호스팅**: Vultr
- **도메인**: travel.in-book.co.kr (테스트)
- **프로덕션**: explorekorea.com (미연결)
- **GitHub**: https://github.com/defazr/korea-travel
- **브랜치**: `claude/add-github-repo-url-knsbO`

---

## 핵심 규칙

1. 데이터는 실시간 페칭 금지 — 반드시 크롤링 → DB → 렌더링
2. 병렬 크롤링 금지 — 단일 프로세스만
3. sleep 0.1 이하 금지, limit 5000+ 금지
4. contentTypeId는 EngService2 기준 (KorService1과 다름)
5. 이미지는 URL만 저장, 다운로드하지 않음

---

*이 문서는 2026년 3월 24일 기준 프로젝트 현황을 반영합니다.*
