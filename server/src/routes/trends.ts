import { Router } from 'express'
import { getTrend, listTrends } from '../db/index.js'

export const trendsRouter = Router()

trendsRouter.get('/', (_req, res) => {
  res.json({ trends: listTrends() })
})

trendsRouter.get('/:id', (req, res) => {
  const trend = getTrend(req.params.id)
  if (!trend) return res.status(404).json({ error: 'not_found' })
  res.json({ trend })
})
