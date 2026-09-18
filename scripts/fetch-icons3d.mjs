// Microsoft Fluent Emoji(3D, MIT)를 public/icons3d/<slug>.png 로 내려받는다.
// 아이콘 추가: 아래 목록에 [slug, Fluent 폴더명] 한 줄 추가 → `npm run icons3d`
// → src/lib/icons3d.ts 의 Icon3DName 에 slug 추가.
// 3D는 트렌드 썸네일 전용이다. 상태·UI에는 Material 아이콘(src/lib/icons.ts)을 쓴다.
// 폴더명은 https://github.com/microsoft/fluentui-emoji/tree/main/assets 참고.
import { mkdir, writeFile, access } from 'node:fs/promises'

const ICONS = [
  // category (서버에서 온 모르는 트렌드의 썸네일 대체용)
  ['megaphone', 'Megaphone'],
  ['joy', 'Face with tears of joy'],
  ['clapper', 'Clapper board'],
  ['microphone', 'Microphone'],
  ['dress', 'Dress'],
  ['lipstick', 'Lipstick'],
  ['plate', 'Fork and knife with plate'],
  ['pin', 'Round pushpin'],
  ['shopping-bags', 'Shopping bags'],
  ['coffee', 'Hot beverage'],
  ['palette', 'Artist palette'],
  ['phone', 'Mobile phone'],
  // trend thumbnails
  ['chocolate', 'Chocolate bar'],
  ['peanuts', 'Peanuts'],
  ['cookie', 'Cookie'],
  ['shortcake', 'Shortcake'],
  ['disk', 'Optical disk'],
  ['jeans', 'Jeans'],
  ['tshirt', 'T-shirt'],
  ['ring', 'Ring'],
  ['metro', 'Metro'],
  ['headphone', 'Headphone'],
  ['picture', 'Framed picture'],
  ['robot', 'Robot'],
  ['map', 'World map'],
  ['notes', 'Musical notes'],
  ['masks', 'Performing arts'],
  ['camera', 'Camera'],
  ['camera-flash', 'Camera with flash'],
  ['soccer', 'Soccer ball'],
  ['tv', 'Television'],
  ['store', 'Department store'],
  ['gift', 'Wrapped gift'],
  ['shoe', 'Running shoe'],
  ['briefcase', 'Briefcase'],
  ['newspaper', 'Newspaper'],
  ['matcha', 'Teacup without handle'],
  ['grad-cap', 'Graduation cap'],
]

const BASE = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets'
const OUT = new URL('../public/icons3d/', import.meta.url)
await mkdir(OUT, { recursive: true })

let failed = 0
for (const [slug, folder] of ICONS) {
  const dest = new URL(`${slug}.png`, OUT)
  if (await access(dest).then(() => true, () => false)) continue
  const file = `${folder.toLowerCase().replaceAll(' ', '_')}_3d.png`
  const res = await fetch(`${BASE}/${encodeURIComponent(folder)}/3D/${file}`)
  if (!res.ok) {
    failed++
    console.error(`FAIL ${slug} (${folder}): ${res.status}`)
    continue
  }
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
  console.log(`ok   ${slug}`)
}
process.exit(failed ? 1 : 0)
