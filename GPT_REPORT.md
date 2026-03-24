# Korea Travel Data Platform — GPT 보고서

> 작성일: 2026-03-24

이 프로젝트는 한국관광공사 TourAPI 데이터를 기반으로 외국인 관광객 대상 영문 여행 정보 플랫폼을 구축하는 것이다. 블로그가 아니라 15,000개 이상의 장소 페이지를 자동 생성하는 SEO 중심 데이터 플랫폼이며, 최종 목표는 월 100만 방문자다.

기술 스택은 Next.js 16(App Router) + React 19 + Tailwind CSS 4 + shadcn/ui 프론트엔드, Python 크롤러, PostgreSQL DB이고, Vultr 서버(Ubuntu 22.04, 1vCPU, 2GB RAM)에서 PM2로 운영 중이다. 테스트 도메인은 travel.in-book.co.kr이고, 프로덕션 도메인 explorekorea.com은 아직 미연결 상태다.

데이터 파이프라인은 TourAPI(EngService2) → Python 크롤러 → PostgreSQL → Next.js 렌더링 구조이며, 실시간 페칭은 하지 않는다. data.go.kr 운영계정 승인이 완료되어 매일 KST 01:00 크론으로 2,000건씩 자동 수집 중이다. 현재 전체 15,272개 장소 중 detailCommon 6,613건(43%) 수집 완료했고, 나머지 8,659건은 4~5일 내 완료 예정이다.

URL 구조는 /[lang]/[city]/[category]/[slug] 형태이며, contentTypeId는 EngService2 기준(76=attractions, 82=restaurants, 80=hotels, 85=festivals 등)으로 KorService1과 다르다. SEO 인프라로 robots.ts, sitemap.ts, JSON-LD 구조화 데이터, breadcrumb이 구현되어 있다.

detail 데이터가 없는 장소도 title, address, 좌표, 이미지를 보여주고 overview만 "coming soon" 처리하여 페이지는 정상 렌더링된다. 남은 작업은 detailIntro/image 크롤링, 프로덕션 도메인 연결, 5km 반경 내부링크 최적화, 한국어 지원 순이다.

핵심 규칙: 실시간 페칭 금지, 병렬 크롤링 금지, sleep 0.3초 이상 유지, limit 2000건 이하, 이미지는 URL만 저장. GitHub 레포는 github.com/defazr/korea-travel 이다.
