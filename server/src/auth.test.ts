import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isAdminToken } from './auth.js'

test('isAdminToken: Bearer 토큰이 정확히 일치할 때만 통과', () => {
  assert.equal(isAdminToken('Bearer secret-abc', 'secret-abc'), true)
  assert.equal(isAdminToken(undefined, 'secret-abc'), false)
  assert.equal(isAdminToken('', 'secret-abc'), false)
  assert.equal(isAdminToken('secret-abc', 'secret-abc'), false) // Bearer 접두사 없음
  assert.equal(isAdminToken('Bearer nope', 'secret-abc'), false) // 길이 다름
  assert.equal(isAdminToken('Bearer secret-abd', 'secret-abc'), false) // 길이 같고 값 다름
  assert.equal(isAdminToken('Bearer ', 'secret-abc'), false)
})
