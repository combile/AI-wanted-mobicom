import { config, isNaverConfigured } from '../config/index.js'

// 2026-07-31부로 검색/데이터랩 API가 developers.naver.com(openapi.naver.com)에서
// NAVER API HUB(NAVER Cloud Platform)로 이관됨. 신규 발급 키는 전부 이 도메인/헤더를 쓴다.
// 참고: https://www.ncloud.com/product/applicationService/naverApiHub
const HUB_BASE = 'https://naverapihub.apigw.ntruss.com'
const SEARCH_TREND_URL = `${HUB_BASE}/search-trend/v1/search`
const SHOPPING_CATEGORIES_URL = `${HUB_BASE}/shopping/v1/categories`
const NEWS_SEARCH_URL = `${HUB_BASE}/search/v1/news`
const BLOG_SEARCH_URL = `${HUB_BASE}/search/v1/blog`

function authHeaders() {
  if (!isNaverConfigured) throw new Error('NAVER_CLIENT_ID/SECRET (NAVER API HUB) not configured')
  return {
    'X-NCP-APIGW-API-KEY-ID': config.naver.clientId!,
    'X-NCP-APIGW-API-KEY': config.naver.clientSecret!,
    'Content-Type': 'application/json',
  }
}

export interface DataLabPoint {
  period: string
  ratio: number
}

export interface DataLabResult {
  title: string
  keywords: string[]
  data: DataLabPoint[]
}

/**
 * 검색어 트렌드: 최대 5개 그룹 x 그룹당 최대 20개 키워드를 한 번에 조회.
 * NAVER API HUB에서 "Search Trend" API를 활성화한 애플리케이션의 키가 필요하다.
 */
export async function fetchSearchTrend(
  keywordGroups: { groupName: string; keywords: string[] }[],
  opts: { startDate: string; endDate: string; timeUnit?: 'date' | 'week' | 'month' } = {
    startDate: '',
    endDate: '',
  },
): Promise<DataLabResult[]> {
  const body = {
    startDate: opts.startDate,
    endDate: opts.endDate,
    timeUnit: opts.timeUnit ?? 'date',
    keywordGroups: keywordGroups.map((g) => ({ groupName: g.groupName, keywords: g.keywords })),
  }
  const res = await fetch(SEARCH_TREND_URL, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`Naver Search Trend failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { results: DataLabResult[] }
  return json.results
}

/**
 * 쇼핑인사이트 분야별 클릭 추이 (패션/푸드/아이템 관심도 신호).
 * NAVER API HUB에서 "Shopping Insight" API를 별도로 활성화해야 한다 (Search Trend와 별개 항목 —
 * 하나만 켜면 401/403 발생). category 코드는 NCP 콘솔의 Shopping Insight 문서에서 확인.
 */
export async function fetchShoppingCategoryTrend(
  category: string,
  opts: { startDate: string; endDate: string; timeUnit?: 'date' | 'week' | 'month' },
): Promise<DataLabPoint[]> {
  const body = {
    startDate: opts.startDate,
    endDate: opts.endDate,
    timeUnit: opts.timeUnit ?? 'date',
    category,
  }
  const res = await fetch(SHOPPING_CATEGORIES_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Naver Shopping Insight failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { results: { data: DataLabPoint[] }[] }
  return json.results[0]?.data ?? []
}

export interface NaverSearchItem {
  title: string
  link: string
  description: string
  pubDate?: string
  bloggername?: string
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, '').replace(/&quot;|&amp;|&lt;|&gt;/g, (m) =>
    ({ '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' })[m] ?? m,
  )
}

async function searchNaver(url: string, query: string, display = 20): Promise<NaverSearchItem[]> {
  const params = new URLSearchParams({ query, display: String(display), sort: 'date' })
  const res = await fetch(`${url}?${params}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`Naver search failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { items: NaverSearchItem[] }
  return json.items.map((item) => ({ ...item, title: stripHtml(item.title), description: stripHtml(item.description) }))
}

export const searchNews = (query: string, display = 20) => searchNaver(NEWS_SEARCH_URL, query, display)
export const searchBlog = (query: string, display = 20) => searchNaver(BLOG_SEARCH_URL, query, display)
