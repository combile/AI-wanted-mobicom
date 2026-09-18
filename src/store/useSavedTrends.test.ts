import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSavedTrends } from './useSavedTrends'

const entries = () => useSavedTrends.getState().entries

describe('useSavedTrends', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-01T00:00:00Z'))
    useSavedTrends.setState({ entries: [] })
  })

  it('저장하면 그 시점의 점수와 시각을 기록한다', () => {
    useSavedTrends.getState().toggle('matcha', 24)
    expect(entries()).toEqual([{ id: 'matcha', savedAt: '2026-09-01T00:00:00.000Z', scoreAtSave: 24 }])
  })

  it('remove한 항목을 restore하면 "24점일 때 발견했다"는 기록이 그대로 돌아온다', () => {
    useSavedTrends.getState().toggle('matcha', 24)
    const original = entries()[0]

    useSavedTrends.getState().remove('matcha')
    expect(entries()).toEqual([])

    vi.setSystemTime(new Date('2026-09-10T00:00:00Z'))
    useSavedTrends.getState().restore(original)
    expect(entries()).toEqual([original])
  })

  it('restore를 두 번 불러도 중복되지 않는다', () => {
    useSavedTrends.getState().toggle('matcha', 24)
    const original = entries()[0]
    useSavedTrends.getState().restore(original)
    expect(entries()).toHaveLength(1)
  })

  it('실수로 저장을 풀었다가 바로 다시 누르면 처음 기록이 복원된다', () => {
    useSavedTrends.getState().toggle('matcha', 24)
    vi.setSystemTime(new Date('2026-09-10T00:00:00Z'))

    useSavedTrends.getState().toggle('matcha', 80) // 실수로 해제
    useSavedTrends.getState().toggle('matcha', 80) // 다시 저장

    expect(entries()).toEqual([{ id: 'matcha', savedAt: '2026-09-01T00:00:00.000Z', scoreAtSave: 24 }])
  })

  it('다른 트렌드를 저장할 때는 직전 기록을 끌어오지 않는다', () => {
    useSavedTrends.getState().toggle('matcha', 24)
    useSavedTrends.getState().toggle('matcha', 80)
    useSavedTrends.getState().toggle('y2k', 50)
    expect(entries()).toEqual([{ id: 'y2k', savedAt: '2026-09-01T00:00:00.000Z', scoreAtSave: 50 }])
  })
})
