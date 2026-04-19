# Session Handoff — Latest State

Last updated: 2026-04-19

## Quick Start (다음 세션용)

```bash
cd /Users/dapala.corp/python/root/scripts/korea-travel
git pull origin claude/add-github-repo-url-knsbO
```

서버 접속: `ssh root@141.164.41.235`

---

## 현재 Phase: 데이터 수집 완료 → 인덱싱 대기

- **사이트**: https://travel.in-book.co.kr — 가동 중
- **데이터 파이프라인**: 4단계 전부 완료 (places, detailCommon, images, detailIntro)
- **cron**: 비활성화 (주석 처리, 2026-04-19)
- **GSC**: 등록 완료
- **GA4**: G-VMMYCGD376 설치 완료

---

## 서버 aliases

```
로그        → intro/cron 로그 확인
남은거      → detailIntro 남은 건수
진행률      → 전체 현황
```

---

## 자동 작업

| 작업 | 스케줄 | 상태 |
|------|--------|------|
| detailIntro 수집 | 매일 KST 01:00 | **비활성화** (수집 완료) |
| git pull | cron에 포함 | **비활성화** |

cron 재활성화 필요 시: `crontab -e`에서 주석 해제

---

## 다음 세션 우선순위

1. GSC 데이터 확인 → CTR 최적화
2. explorekorea.com 이전 계획
3. Bing Webmaster Tools 등록

---

## 최근 해결된 이슈

| 이슈 | 해결 | 날짜 |
|------|------|------|
| **detailIntro 무한루프** | content_type별 필드명 매핑 추가 + 빈 문자열 기본값 | 04-19 |
| 크롤러 non-dict body 에러 | isinstance 체크 + continue | 04-06 |
| items 필드 빈 문자열 | items_wrap 타입 체크 | 04-06 |
| varchar(500) 초과 | TEXT로 변경 + try/except rollback | 04-07 |
| 모바일 메뉴 안 닫힘 | usePathname 경로 변경 감지 | 04-12 |
| 검색창 터치 영역 | pointer-events-none + full width | 04-12 |

---

## 핵심 파일 위치

| 용도 | 파일 |
|------|------|
| SSOT | CLAUDE.md |
| GPT 핸드오프 | GPT-HANDOFF-2026-04-19.md |
| 이전 핸드오프 | GPT-HANDOFF-2026-04-12.md, GPT-HANDOFF-2026-04-05.md |
| 이 문서 | SESSION-HANDOFF.md |
| 크롤러 설정 | scripts/config.py |
| 크롤러 (intro) | scripts/fetch_detail_intro.py |
