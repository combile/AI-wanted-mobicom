function optional(name: string): string | undefined {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

export const config = {
  naver: {
    clientId: optional('NAVER_CLIENT_ID'),
    clientSecret: optional('NAVER_CLIENT_SECRET'),
  },
  youtube: {
    apiKey: optional('YOUTUBE_API_KEY'),
  },
  anthropic: {
    apiKey: optional('ANTHROPIC_API_KEY'),
  },
  pipelineCron: optional('PIPELINE_CRON') ?? '0 */4 * * *',
  port: Number(optional('PORT') ?? '8787'),
  dbPath: optional('DB_PATH') ?? './data/now-earth.sqlite',
}

export const isNaverConfigured = Boolean(config.naver.clientId && config.naver.clientSecret)
export const isYoutubeConfigured = Boolean(config.youtube.apiKey)
export const isAnthropicConfigured = Boolean(config.anthropic.apiKey)
