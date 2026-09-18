import { Router } from 'express'
import { isAdminToken } from '../auth.js'
import { config } from '../config/index.js'
import { db, listReviewQueue, setReviewStatus, upsertTrend } from '../db/index.js'
import { runPipeline } from '../pipeline/run.js'
import type { ReviewItem } from '../types.js'

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

// Manual trigger — handy while there's no cron running yet (e.g. during local setup).
adminRouter.post('/pipeline/run', async (_req, res) => {
  try {
    const summary = await runPipeline()
    res.json({ ok: true, summary })
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) })
  }
})
