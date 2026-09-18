# now-earth-server

"지금 지구는" 트렌드 탐지 백엔드. 목업 대신 실제 공개 API로 후보 키워드를 발견하고,
여러 신호로 검증한 뒤, Claude로 서사(WHY TRENDING/타임라인/요약)를 만들어 운영자 승인 큐에 올립니다.

```
YouTube 인기영상 + 뉴스/블로그 RSS  →  후보 키워드 추출 (Claude)
        →  신호 검증 (DataLab 검색량 / 뉴스·블로그 언급량 / YouTube 언급량)
        →  점수·상태 계산
        →  점수 통과분만 Claude로 카드 서사화
        →  운영자 승인 대기열 (review_queue)
        →  승인 시 trends 테이블에 반영 → 프론트엔드 API로 노출
```

## 1. 필요한 키 (전부 무료)

### YouTube Data API v3
1. https://console.cloud.google.com 에서 프로젝트 생성
2. "API 및 서비스 → 라이브러리"에서 **YouTube Data API v3** 활성화
3. "사용자 인증 정보 → API 키 만들기" → 발급된 키를 `YOUTUBE_API_KEY`에

### Naver API (NAVER API HUB)
> ⚠️ 2026-07-31부로 검색·데이터랩 API가 기존 developers.naver.com에서
> **NAVER API HUB**(NAVER Cloud Platform 산하)로 이관됐습니다. 신규 신청은 아래 절차를 따르세요.

1. https://www.ncloud.com 접속 → 네이버 계정으로 NCP(NAVER Cloud Platform) 가입/로그인
2. 콘솔 우측 상단 "Region & Platform" 선택 후 Apply
3. 좌측 상단 메뉴 → **All Services → Application Services → NAVER API HUB**
4. **Application** 메뉴에서 애플리케이션 생성, 사용 API로 **Search**, **Search Trend**, **Shopping Insight** 모두 체크
   (Search Trend와 Shopping Insight는 별개 항목이라 하나만 켜면 401/403 남)
5. 생성된 Application의 "API 관리" 아래 **인증 정보** 버튼 클릭 → Client ID / Client Secret 확인
6. 이 값을 `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET`에 입력

인증 헤더가 기존 `X-Naver-Client-Id`/`X-Naver-Client-Secret`에서
`X-NCP-APIGW-API-KEY-ID`/`X-NCP-APIGW-API-KEY`로 바뀌었고, 엔드포인트 도메인도
`openapi.naver.com` → `naverapihub.apigw.ntruss.com`으로 바뀌었습니다 — `src/services/naver.ts`에 반영되어 있습니다.

(만약 2026-07-30 24시 이전에 옛 developers.naver.com 방식으로 이미 키를 발급받아 쓰고 계셨다면
그 키는 2027-06-30까지는 그대로 쓸 수 있지만, 엔드포인트/헤더가 다르므로 별도 분기가 필요합니다 —
지금 새로 만드는 거라면 위 HUB 절차만 따르면 됩니다.)

### Anthropic (Claude API)
1. https://console.anthropic.com 에서 API 키 발급
2. `ANTHROPIC_API_KEY`에 입력

## 2. 실행

```bash
cp .env.example .env   # 위 키들을 채워넣기
npm install
npm run dev            # http://localhost:8787
```

키가 하나라도 비어 있으면 그 소스만 비활성화되고 서버는 정상 기동합니다 (`/health`에서 확인 가능).

## 3. 파이프라인 실행

기본은 4시간마다 자동 실행(`PIPELINE_CRON`)되지만, 수동으로도 돌릴 수 있습니다.

```bash
npm run pipeline:run
# 또는 서버가 떠 있는 상태에서
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8787/api/admin/pipeline/run
```

> `/api/admin/*`는 `.env`의 `ADMIN_TOKEN`과 같은 값을 `Authorization: Bearer …` 헤더로 보내야 합니다.
> `ADMIN_TOKEN`이 비어 있으면 관리자 API는 닫혀 있습니다(503). 토큰 없이/틀리게 보내면 401입니다.

## 4. 운영자 승인

새로 발견된 트렌드는 바로 노출되지 않고 `review_queue`에 쌓입니다.

```bash
AUTH="Authorization: Bearer $ADMIN_TOKEN"
curl -H "$AUTH" http://localhost:8787/api/admin/review          # 대기 중인 카드 목록
curl -X POST -H "$AUTH" http://localhost:8787/api/admin/review/{id}/approve
curl -X POST -H "$AUTH" http://localhost:8787/api/admin/review/{id}/reject
```

승인된 카드만 `GET /api/trends`로 노출됩니다 — 프론트엔드가 붙일 엔드포인트입니다.

## 5. 알려진 한계 (v1)

- **Naver Shopping Insight(패션/푸드 관심도)는 아직 비활성**입니다. 카테고리 코드 매핑이 필요해서
  `src/pipeline/validate.ts`의 `shoppingGrowthPct`가 항상 `null`로 나갑니다. 카테고리 코드를
  [네이버 개발자센터 문서](https://developers.naver.com/docs/serviceapi/datalab/shopping/shopping.md)에서
  확인해 `services/naver.ts`의 `fetchShoppingCategoryTrend` 호출부를 연결해야 합니다.
- **밈(TikTok/Instagram) 자동 수집 없음** — 기획대로 사용자 제보 방식으로 처리할 예정이며,
  아직 제보 API/화면은 만들지 않았습니다.
- **YouTube `search.list`는 하루 ~100회로 제한**되어 있어, 검증 단계에서는 쓰지 않고
  discovery 단계의 `videos.list`(mostPopular, 1 unit)만 사용합니다.
- **트렌드 히스토리는 파이프라인이 돌기 시작한 시점부터 쌓입니다** (과거 데이터를 소급할 수 없음).
