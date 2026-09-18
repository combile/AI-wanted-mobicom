import { describe, expect, it } from 'vitest'
import { formatChange, formatViews } from './format'

describe('formatViews', () => {
  it.each([
    [0, '0회'],
    [999, '999회'],
    [1000, '1천회'],
    [9_999, '9.9천회'],
    [12_345, '1.2만회'],
    [100_000, '10만회'],
    [3_456_789, '345만회'],
    [100_000_000, '1억회'],
    [1_234_567_890, '12.3억회'],
  ])('%i → %s', (views, expected) => {
    expect(formatViews(views)).toBe(expected)
  })
})

describe('formatChange', () => {
  it('양수에만 + 기호를 붙인다', () => {
    expect(formatChange(12)).toBe('+12%')
    expect(formatChange(0)).toBe('0%')
    expect(formatChange(-4)).toBe('-4%')
  })
})
