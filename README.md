# 지금 지구는 — Know what's NOW

기획서의 MVP 범위를 구현한 트렌드 인사이트 플랫폼 프로토타입입니다.

## 실행

```bash
npm install
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있습니다.

`server/`를 함께 띄우면(`cd server && npm run dev`, 8787) 승인된 실제 트렌드를 불러오고,
서버가 없거나 승인된 트렌드가 없으면 샘플 데이터(`src/data/trends.ts`)로 동작합니다. 어느 쪽인지는 홈 맨 아래 안내 문구로 알 수 있습니다.

## 프론트 스택

디자인 원칙: 기본은 박스형 카드·알약 뱃지 없이 나눈다. 카드(`Card`, 테두리 없는 어두운 면)는 목록의 한 항목이 아니라 독립된 한 덩어리인 네 곳에만 허용한다 — 상세의 스코어 패널, 검색의 AI 요약, 레이더에서 고른 트렌드, 카테고리 셀. 화면은 세 가지 문법을 섞어 리듬을 만든다 — 색면 피처(`TrendFeature`, 구간의 1등 하나), 썸네일 타일(`TrendTile` + `TileGrid`/`TileScroll`), 타이포(2열 순위 차트 `RankingRow`, 밈 글자 흐름). 한 줄 목록(`Rows`)은 마이 트렌드처럼 값 추적이 핵심인 곳에만. 메인 컬러(라임)는 1위 타일·선택된 칩/탭·워드마크·차트 선·주요 버튼에만. 이모지는 쓰지 않는다.

| 용도 | 모듈 | 쓰는 법 |
| --- | --- | --- |
| 스타일 | `@emotion/styled`, `@emotion/react` | 토큰은 `src/styles/theme.ts`, 공용 프리미티브(Rows·Chip·Section·Button·Banner…)는 `src/styles/ui.ts` |
| 모션 | `gsap`, `@gsap/react` | `src/lib/motion.ts` — `useStagger`(화면 로드 시퀀스: `data-stagger`, `data-pop`), `useCountUp`, `pop`, Flip. `prefers-reduced-motion`이면 전부 꺼짐 |
| API | `axios` | `src/lib/api.ts` 인스턴스(`/api` → vite proxy → 8787, 배포 시 `VITE_API_URL`), 데이터는 `src/store/useTrends.ts` |
| UI 아이콘 | `@mui/icons-material` (Rounded) | `src/lib/icons.ts`에 등록 후 `<Icon name="search" size={20} />` |
| 3D 아이콘 | Microsoft Fluent Emoji 3D (MIT) | **트렌드 썸네일 전용**(`<TrendThumb trend={t} />`). 상태·카테고리·UI에는 쓰지 않고 Material 아이콘만 쓴다. 추가: `scripts/fetch-icons3d.mjs`에 한 줄 → `npm run icons3d` → `src/lib/icons3d.ts`의 `Icon3DName`·`TREND_ICON`에 추가 |

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


