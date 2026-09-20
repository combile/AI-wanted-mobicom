import 'dotenv/config'
import express from 'express'
import { config, isGeminiConfigured, isNaverConfigured, isYoutubeConfigured } from './config/index.js'
import { listTrends } from './db/index.js'
import { trendsRouter } from './routes/trends.js'
import { adminRouter } from './routes/admin.js'
import { videosRouter } from './routes/videos.js'
import { runPipeline } from './pipeline/run.js'
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
      gemini: isGeminiConfigured,
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
  if (!isGeminiConfigured) console.warn('[server] GEMINI_API_KEY missing — curation step disabled')
  if (!config.adminToken) console.warn('[server] ADMIN_TOKEN missing — /api/admin/* is closed (503)')
  startScheduler()

  // 무료 호스팅(Render 등)은 재배포·슬립 후 재시작마다 로컬 디스크가 초기화될 수 있다.
  // 승인된 트렌드가 0건일 때만 예외적으로 운영자 승인 없이 자동 승인해 빈 화면을 피한다 —
  // 평소(스케줄러·수동 실행)에는 항상 사람이 승인한다.
  if (listTrends().length === 0) {
    console.log('[bootstrap] no trends found — running pipeline once with auto-approve to avoid an empty demo')
    runPipeline({ autoApprove: true }).catch((err) => console.error('[bootstrap] pipeline run failed', err))
  }
})
