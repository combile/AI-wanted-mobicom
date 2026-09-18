# 지금 지구는 — Know what's NOW

기획서의 MVP 범위를 구현한 트렌드 인사이트 플랫폼 프로토타입입니다.

## 실행

```bash
npm install
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있습니다.

## 구현된 기능

- **TREND NOW (홈)** — 실시간/오늘/이번 주/이번 달 랭킹, 지금 폭발 중 / Rising / 밈 / 카테고리별 섹션
- **Trend Card / Trend Score** — 0~100점 점수, 7단계 상태(Emerging → Over), 변화율
- **WHY TRENDING** — 트렌드가 왜 뜨는지 단계별 설명
- **Trend Timeline** — 트렌드 확산 과정을 시간순으로 표시
- **Trend Graph(관련 트렌드)** — 연관 트렌드로 연결 탐색
- **탐색 / 카테고리** — 12개 카테고리, 7개 상태로 필터·정렬
- **Trend Radar** — 관심도 × 성장 속도 2축 산점도
- **검색** — 질문 기반 검색 + 모의 AI 요약
- **저장(마이 트렌드)** — 저장 시점 대비 점수 변화 추적 (localStorage)
- **개인화(FOR YOU)** — 관심 카테고리 선택 후 홈 하단에 개인화 피드 노출 (메인 TREND NOW는 비개인화 유지)
- **공유** — 트렌드 발견 공유 카드 미리보기 + 텍스트 복사


