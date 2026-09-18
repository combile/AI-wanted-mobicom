// Microsoft Fluent Emoji(3D, MIT)를 내려받아 public/icons3d/<slug>.webp 로 저장한다.
// 원본 PNG(256px)보다 약 80% 작다. 변환은 sharp-cli를 npx로 불러 쓰므로 프로젝트 의존성은 늘지 않는다.
// 아이콘 추가: 아래 목록에 [slug, Fluent 폴더명] 한 줄 추가 → `npm run icons3d`
// → src/lib/icons3d.ts 의 Icon3DName 에 slug 추가.
// 3D는 트렌드 썸네일 전용이다. 상태·UI에는 Material 아이콘(src/lib/icons.ts)을 쓴다.
// 폴더명은 https://github.com/microsoft/fluentui-emoji/tree/main/assets 참고.
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

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
const TMP = await mkdtemp(join(tmpdir(), 'icons3d-'))

let failed = 0
let downloaded = 0
for (const [slug, folder] of ICONS) {
  const dest = new URL(`${slug}.webp`, OUT)
  if (await access(dest).then(() => true, () => false)) continue
  const file = `${folder.toLowerCase().replaceAll(' ', '_')}_3d.png`
  const res = await fetch(`${BASE}/${encodeURIComponent(folder)}/3D/${file}`)
  if (!res.ok) {
    failed++
    console.error(`FAIL ${slug} (${folder}): ${res.status}`)
    continue
  }
  await writeFile(join(TMP, `${slug}.png`), Buffer.from(await res.arrayBuffer()))
  console.log(`ok   ${slug}`)
  downloaded++
}

if (downloaded > 0) {
  execFileSync('npx', ['-y', 'sharp-cli@5', '-i', join(TMP, '*.png'), '-o', fileURLToPath(OUT), '-f', 'webp', '-q', '88'], {
    stdio: 'inherit',
  })
}
await rm(TMP, { recursive: true, force: true })
process.exit(failed ? 1 : 0)
