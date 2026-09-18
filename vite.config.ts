import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 프론트의 axios는 /api 로만 요청한다 → 개발 중에는 server/(8787)로 넘긴다.
    proxy: { '/api': 'http://localhost:8787' },
  },
  // server/ 의 테스트는 node:test로 따로 돈다(cd server && npm test).
  test: { include: ['src/**/*.test.ts'] },
})
