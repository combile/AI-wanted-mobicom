export function formatChange(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct}%`
}

/** 조회수를 한국식 단위로: 12345 → '1.2만회'. 100 미만이면 소수 한 자리(내림), 그 이상은 정수. */
export function formatViews(views: number): string {
  const units: [number, string][] = [
    [1e8, '억'],
    [1e4, '만'],
    [1e3, '천'],
  ]
  for (const [size, label] of units) {
    if (views < size) continue
    const value = views / size
    return `${value < 100 ? Math.floor(value * 10) / 10 : Math.floor(value)}${label}회`
  }
  return `${views}회`
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return '오늘'
  if (diffDays === 1) return '1일 전'
  if (diffDays < 30) return `${diffDays}일 전`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths}개월 전`
  return `${Math.floor(diffMonths / 12)}년 전`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
