import Anthropic from '@anthropic-ai/sdk'
import { config, isAnthropicConfigured } from '../config/index.js'
import type { CategoryKey, TimelineEvent, WhyStep } from '../types.js'

let client: Anthropic | null = null
function getClient() {
  if (!isAnthropicConfigured) throw new Error('ANTHROPIC_API_KEY not configured')
  if (!client) client = new Anthropic({ apiKey: config.anthropic.apiKey })
  return client
}

// Cheap/fast model for bulk keyword extraction, stronger model for card synthesis.
const EXTRACTION_MODEL = 'claude-haiku-4-5-20251001'
const CURATION_MODEL = 'claude-sonnet-5'

export interface ExtractedCandidate {
  keyword: string
  aliases: string[]
}

/**
 * Clusters raw titles (YouTube/news/blog/RSS) into candidate trend keywords.
 * This is the ONLY place the LLM is allowed to "invent" anything — and even here it's
 * restricted to naming clusters of text it was actually given, never inventing new topics.
 */
export async function extractCandidateKeywords(titles: string[]): Promise<ExtractedCandidate[]> {
  const anthropic = getClient()
  const tool = {
    name: 'report_candidates',
    description: 'Report candidate trend keywords clustered from the given titles.',
    input_schema: {
      type: 'object' as const,
      properties: {
        candidates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              keyword: { type: 'string', description: '대표 키워드 (한국어, 정규화된 형태)' },
              aliases: { type: 'array', items: { type: 'string' }, description: '동일 키워드의 다른 표기/영문명' },
            },
            required: ['keyword', 'aliases'],
          },
        },
      },
      required: ['candidates'],
    },
  }

  const msg = await anthropic.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 2048,
    tools: [tool],
    tool_choice: { type: 'tool', name: 'report_candidates' },
    messages: [
      {
        role: 'user',
        content: [
          '다음은 오늘 YouTube 인기 영상 제목/뉴스·블로그 헤드라인 목록이다.',
          '이 중에서 여러 소스에 걸쳐 반복적으로 등장하거나, 새로 유행하기 시작한 것으로 보이는',
          '고유명사·신조어·밈·제품명·챌린지명을 후보 키워드로 클러스터링해라.',
          '같은 대상을 가리키는 표기(예: "두바이초콜릿"/"Dubai Chocolate")는 하나의 keyword로 묶고 aliases에 나열해라.',
          '목록에 없는 키워드를 지어내지 마라. 너무 일반적인 단어(오늘, 날씨, 사고 등)는 제외해라.',
          '',
          ...titles.map((t, i) => `${i + 1}. ${t}`),
        ].join('\n'),
      },
    ],
  })

  const toolUse = msg.content.find((c): c is Anthropic.ToolUseBlock => c.type === 'tool_use')
  if (!toolUse) return []
  const parsed = toolUse.input as { candidates: ExtractedCandidate[] }
  return parsed.candidates ?? []
}

export interface CurationEvidence {
  keyword: string
  newsAndBlogTitles: { title: string; source: string; publishedAt: string }[]
  videoTitles: { title: string; channel: string; publishedAt: string }[]
  signals: {
    searchGrowthPct: number | null
    shoppingGrowthPct: number | null
    contentGrowthPct: number | null
    newsGrowthPct: number | null
  }
}

export interface CuratedCard {
  summary: string
  category: CategoryKey
  why: WhyStep[]
  timeline: TimelineEvent[]
  keywords: string[]
}

const CATEGORY_KEYS: CategoryKey[] = [
  'issue',
  'meme',
  'content',
  'entertainment',
  'fashion',
  'beauty',
  'food',
  'place',
  'item',
  'lifestyle',
  'design',
  'tech',
]

/**
 * Synthesizes the human-facing TrendCard narrative fields from grounded evidence only.
 * The model must not fabricate dates, sources, or facts absent from the evidence payload.
 */
export async function curateTrendCard(evidence: CurationEvidence): Promise<CuratedCard> {
  const anthropic = getClient()
  const tool = {
    name: 'report_trend_card',
    description: 'Report the curated TrendCard narrative fields for this keyword.',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: { type: 'string', description: '한 문장 요약 (한국어)' },
        category: { type: 'string', enum: CATEGORY_KEYS },
        why: {
          type: 'array',
          description: '왜 뜨는지 3~6단계, 반드시 제공된 근거 자료에 기반',
          items: { type: 'string' },
        },
        timeline: {
          type: 'array',
          description: '근거 자료의 실제 발행일 기반 타임라인',
          items: {
            type: 'object',
            properties: { date: { type: 'string' }, label: { type: 'string' } },
            required: ['date', 'label'],
          },
        },
        keywords: { type: 'array', items: { type: 'string' }, description: '관련 해시태그/키워드 3~5개' },
      },
      required: ['summary', 'category', 'why', 'timeline', 'keywords'],
    },
  }

  const msg = await anthropic.messages.create({
    model: CURATION_MODEL,
    max_tokens: 1536,
    tools: [tool],
    tool_choice: { type: 'tool', name: 'report_trend_card' },
    messages: [
      {
        role: 'user',
        content: [
          `키워드: ${evidence.keyword}`,
          '',
          '=== 뉴스/블로그 근거 ===',
          ...evidence.newsAndBlogTitles.map((n) => `- [${n.source}, ${n.publishedAt}] ${n.title}`),
          '',
          '=== YouTube 근거 ===',
          ...evidence.videoTitles.map((v) => `- [${v.channel}, ${v.publishedAt}] ${v.title}`),
          '',
          '=== 정량 신호 ===',
          `검색량 증가율: ${evidence.signals.searchGrowthPct ?? '데이터 없음'}%`,
          `쇼핑 클릭 증가율: ${evidence.signals.shoppingGrowthPct ?? '데이터 없음'}%`,
          `콘텐츠(YouTube) 증가율: ${evidence.signals.contentGrowthPct ?? '데이터 없음'}%`,
          `뉴스/블로그 언급 증가율: ${evidence.signals.newsGrowthPct ?? '데이터 없음'}%`,
          '',
          '위 근거만 사용해서 트렌드 카드를 작성해라. 근거에 없는 사실·날짜·수치를 지어내지 마라.',
          '근거가 부족해서 특정 항목을 채울 수 없으면 해당 항목은 빈 배열로 남겨라.',
        ].join('\n'),
      },
    ],
  })

  const toolUse = msg.content.find((c): c is Anthropic.ToolUseBlock => c.type === 'tool_use')
  if (!toolUse) throw new Error('Claude did not return a tool_use block for curateTrendCard')
  const parsed = toolUse.input as {
    summary: string
    category: CategoryKey
    why: string[]
    timeline: { date: string; label: string }[]
    keywords: string[]
  }

  return {
    summary: parsed.summary,
    category: parsed.category,
    why: parsed.why.map((text, i) => ({ order: i + 1, text })),
    timeline: parsed.timeline,
    keywords: parsed.keywords,
  }
}
