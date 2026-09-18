import cron from 'node-cron'
import { config } from './config/index.js'
import { runPipeline } from './pipeline/run.js'

export function startScheduler() {
  if (!cron.validate(config.pipelineCron)) {
    console.warn(`[scheduler] invalid PIPELINE_CRON "${config.pipelineCron}" — scheduler disabled`)
    return
  }
  console.log(`[scheduler] pipeline scheduled: ${config.pipelineCron}`)
  cron.schedule(config.pipelineCron, () => {
    runPipeline().catch((err) => console.error('[scheduler] pipeline run failed', err))
  })
}
