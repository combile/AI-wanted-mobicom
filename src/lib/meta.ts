import type { CategoryMeta, StatusMeta } from './types'

export const CATEGORIES: CategoryMeta[] = [
  { key: 'issue', label: '이슈', icon: 'megaphone', examples: '뉴스, 사회적 이슈, 화제의 사건' },
  { key: 'meme', label: '밈', icon: 'laugh', examples: '밈, 유행어, 챌린지, 인터넷 문화' },
  { key: 'content', label: '콘텐츠', icon: 'clapperboard', examples: 'TikTok, 릴스, 쇼츠, 영상 포맷' },
  { key: 'entertainment', label: '엔터', icon: 'mic', examples: '음악, 드라마, 영화, 셀럽' },
  { key: 'fashion', label: '패션', icon: 'shirt', examples: '상의, 신발, 가방, 스타일링' },
  { key: 'beauty', label: '뷰티', icon: 'sparkles', examples: '화장법, 제품, 헤어, 네일' },
  { key: 'food', label: '푸드', icon: 'utensils', examples: '음식, 음료, 디저트, 레시피' },
  { key: 'place', label: '장소', icon: 'mapPin', examples: '카페, 팝업스토어, 여행지' },
  { key: 'item', label: '아이템', icon: 'backpack', examples: '전자기기, 소품, 생활용품' },
  { key: 'lifestyle', label: '일상', icon: 'coffee', examples: '취미, 운동, 공부, 소비문화' },
  { key: 'design', label: '디자인', icon: 'palette', examples: '그래픽 스타일, 폰트, 컬러' },
  { key: 'tech', label: '테크', icon: 'smartphone', examples: '앱, AI 서비스, 신기술' },
]

export const CATEGORY_MAP: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
)

export const STATUSES: StatusMeta[] = [
  { key: 'emerging', label: 'Emerging', icon: 'sprout', description: '아직 대중적이지 않지만 빠르게 상승 중', color: '#7ee787' },
  { key: 'rising', label: 'Rising', icon: 'flame', description: '본격적으로 확산 중', color: '#ffb84d' },
  { key: 'viral', label: 'Viral', icon: 'rocket', description: '폭발적으로 확산 중', color: '#ff6b6b' },
  { key: 'peak', label: 'Peak', icon: 'crown', description: '현재 대중화 정점', color: '#c6ff3d' },
  { key: 'mainstream', label: 'Mainstream', icon: 'waves', description: '일반 대중에게 이미 정착', color: '#6ec6ff' },
  { key: 'cooling', label: 'Cooling', icon: 'trendingDown', description: '관심도가 감소하기 시작', color: '#9aa0a6' },
  { key: 'over', label: 'Over', icon: 'skull', description: '유행 종료', color: '#5c5c5c' },
]

export const STATUS_MAP: Record<string, StatusMeta> = Object.fromEntries(
  STATUSES.map((s) => [s.key, s]),
)

export const TIME_RANGES = [
  { key: 'live', label: '실시간' },
  { key: 'today', label: '오늘' },
  { key: 'week', label: '이번 주' },
  { key: 'month', label: '이번 달' },
] as const

export type TimeRangeKey = (typeof TIME_RANGES)[number]['key']
