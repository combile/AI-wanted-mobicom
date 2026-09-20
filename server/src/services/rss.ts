import Parser from 'rss-parser'

const parser = new Parser()

export interface RssItem {
  title: string
  link?: string
  pubDate?: string
  source: string
}

/**
 * Publisher RSS feeds used purely for candidate discovery — titles only, never store full content.
 * SBS의 newsRssFeed.do는 404로 죽어 있어(2026-09-20 확인) 빠졌다. 종합 소스 외에 연예/라이프/IT
 * 카테고리를 넣어 이 앱의 카테고리(밈·연예·라이프스타일·테크 등)에 걸리는 후보가 더 잡히게 했다.
 */
export const DEFAULT_FEEDS: { name: string; url: string }[] = [
  { name: '연합뉴스', url: 'https://www.yna.co.kr/rss/news.xml' },
  { name: '한겨레', url: 'https://www.hani.co.kr/rss/' },
  { name: '동아일보', url: 'https://rss.donga.com/total.xml' },
  { name: '경향신문', url: 'https://www.khan.co.kr/rss/rssdata/total_news.xml' },
  { name: '조선일보 연예', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/entertainments/?outputType=xml' },
  { name: '조선일보 라이프', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/life/?outputType=xml' },
  { name: '조선일보 IT과학', url: 'https://www.chosun.com/arc/outboundfeeds/rss/category/it_science/?outputType=xml' },
]

export async function fetchFeed(url: string, sourceName: string): Promise<RssItem[]> {
  const feed = await parser.parseURL(url)
  return (feed.items ?? []).map((item) => ({
    title: item.title ?? '',
    link: item.link,
    pubDate: item.pubDate,
    source: sourceName,
  }))
}

export async function fetchAllFeeds(feeds: { name: string; url: string }[] = DEFAULT_FEEDS): Promise<RssItem[]> {
  const results = await Promise.allSettled(feeds.map((f) => fetchFeed(f.url, f.name)))
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
}
