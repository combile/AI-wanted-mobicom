import { Router } from 'express'
import { db, listReviewQueue, setReviewStatus, upsertTrend } from '../db/index.js'
import { runPipeline } from '../pipeline/run.js'
import type { ReviewItem } from '../types.js'

export const adminRouter = Router()

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
