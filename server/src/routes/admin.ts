import { Router } from 'express'
import { isAdminToken } from '../auth.js'
import { config } from '../config/index.js'
import { db, getTrend, listReviewQueue, setReviewStatus, upsertTrend } from '../db/index.js'
import { runPipeline } from '../pipeline/run.js'
import type { CategoryKey, ReviewItem } from '../types.js'

const CATEGORY_KEYS: CategoryKey[] = [
  'issue',
  'meme',
  'content',
  'entertainment',
  'fashion',
  'beauty',
  'food',
  'place',
  'item',
  'lifestyle',
  'design',
  'tech',
]

export const adminRouter = Router()

// 관리자 API는 유료 외부 API 호출(파이프라인)과 노출 승인을 다루므로 토큰 없이는 열지 않는다.
// ADMIN_TOKEN이 설정돼 있지 않으면 아예 닫힌다(기본이 안전한 쪽).
adminRouter.use((req, res, next) => {
  if (!config.adminToken) return res.status(503).json({ error: 'admin_disabled', hint: 'set ADMIN_TOKEN' })
  if (!isAdminToken(req.header('authorization'), config.adminToken)) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  next()
})

adminRouter.get('/review', (_req, res) => {
  res.json({ items: listReviewQueue('pending') })
})

adminRouter.post('/review/:id/approve', (req, res) => {
  const row = db.prepare('SELECT data FROM review_queue WHERE id = ?').get(req.params.id) as { data: string } | undefined
  if (!row) return res.status(404).json({ error: 'not_found' })
  const item = JSON.parse(row.data) as ReviewItem
  upsertTrend(item.draft)
  setReviewStatus(item.id, 'approved')
  res.json({ ok: true, trend: item.draft })
})

adminRouter.post('/review/:id/reject', (req, res) => {
  setReviewStatus(req.params.id, 'rejected')
  res.json({ ok: true })
})

// 큐레이션이 카테고리를 잘못 골랐을 때(예: 스포츠 결과가 entertainment로 분류됨) 재승인 없이
// 바로 고치기 위한 수동 보정용. 승인 큐를 다시 거치지 않는다.
adminRouter.patch('/trends/:id/category', (req, res) => {
  const { category } = req.body as { category?: string }
  if (!category || !CATEGORY_KEYS.includes(category as CategoryKey)) {
    return res.status(400).json({ error: 'invalid_category', allowed: CATEGORY_KEYS })
  }
  const trend = getTrend(req.params.id)
  if (!trend) return res.status(404).json({ error: 'not_found' })
  upsertTrend({ ...trend, category: category as CategoryKey })
  res.json({ ok: true, trend: getTrend(req.params.id) })
})

// Manual trigger — handy while there's no cron running yet (e.g. during local setup).
adminRouter.post('/pipeline/run', async (_req, res) => {
  try {
    const summary = await runPipeline()
    res.json({ ok: true, summary })
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) })
  }
})
