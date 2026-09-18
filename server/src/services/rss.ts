import Parser from 'rss-parser'

const parser = new Parser()

export interface RssItem {
  title: string
  link?: string
  pubDate?: string
  source: string
}

/** Publisher RSS feeds used purely for candidate discovery — titles only, never store full content. */
export const DEFAULT_FEEDS: { name: string; url: string }[] = [
  { name: '연합뉴스', url: 'https://www.yna.co.kr/rss/news.xml' },
  { name: '한겨레', url: 'https://www.hani.co.kr/rss/' },
  { name: 'SBS', url: 'https://news.sbs.co.kr/news/newsRssFeed.do' },
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
