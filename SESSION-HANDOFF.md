# Session Handoff — Latest State

Last updated: 2026-04-05

## Quick Start (다음 세션용)

```bash
cd /Users/dapala.corp/python/root/scripts/korea-travel
git pull origin claude/add-github-repo-url-knsbO
```

서버 접속: `ssh root@141.164.41.235`

---

## 현재 상태 요약

- **사이트**: https://travel.in-book.co.kr — 가동 중
- **데이터**: 15,272 places, detailCommon 완료, detailIntro 수집 중 (cron)
- **SEO**: BreadcrumbList, 내부링크, CTR 메타데이터 완료
- **UI**: Header(검색+도시+드롭다운), Footer(3칼럼), ScrollToTop, Market widget
- **검색**: /api/search autocomplete (trigram index)
- **GSC**: 등록 대기 (사이트 점검 완료, 깨끗함)

---

## 진행 중인 자동 작업

| 작업 | 스케줄 | 상태 |
|------|--------|------|
| detailIntro 수집 | 매일 KST 01:00 | 자동 실행 중 (~8일 후 완료) |
| git pull | cron에 포함 | 자동 |

---

## 다음 세션 우선순위

1. GSC 등록 결과 확인
2. 이미지 전략 (65% 이미지 없음)
3. explorekorea.com 이전
4. detailIntro 완료 확인 후 UI 반영 점검

---

## 최근 커밋 (2026-04-05)

1. `feat: intro crawler + skip optimization + UI/image fallback`
2. `feat: breadcrumb JSON-LD + category related links`
3. `feat: optimize metadata for CTR`
4. `fix: replace Unsplash images with TourAPI images from DB`
5. `fix: prioritize places with images in category listings`
6. `feat: add Header with mobile menu, Footer with links, ScrollToTop button`
7. `feat: add market widget (USD/KRW + BTC) in header bar`
8. `feat: add autocomplete search with debounce and trigram index`

---

## 핵심 파일 위치

| 용도 | 파일 |
|------|------|
| SSOT | CLAUDE.md |
| GPT 핸드오프 | GPT-HANDOFF-2026-04-05.md |
| 이 문서 | SESSION-HANDOFF.md |
| 크롤러 설정 | scripts/config.py |
| 검색 API | src/app/api/search/route.ts |
| 헤더 | src/components/layout/Header.tsx |
