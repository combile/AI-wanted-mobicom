/**
 * ttl 동안 결과를 기억한다. 외부 API 쿼터를 아끼기 위한 것.
 * - 동시에 여러 요청이 와도 load는 한 번만 돈다.
 * - 갱신이 실패했는데 이전 값이 있으면 그 값을 계속 돌려준다(오래된 목록이 빈 화면보다 낫다).
 */
export function memo<T>(ttlMs: number, load: () => Promise<T>, now: () => number = Date.now) {
  let value: T | undefined
  let loadedAt = -Infinity
  let inflight: Promise<T> | undefined

  return async (): Promise<T> => {
    if (value !== undefined && now() - loadedAt < ttlMs) return value
    inflight ??= load()
      .then((fresh) => {
        value = fresh
        loadedAt = now()
        return fresh
      })
      .finally(() => {
        inflight = undefined
      })
    try {
      return await inflight
    } catch (err) {
      if (value !== undefined) return value
      throw err
    }
  }
}
