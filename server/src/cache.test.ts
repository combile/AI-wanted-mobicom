import assert from 'node:assert/strict'
import { test } from 'node:test'
import { memo } from './cache.js'

test('memo: ttl 안에서는 다시 부르지 않고, 지나면 다시 부른다', async () => {
  let clock = 0
  let calls = 0
  const get = memo(1000, async () => ++calls, () => clock)

  assert.equal(await get(), 1)
  clock = 999
  assert.equal(await get(), 1)
  clock = 1000
  assert.equal(await get(), 2)
  assert.equal(calls, 2)
})

test('memo: 동시에 온 요청은 load를 한 번만 돌린다', async () => {
  let calls = 0
  const get = memo(1000, async () => ++calls)
  assert.deepEqual(await Promise.all([get(), get(), get()]), [1, 1, 1])
})

test('memo: 갱신 실패 시 이전 값을 돌려주고, 이전 값이 없으면 던진다', async () => {
  let clock = 0
  let fail = false
  const get = memo(
    1000,
    async () => {
      if (fail) throw new Error('quota exceeded')
      return 'fresh'
    },
    () => clock,
  )

  assert.equal(await get(), 'fresh')
  fail = true
  clock = 5000
  assert.equal(await get(), 'fresh')

  const cold = memo(1000, async () => {
    throw new Error('quota exceeded')
  })
  await assert.rejects(cold, /quota exceeded/)
})
