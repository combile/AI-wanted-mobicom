import { CATEGORY_MAP } from './meta'
import type { TrendCard } from './types'
import { theme } from '../styles/theme'

// public/icons3d/<name>.webp — Microsoft Fluent Emoji 3D (MIT). 트렌드 썸네일 전용.
// 추가하려면 scripts/fetch-icons3d.mjs 에 한 줄 넣고 `npm run icons3d`, 그리고 여기에 이름 추가.
export type Icon3DName =
  // category
  | 'megaphone' | 'joy' | 'clapper' | 'microphone' | 'dress' | 'lipstick' | 'plate'
  | 'pin' | 'shopping-bags' | 'coffee' | 'palette' | 'phone'
  // trend thumbnails
  | 'chocolate' | 'peanuts' | 'cookie' | 'shortcake' | 'disk' | 'jeans' | 'tshirt' | 'ring'
  | 'metro' | 'headphone' | 'picture' | 'robot' | 'map' | 'notes' | 'masks' | 'camera'
  | 'camera-flash' | 'soccer' | 'tv' | 'store' | 'gift' | 'shoe' | 'briefcase' | 'newspaper'
  | 'matcha' | 'grad-cap'

const TREND_ICON: Record<string, Icon3DName> = {
  'dubai-chocolate': 'chocolate',
  'pistachio-cream': 'peanuts',
  'dubai-choco-cookie': 'cookie',
  'kadayif-dessert': 'shortcake',
  'y2k-revival': 'disk',
  'low-rise-jeans': 'jeans',
  'baby-tee': 'tshirt',
  'silver-accessory': 'ring',
  'last-train-mood': 'metro',
  'night-drive-playlist': 'headphone',
  'ghibli-filter': 'picture',
  'ai-profile-pic': 'robot',
  'drama-ost-spot': 'map',
  'drama-ost': 'notes',
  'drama-parody-meme': 'masks',
  'digicam-vintage': 'camera',
  'digicam-app': 'camera-flash',
  'block-core': 'soccer',
  'retro-graphic': 'tv',
  'popup-store-rush': 'store',
  'limited-edition-item': 'gift',
  'silent-walking': 'shoe',
  'unemployment-meme': 'briefcase',
  'ai-agent-news': 'newspaper',
  'matcha-boom': 'matcha',
  'campus-fit-check': 'grad-cap',
}

export function icon3dSrc(name: Icon3DName): string {
  return `${import.meta.env.BASE_URL}icons3d/${name}.webp`
}

/** 썸네일·피처 블록의 바탕색. 같은 트렌드는 어디서나 같은 색이 되도록 id로 고른다. */
export function trendTint(id: string): string {
  let hash = 0
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return theme.color.thumb[hash % theme.color.thumb.length]
}

/** 트렌드 썸네일. 서버에서 온 모르는 트렌드는 카테고리 아이콘으로 대신한다. */
export function trendIcon3d(trend: Pick<TrendCard, 'id' | 'category'>): Icon3DName {
  return TREND_ICON[trend.id] ?? CATEGORY_MAP[trend.category].icon3d
}
