# GPT Handoff — 2026-05-01

## Overview

GSC 인덱싱 폭락(4,107→785) 원인 진단 완료. AI 요약 무관 판정. 빈 카테고리 페이지에 noindex 추가 + sitemap 제외 배포.

---

## 이전 세션 이후 변경사항 (04-28 ~ 05-01)

### 인덱싱 폭락 진단

**증상:** 4/25 GSC 인덱싱 4,107 → 785 폭락

**진단 방법:**
- Soft 404: 2건 URL 분석
- 크롤링됨-색인안됨: GSC CSV 1,000건 전체 분석 (상위 10 + 랜덤 10 샘플링 + 993건 전수 AI 비율 조회)
- 발견됨-색인안됨: 12,048건 확인

**결론:**

| 비교 항목 | DB 전체 | 색인안됨 993건 |
|----------|---------|--------------|
| AI 요약 비율 | 8.3% (1,250/15,124) | 8.6% (85/993) |
| shopping 비율 | 66.6% | 65.8% |

- **AI 요약은 원인이 아님** (비율 동일)
- **실제 원인: 크롤링 예산 부족** — 15,000+ 페이지에 신규 사이트 권위 부족
- 경복궁, N서울타워도 색인 탈락 → 콘텐츠 품질 문제 아님
- Soft 404 #1(`/en/seoul/leisure`)은 데이터 0건 빈 카테고리 페이지

### 빈 카테고리 noindex + sitemap 제외

**0건 조합 12개:**
- leisure(77): seoul, daejeon, daegu, gwangju, busan, ulsan, sejong, chungbuk, gyeongnam, jeonbuk, jeonnam, jeju
- courses(75): sejong

**수정 파일:**
1. `src/app/[lang]/[city]/[category]/page.tsx` — `generateMetadata`
   - `countPlacesByCategory` 호출 → 0건이면 `robots: { index: false, follow: true }`
2. `src/app/sitemap.ts`
   - `countPlacesByCategory` import 추가
   - 카테고리 URL 생성 시 0건 조합 제외

**검증:**
```bash
# noindex 적용 확인
curl -s https://travel.in-book.co.kr/en/seoul/leisure | grep -o 'content="noindex[^"]*"'
# → content="noindex, follow"

# 역검증 (데이터 있는 카테고리)
curl -s https://travel.in-book.co.kr/en/seoul/attractions | grep -i "noindex"
# → (출력 없음 = 정상)

# sitemap 제외 확인
curl -s https://travel.in-book.co.kr/sitemap.xml | grep "sejong/courses"
# → (출력 없음 = 제외됨)

# robots.txt
curl -s https://travel.in-book.co.kr/robots.txt
# → User-Agent: * / Allow: / / Sitemap: .../sitemap.xml
```

---

## 현재 데이터 상태

| 항목 | 수 | 비고 |
|------|-----|------|
| places | 15,272 | 완료 |
| detailCommon | 15,124 | 완료 (148 skip) |
| detailIntro | 15,124 | 완료 |
| images | 43,599 | 완료 |
| first_image | ~78% | 복구 완료 |
| ai_summary | 1,250 | 진행중 (8.2%) |
| overview 1자 이하 | 2,872 | thin content 후보 |
| cron | 비활성화 | 수집 완료 |

---

## 현재 Phase

**Phase 2 — AI 요약 생성 (단계적 확장)**

- 1,250건 완료 → **인덱싱 폭락과 무관 판정 완료**
- 전체 확장 진행 가능
- Mac 로컬 Ollama 사용 (서버 리소스 사용 안 함)

---

## GSC 인덱싱 상태 (2026-05-01 기준)

| 분류 | 건수 |
|------|------|
| 인덱싱됨 | 785 |
| 크롤링됨-색인안됨 | ~1,000+ |
| 발견됨-색인안됨 | 12,048 |
| Soft 404 | 2 (noindex 처리 완료) |

---

## 다음 단계

### 즉시 가능
1. **AI 요약 전체 확장** — 인덱싱과 무관 판정. `python3 generate_summaries.py --limit 15000`
2. overview 1자 이하 2,872건 thin content 오디트 (별도 판단 필요)

### 중기
3. explorekorea.com 이전 + 301 redirect
4. Bing Webmaster Tools 등록
5. GSC에서 Soft 404 2건 자연 소멸 확인 (1~2주)

### 주의사항
- 인덱싱 폭락은 크롤링 예산 한계가 주원인 — 시간이 해결 (사이트 권위 축적)
- 추가 noindex/삭제로 해결할 문제 아님
- sitemap 우선순위(priority) 조정은 Google이 무시하므로 효과 없음

---

## 커밋 목록 (05-01)

1. `fix: noindex empty category pages + exclude from sitemap`
