import { expect, it } from 'vitest'

// 글자 크기 단계. 본문 16, 최소 12. 새 크기가 필요하면 여기와 styles/theme.ts의 설명을 함께 고친다.
const SCALE = [12, 14, 16, 18, 20, 24, 28, 34, 52]

// node:fs 대신 Vite의 glob으로 소스를 읽는다 — 브라우저용 tsconfig에 Node 타입을 끌어들이지 않으려고.
const sources = import.meta.glob<string>('../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })

it('font-size는 정해 둔 단계 안의 값만 쓴다', () => {
  const files = Object.entries(sources).filter(([path]) => !path.includes('.test.'))
  expect(files.length).toBeGreaterThan(20)

  const offenders = files.flatMap(([path, code]) =>
    [...code.matchAll(/font-size:\s*([\d.]+)px/g)]
      .filter((m) => !SCALE.includes(Number(m[1])))
      .map((m) => `${path}: ${m[0]}`),
  )
  expect(offenders).toEqual([])
})
