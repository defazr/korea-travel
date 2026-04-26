# GPT Handoff — 2026-04-26

## Overview

Phase 2 시작. InlineNearbyLinks 컴포넌트 추가 + AI 요약 시스템 구축 (1,250건 생성 완료). 전체 확장은 GSC 관찰 후 진행 예정.

---

## 이전 세션 이후 변경사항 (04-19 ~ 04-26)

### 1. InlineNearbyLinks 컴포넌트

- `src/components/place/InlineNearbyLinks.tsx` 신규 생성
- 상세 페이지에 "Visitors also explore A, B, and C near this location." 텍스트 링크 삽입
- PlaceInfo 아래, PlaceMap 위에 배치
- 기존 `nearby` 데이터 재사용 (DB 쿼리 추가 없음)
- title 60자 초과 필터, 최대 3개, 2개 미만이면 렌더링 안 함

### 2. AI 요약 시스템 (Phase 2 STEP 2)

**DB 변경:**
```sql
ALTER TABLE place_details ADD COLUMN IF NOT EXISTS ai_summary TEXT;
```

**스크립트:** `scripts/generate_summaries.py`
- Mac 로컬 Ollama (gemma4) → SSH 터널 (localhost:5433) → 서버 DB
- content_type_id → 카테고리명 매핑 (Attraction, Restaurant, Hotel 등)
- 프롬프트: 100단어 이내, 관광객 대상, 문장 스타일 다양화
- 50자 미만 필터, 20건 단위 커밋, 0.5초 sleep, timeout 30초 + retry 1회

**실행:**
```bash
# 터미널 1: SSH 터널
ssh -L 5433:localhost:5432 root@141.164.41.235

# 터미널 2: 실행
cd scripts && python3 generate_summaries.py --limit 1000
```

**UI 수정:**
- `PlaceInfo.tsx`: ai_summary 있으면 우선 표시, overview는 `<details>` 접기
- ai_summary 없으면 기존 overview 그대로 표시

**데이터 생성 결과:**

| 단계 | 건수 | 누적 | 에러 |
|------|------|------|------|
| 1차 | 50 | 50 | 0 |
| 2차 | 200 | 250 | 0 |
| 3차 | 1,000 | 1,250 | 0 |

- 평균 488자, 최소 358 / 최대 627자
- 품질 검증 통과 (다양한 시작 패턴, 자연스러운 영문)

---

## 현재 데이터 상태

| 항목 | 수 | 비고 |
|------|-----|------|
| places | 15,272 | 완료 |
| detailCommon | 15,124 | 완료 (148 skip) |
| detailIntro | 15,124 | 완료 |
| images | 43,599 | 완료 |
| first_image | ~78% | 복구 완료 |
| **ai_summary** | **1,250** | **진행중 (8.2%)** |
| cron | 비활성화 | 수집 완료 |

---

## 현재 Phase

**Phase 2 — AI 요약 생성 (단계적 확장)**

- 1,250건 생성 완료 → GSC 3~5일 관찰 중 (4/29~5/1 확인)
- 안정 확인 후 전체 15,000건 확장
- Mac 로컬 Ollama 사용 (서버 리소스 사용 안 함)

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

## 커밋 목록 (04-26)

1. `feat: add inline nearby text links on place detail pages`
2. `feat: add AI summary support (db column + generate script + UI)`
