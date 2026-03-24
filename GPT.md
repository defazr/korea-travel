# Korea Travel Data Platform — GPT Context

이 문서는 GPT가 프로젝트를 빠르게 이해하고 도움을 줄 수 있도록 작성된 컨텍스트 파일입니다.
새 대화를 시작할 때 이 파일을 첨부하면 GPT가 프로젝트 전체 맥락을 파악할 수 있습니다.

---

## 프로젝트 요약

한국관광공사 TourAPI 데이터를 크롤링하여 PostgreSQL에 저장하고, Next.js로 수만 개의 관광지 페이지를 자동 생성하는 SEO 기반 여행 데이터 플랫폼.

- GitHub: https://github.com/defazr/korea-travel
- 테스트 도메인: travel.in-book.co.kr
- 프로덕션 도메인: explorekorea.com (예정)
- 대상: 외국인 관광객 (영문 우선)

## 기술 스택

- Next.js 16.1.6 (App Router, React 19)
- Tailwind CSS 4, shadcn/ui
- PostgreSQL (pg 8.20.0)
- Python 3 (데이터 크롤러)
- PM2 (프로세스 매니저)
- Nginx (리버스 프록시)
- Vultr 서버 (Ubuntu 22.04, 1 vCPU, 2GB RAM)

## 서버 정보

- IP: 141.164.41.235
- 앱 경로: /var/www/korea-travel
- Next.js: localhost:3000 (PM2로 실행)
- DB: localhost:5432, database=korea_travel, user=postgres, password=postgres
- Nginx가 외부 트래픽을 localhost:3000으로 프록시

## 데이터 파이프라인

```
TourAPI → Python 크롤러 → PostgreSQL → Next.js 페이지
```

실시간 API 호출 없음. 모든 데이터는 사전 크롤링하여 DB에 저장.

## 데이터 현황 (2026-03-24)

- 전체 places: 15,272건
- detail 수집완료: 6,613건
- 남은 건수: 8,659건
- 크론잡: 매일 KST 01:00, 2000건씩 수집
- 예상 완료: 4~5일

## URL 구조

```
/[lang]/[city]/[category]/[slug]
```

예시:
- /en/seoul/attractions/gyeongbokgung-palace
- /en/busan/restaurants/some-restaurant-name
- /en/jeju/hotels/some-hotel-name

## 라우팅 동작 방식

```
URL 요청 → Next.js [lang]/[city]/[category]/[slug]/page.tsx
  → getPlaceBySlug(slug) — slug으로만 DB 조회
  → null이면 → notFound() → 404
  → 있으면 → details, images, nearby 병렬 조회 → 렌더링
```

중요: city/category URL 파라미터는 검증하지 않음. 오직 slug만으로 place를 찾음.

## DB 테이블 구조

### places (PK: content_id, UNIQUE: slug)
- content_id BIGINT — TourAPI contentId
- content_type_id INTEGER — 카테고리 (76=attractions, 82=restaurants 등)
- title VARCHAR(500)
- slug VARCHAR(500) UNIQUE — URL용 슬러그
- addr1, addr2 — 주소
- area_code INTEGER — 도시 코드 (1=서울, 6=부산 등)
- mapx, mapy — 좌표 (경도, 위도)
- tel, first_image, created_at

### place_details (PK: content_id)
- overview, homepage, open_time, rest_date, parking, use_time

### place_images
- id, content_id, image_url, is_main

## contentTypeId → 카테고리 매핑

| ID | Category    |
|----|-------------|
| 75 | courses     |
| 76 | attractions |
| 77 | leisure     |
| 78 | culture     |
| 79 | shopping    |
| 80 | hotels      |
| 82 | restaurants |
| 85 | festivals   |

## area_code → 도시 매핑

1=seoul, 2=incheon, 3=daejeon, 4=daegu, 5=gwangju, 6=busan, 7=ulsan, 8=sejong, 31=gyeonggi, 32=gangwon, 33=chungbuk, 34=chungnam, 35=gyeongbuk, 36=gyeongnam, 37=jeonbuk, 38=jeonnam, 39=jeju

## 핵심 파일 목록

| 파일 | 역할 |
|------|------|
| `src/app/[lang]/[city]/[category]/[slug]/page.tsx` | 장소 상세 페이지 (SSR) |
| `src/lib/queries.ts` | DB 쿼리 함수들 (getPlaceBySlug 등) |
| `src/lib/constants.ts` | CONTENT_TYPE_MAP, AREA_CODE_MAP |
| `src/lib/slug.ts` | toSlug() 슬러그 생성 |
| `src/db/connection.ts` | PostgreSQL Pool 설정 |
| `src/db/schema.sql` | DB 스키마 |
| `src/app/sitemap.ts` | 동적 사이트맵 (15,000+ URL) |
| `scripts/fetch_detail_common.py` | 크롤러 (크론잡 실행) |
| `next.config.ts` | 이미지 도메인 허용 설정 |

## DB 쿼리 코드 특징

`getPlaceBySlug(slug)`는 try/catch가 없음:
```typescript
export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  const result = await query("SELECT * FROM places WHERE slug = $1", [slug]);
  return result.rows[0] || null;
}
```
- DB 연결 실패 시 예외가 throw됨 → Next.js가 500 반환
- DB 연결 정상인데 slug 매칭 안 되면 → null → notFound() → 404
- 에러를 조용히 삼키는 구조 아님

## DB 연결 코드

```typescript
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "korea_travel",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});
```
.env 없으면 기본값 사용. 서버 .env에는 password=postgres로 설정됨.

## 서버 관리 명령어

```bash
# PM2
pm2 restart korea-travel
pm2 logs korea-travel --lines 50
pm2 status

# PostgreSQL (서버에서 peer auth 문제 있음)
sudo -u postgres psql -d korea_travel          # 이렇게 접속
psql -U postgres -d korea_travel -h 127.0.0.1  # 또는 TCP로

# 빌드 & 배포
npm run build && pm2 restart korea-travel

# 캐시 초기화
rm -rf .next && npm run build && pm2 restart korea-travel
```

## 크롤러 설정

- data.go.kr 운영계정 승인 완료
- API: EngService2 (영문 관광정보서비스_GW)
- Sleep: 0.3s
- 하루 2000건 제한
- 429 응답 시 자동 중단 (QuotaExhaustedError)

---

## 현재 진행 중인 이슈

### 404 문제 디버깅 (2026-03-24)

**증상**: 일부 장소 페이지가 외부에서 접근 시 404 반환

**확인된 사실**:
1. DB에 데이터 정상 존재 (content_id=3078595, slug=bukhansan-dulle-trail-section-1-1-3078595)
2. localhost:3000에서 curl → 200 정상 응답
3. PM2 로그에 DB 에러 없음 (Unsplash 이미지 404만 있음)
4. .env 정상 설정됨
5. getPlaceBySlug()에 try/catch 없음 → DB 에러면 500이지 404가 아님

**현재 의심 원인**: Nginx 리버스 프록시 설정 문제
- localhost에서는 200이지만 외부 도메인(travel.in-book.co.kr)에서 404 가능성
- `/etc/nginx/sites-enabled/korea-travel*` 파일이 없었음
- Nginx 설정 파일 위치 확인 필요

**다음 디버깅 단계**:
1. `ls /etc/nginx/sites-enabled/` — Nginx 설정 파일 찾기
2. `curl -w "%{http_code}\n" https://travel.in-book.co.kr/en/seoul/courses/bukhansan-dulle-trail-section-1-1-3078595` — 외부 URL 테스트
3. `tail -50 /var/log/nginx/error.log` — Nginx 에러 로그 확인
4. Nginx proxy_pass가 모든 경로를 Next.js로 전달하는지 확인

**배제된 원인**:
- DB 연결 문제 (localhost 200 확인)
- slug 불일치 (DB에서 직접 확인)
- 에러 숨김 (try/catch 없음)
- ISR 캐시 (가능성 낮음)
