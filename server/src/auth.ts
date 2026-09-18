import { timingSafeEqual } from 'node:crypto'

/** `Authorization: Bearer <token>` 검사. 길이가 같을 때만 상수 시간 비교를 한다. */
export function isAdminToken(header: string | undefined, expected: string): boolean {
  const given = Buffer.from(header?.startsWith('Bearer ') ? header.slice(7) : '')
  const want = Buffer.from(expected)
  return given.length === want.length && timingSafeEqual(given, want)
}
