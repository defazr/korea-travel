# Session Handoff — Latest State

Last updated: 2026-04-12

## Quick Start (다음 세션용)

```bash
cd /Users/dapala.corp/python/root/scripts/korea-travel
git pull origin claude/add-github-repo-url-knsbO
```

서버 접속: `ssh root@141.164.41.235`

---

## 현재 Phase: 인덱싱 대기 + detailIntro 수집 중

- **사이트**: https://travel.in-book.co.kr — 가동 중
- **detailIntro**: 6,169건 남음, ~3일 후 완료 (04-15경)
- **cron**: 안정 (매일 ~2,000건, 에러 0)
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

## 진행 중인 자동 작업

| 작업 | 스케줄 | 상태 |
|------|--------|------|
| detailIntro 수집 | 매일 KST 01:00 | ~3일 후 완료 |
| git pull | cron에 포함 | 자동 |

---

## 다음 세션 우선순위

1. detailIntro 완료 확인 → cron 정리
2. GSC 데이터 확인 → CTR 최적화
3. explorekorea.com 이전 계획

---

## 최근 해결된 이슈

| 이슈 | 해결 |
|------|------|
| 크롤러 non-dict body 에러 | isinstance 체크 + continue |
| items 필드 빈 문자열 | items_wrap 타입 체크 |
| varchar(500) 초과 | TEXT로 변경 + try/except rollback |
| 모바일 메뉴 안 닫힘 | usePathname 경로 변경 감지 |
| 검색창 터치 영역 | pointer-events-none + full width |

---

## 핵심 파일 위치

| 용도 | 파일 |
|------|------|
| SSOT | CLAUDE.md |
| GPT 핸드오프 | GPT-HANDOFF-2026-04-12.md |
| 이전 핸드오프 | GPT-HANDOFF-2026-04-05.md |
| 이 문서 | SESSION-HANDOFF.md |
| 크롤러 설정 | scripts/config.py |
| 크롤러 (intro) | scripts/fetch_detail_intro.py |
