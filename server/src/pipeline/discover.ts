import { fetchTrendingVideosKR, type YoutubeVideo } from '../services/youtube.js'
import { fetchAllFeeds, type RssItem } from '../services/rss.js'
import { extractCandidateKeywords } from '../services/gemini.js'
import type { Candidate, SourceRef } from '../types.js'

function matches(text: string, needle: string): boolean {
  return text.toLowerCase().includes(needle.toLowerCase())
}

function videoToSource(v: YoutubeVideo): SourceRef {
  return { title: v.title, url: `https://www.youtube.com/watch?v=${v.id}`, source: v.channelTitle || 'YouTube', publishedAt: v.publishedAt }
}

function rssToSource(r: RssItem): SourceRef {
  return { title: r.title, url: r.link, source: r.source, publishedAt: r.pubDate ?? new Date().toISOString() }
}

/**
 * Pulls today's discovery pool (YouTube KR trending + publisher RSS titles), asks Claude to
 * cluster it into candidate keywords, then re-attaches the original source items as evidence
 * for each candidate (substring match on keyword/aliases — simple but auditable).
 */
export async function discoverCandidates(): Promise<{ candidates: Candidate[]; videos: YoutubeVideo[] }> {
  const [videos, rssItems] = await Promise.all([fetchTrendingVideosKR(50), fetchAllFeeds()])

  const titles = [...videos.map((v) => v.title), ...rssItems.map((r) => r.title)]
  if (titles.length === 0) return { candidates: [], videos: [] }

  const extracted = await extractCandidateKeywords(titles)

  const candidates: Candidate[] = extracted.map((c) => {
    const needles = [c.keyword, ...c.aliases]
    const matchingVideos = videos.filter((v) => needles.some((n) => matches(v.title, n)))
    const matchingRss = rssItems.filter((r) => needles.some((n) => matches(r.title, n)))
    const sources = [...matchingVideos.map(videoToSource), ...matchingRss.map(rssToSource)]

    return {
      keyword: c.keyword,
      aliases: c.aliases,
      sources,
      firstSeenAt: new Date().toISOString(),
      categoryGuess: c.categoryGuess,
    }
  })

  // Evidence-less candidates are extraction noise — drop them.
  return { candidates: candidates.filter((c) => c.sources.length > 0), videos }
}
