# GPT Handoff — 2026-04-28

## Overview

GSC 404 5건 긴급 수정. JSON-LD 구조화 데이터의 url 필드에서 `place.title` 대신 `place.slug`를 사용하도록 버그 수정 + 배포 완료.

---

## 이전 세션 이후 변경사항 (04-26 ~ 04-28)

### JSON-LD URL 버그 수정

**문제:**
- GSC에서 404 5건 감지 (2026-04-25)
- 5개 전부 title 원문 형태 URL (한글+특수문자+공백 포함)
- 예: `/en/chungbuk/shopping/Olive Young - Cheongju Yullyang Branch [Tax Refund Shop](올리브영 청주율량점)`

**원인:**
- `src/app/[lang]/[city]/[category]/[slug]/page.tsx` — `buildJsonLd()` 함수
- `url` 필드에서 `encodeURIComponent(place.title)` 사용
- Googlebot이 JSON-LD의 url을 크롤링 → title 원문 URL → 404

**수정:**
```typescript
// Before (버그)
url: `https://travel.in-book.co.kr/${lang}/${city}/${category}/${encodeURIComponent(place.title)}`,

// After (수정)
url: `https://travel.in-book.co.kr/${lang}/${city}/${category}/${place.slug}`,
```

- `buildJsonLd` 타입 시그니처에 `slug: string` 추가 (TypeScript 빌드 통과)

**검증:**
```bash
curl -s https://travel.in-book.co.kr/en/seoul/attractions/gyeongbokgung-palace-264337 | grep -o '"url":"[^"]*'
# → "url":"https://travel.in-book.co.kr/en/seoul/attractions/gyeongbokgung-palace-264337
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
| cron | 비활성화 | 수집 완료 |

---

## 현재 Phase

**Phase 2 — AI 요약 생성 (단계적 확장)**

- 1,250건 생성 완료 → GSC 관찰 중
- 안정 확인 후 전체 15,000건 확장
- Mac 로컬 Ollama 사용 (서버 리소스 사용 안 함)

---

## GSC 404 상태

- 기존 5건: Googlebot 재크롤링 시 자연 소멸 예상 (1~2주)
- 잘못된 URL은 404 유지가 정상 (redirect 불필요)
- JSON-LD 수정으로 신규 404 발생 차단됨

---

## 다음 단계

### 즉시 가능 (GSC 안정 확인 후)
1. AI 요약 전체 확장 (`python3 generate_summaries.py --limit 15000`)
2. GSC CTR 최적화 (title/description 개선)

### 장기
3. explorekorea.com 이전 + 301 redirect
4. Bing Webmaster Tools 등록
5. 신규 place 데이터 추가 시 cron 재활성화

---

## 커밋 목록 (04-28)

1. `fix: use slug instead of title in JSON-LD url field`
2. `fix: add slug to buildJsonLd type signature`
