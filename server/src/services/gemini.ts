import { GoogleGenAI, ApiError } from '@google/genai'
import { config, isGeminiConfigured } from '../config/index.js'
import type { CategoryKey, TimelineEvent, WhyStep } from '../types.js'

let client: GoogleGenAI | null = null
function getClient() {
  if (!isGeminiConfigured) throw new Error('GEMINI_API_KEY not configured')
  if (!client) client = new GoogleGenAI({ apiKey: config.gemini.apiKey })
  return client
}

// gemini-flash-latest(현재 gemini-3.8-flash)는 무료 티어 일일 한도가 20회로 매우 빡빡해서
// 파이프라인 1회 실행(추출 1회 + 통과 후보당 큐레이션 1회)만으로도 금방 소진된다.
// flash-lite 계열이 무료 티어 한도가 훨씬 넉넉해 이 파이프라인 호출량에 더 맞는다.
const EXTRACTION_MODEL = 'gemini-flash-lite-latest'
const CURATION_MODEL = 'gemini-flash-lite-latest'

async function generateJson<T>(model: string, systemInstruction: string, prompt: string, schema: Record<string, unknown>): Promise<T> {
  const ai = getClient()
  try {
    const interaction = await ai.interactions.create({
      model,
      system_instruction: systemInstruction,
      input: prompt,
      response_format: { type: 'text', mime_type: 'application/json', schema },
    })
    if (!interaction.output_text) throw new Error('Gemini returned no output_text')
    return JSON.parse(interaction.output_text) as T
  } catch (err) {
    if (err instanceof ApiError) throw new Error(`Gemini API error (${err.status}): ${err.message}`)
    throw err
  }
}

// src/lib/meta.ts의 CATEGORIES와 같은 뜻으로 맞춰둔 것 — 프론트가 카테고리별로 다른 아이콘을
// 보여주므로, 여기서 기준이 흐리면 서로 다른 트렌드가 전부 같은 카테고리·아이콘으로 몰린다
// (스포츠 결과·게임 콘텐츠가 전부 'entertainment'로 분류되던 문제 — 2026-09-20).
const CATEGORY_GUIDE: Record<CategoryKey, string> = {
  issue: '뉴스, 사회적 이슈, 화제의 사건, 스포츠 경기 결과·수상 등 시사성 사건',
  meme: '밈, 유행어, 챌린지, 인터넷 문화',
  content: 'TikTok/릴스/쇼츠 등 영상 포맷, 게임 관련 유튜브 콘텐츠',
  entertainment: '음악(가수·시상식·앨범), 드라마, 영화, 연예인 관련 소식',
  fashion: '상의, 신발, 가방, 스타일링',
  beauty: '화장법, 화장품, 헤어, 네일',
  food: '음식, 음료, 디저트, 레시피',
  place: '카페, 팝업스토어, 여행지',
  item: '전자기기, 소품, 생활용품',
  lifestyle: '취미, 운동, 공부, 소비문화',
  design: '그래픽 스타일, 폰트, 컬러 트렌드',
  tech: '앱, AI 서비스, 신기술',
}
const CATEGORY_KEYS = Object.keys(CATEGORY_GUIDE) as CategoryKey[]
const CATEGORY_ENUM_DESCRIPTION = Object.entries(CATEGORY_GUIDE)
  .map(([key, hint]) => `${key}: ${hint}`)
  .join(' / ')

export interface ExtractedCandidate {
  keyword: string
  aliases: string[]
  /** 대략적인 카테고리 추정 — 검증 단계의 쇼핑 신호 조회용. 최종 카테고리는 큐레이션 단계에서 다시 정해진다. */
  categoryGuess?: CategoryKey
}

/**
 * Clusters raw titles (YouTube/news/blog/RSS) into candidate trend keywords.
 * This is the ONLY place the LLM is allowed to "invent" anything — and even here it's
 * restricted to naming clusters of text it was actually given, never inventing new topics.
 */
export async function extractCandidateKeywords(titles: string[]): Promise<ExtractedCandidate[]> {
  const schema = {
    type: 'object',
    properties: {
      candidates: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            keyword: { type: 'string', description: '대표 키워드 (한국어, 정규화된 형태)' },
            aliases: { type: 'array', items: { type: 'string' }, description: '동일 키워드의 다른 표기/영문명' },
            categoryGuess: { type: 'string', enum: CATEGORY_KEYS, description: CATEGORY_ENUM_DESCRIPTION },
          },
          required: ['keyword', 'aliases', 'categoryGuess'],
        },
      },
    },
    required: ['candidates'],
  }

  const prompt = [
    '다음은 오늘 YouTube 인기 영상 제목/뉴스·블로그 헤드라인 목록이다.',
    '이 중에서 여러 소스에 걸쳐 반복적으로 등장하거나, 새로 유행하기 시작한 것으로 보이는',
    '고유명사·신조어·밈·제품명·챌린지명을 후보 키워드로 클러스터링해라.',
    '같은 대상을 가리키는 표기(예: "두바이초콜릿"/"Dubai Chocolate")는 하나의 keyword로 묶고 aliases에 나열해라.',
    '목록에 없는 키워드를 지어내지 마라. 너무 일반적인 단어(오늘, 날씨, 사고 등)는 제외해라.',
    'categoryGuess는 스키마의 카테고리 설명을 참고해 가장 가까운 것으로 대략 추정해라(나중에 다시 정해지니 애매하면 최선으로 고르면 된다).',
    '',
    ...titles.map((t, i) => `${i + 1}. ${t}`),
  ].join('\n')

  const parsed = await generateJson<{ candidates: ExtractedCandidate[] }>(
    EXTRACTION_MODEL,
    '너는 트렌드 후보 키워드를 추출하는 분류기다. 반드시 JSON 스키마에 맞춰 응답해라.',
    prompt,
    schema,
  )
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

/**
 * Synthesizes the human-facing TrendCard narrative fields from grounded evidence only.
 * The model must not fabricate dates, sources, or facts absent from the evidence payload.
 */
export async function curateTrendCard(evidence: CurationEvidence): Promise<CuratedCard> {
  const schema = {
    type: 'object',
    properties: {
      summary: { type: 'string', description: '한 문장 요약 (한국어)' },
      category: {
        type: 'string',
        enum: CATEGORY_KEYS,
        description: CATEGORY_ENUM_DESCRIPTION,
      },
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
  }

  const prompt = [
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
    'category는 애매하면 "entertainment"로 뭉뚱그리지 말고 스키마의 카테고리별 설명을 보고 가장 구체적으로 맞는 것을 골라라',
    '(예: 스포츠 경기 결과·수상은 issue, 게임 공략/플레이 영상은 content, 가수·시상식·드라마·영화는 entertainment).',
  ].join('\n')

  const parsed = await generateJson<{
    summary: string
    category: CategoryKey
    why: string[]
    timeline: { date: string; label: string }[]
    keywords: string[]
  }>(CURATION_MODEL, '너는 근거 기반으로만 트렌드 카드를 작성하는 에디터다. 반드시 JSON 스키마에 맞춰 응답해라.', prompt, schema)

  return {
    summary: parsed.summary,
    category: parsed.category,
    why: parsed.why.map((text, i) => ({ order: i + 1, text })),
    timeline: parsed.timeline,
    keywords: parsed.keywords,
  }
}
