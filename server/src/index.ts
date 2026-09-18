import 'dotenv/config'
import express from 'express'
import { config, isAnthropicConfigured, isNaverConfigured, isYoutubeConfigured } from './config/index.js'
import { trendsRouter } from './routes/trends.js'
import { adminRouter } from './routes/admin.js'
import { videosRouter } from './routes/videos.js'
import { startScheduler } from './scheduler.js'

const app = express()
app.use(express.json())
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    configured: {
      naver: isNaverConfigured,
      youtube: isYoutubeConfigured,
      anthropic: isAnthropicConfigured,
    },
  })
})

app.use('/api/trends', trendsRouter)
app.use('/api/videos', videosRouter)
app.use('/api/admin', adminRouter)

app.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port}`)
  if (!isNaverConfigured) console.warn('[server] NAVER_CLIENT_ID/SECRET missing — search/news/shopping signals disabled')
  if (!isYoutubeConfigured) console.warn('[server] YOUTUBE_API_KEY missing — content discovery disabled')
  if (!isAnthropicConfigured) console.warn('[server] ANTHROPIC_API_KEY missing — curation step disabled')
  if (!config.adminToken) console.warn('[server] ADMIN_TOKEN missing — /api/admin/* is closed (503)')
  startScheduler()
})
