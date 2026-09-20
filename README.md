# 지금 지구는 — Know what's NOW

실제 데이터와 AI로 "지금 무엇이 왜 뜨고 있는지"를 보여주는 트렌드 인사이트 플랫폼입니다.

## 데모

- 웹: https://ai-wanted-mobicom.vercel.app/
- API: https://ai-wanted-mobicom.onrender.com/health

## 개요

YouTube 인기 영상과 언론사 RSS에서 후보 키워드를 자동으로 발견하고, 검색량·언급량 증가율 같은
정량 신호로 검증해 점수와 상태를 매깁니다. 점수를 통과한 트렌드만 AI(Gemini)가 근거 자료 기반으로
요약·타임라인을 생성하고, 운영자 승인을 거쳐 노출됩니다.

## 핵심 기능

- **트렌드 파이프라인** — YouTube/RSS 발견 → 검색량·언급량 검증 → 점수·상태 계산 → AI 큐레이션 → 운영자 승인, 4시간 주기 자동 갱신
- **Trend Score / 상태** — 0~100점, 7단계 상태(Emerging → Rising → Viral → Peak → Mainstream → Cooling → Over)
- **WHY TRENDING / 타임라인** — 실제 근거 자료 기반 설명, 지어낸 사실 없음
- **홈(TREND NOW)** — 실시간/오늘/이번 주/이번 달 랭킹, 카테고리별 섹션
- **Trend Radar** — 관심도 × 성장 속도 산점도
- **탐색** — 12개 카테고리 × 7개 상태 필터
- **검색** — 질문 기반 검색 + AI 요약
- **마이 트렌드 / FOR YOU** — 저장 추적, 관심 카테고리 기반 개인화 피드
- **공유 카드**

## 아키텍처

```
YouTube 인기영상 + 언론사 RSS
  → 후보 키워드 발견 (Gemini)
  → 신호 검증 (네이버 데이터랩 검색량 / 뉴스·블로그 언급량 / 콘텐츠 노출)
  → 점수·상태 계산
  → 점수 통과분만 AI 큐레이션 (요약 / WHY TRENDING / 타임라인)
  → 운영자 승인 → 서비스 노출
```

서버 연결이 없거나 승인된 트렌드가 없으면 프론트는 샘플 데이터로 자동 대체됩니다.

## 기술 스택

| 영역 | 스택 |
| --- | --- |
| 프론트엔드 | React 19, TypeScript, Vite, Emotion, GSAP, Zustand, React Router, axios |
| 백엔드 | Node.js, Express, TypeScript, SQLite(node:sqlite), node-cron |
| AI / 데이터 | Google Gemini API, YouTube Data API v3, 네이버 검색/데이터랩, 언론사 RSS |
| 배포 | Vercel(프론트), Render(백엔드) |

## 실행 방법

```bash
# 프론트엔드
npm install
npm run dev              # http://localhost:5173

# 백엔드 (별도 터미널)
cd server
npm install
cp .env.example .env     # API 키 입력
npm run dev               # http://localhost:8787
```

키 발급 방법은 `server/README.md` 참고.

## 테스트

```bash
npm test                 # 프론트
cd server && npm test    # 백엔드
```
