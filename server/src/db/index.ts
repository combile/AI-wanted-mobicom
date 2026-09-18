import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { config } from '../config/index.js'
import type { ReviewItem, TrendCard } from '../types.js'

mkdirSync(dirname(config.dbPath), { recursive: true })
export const db = new DatabaseSync(config.dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS trends (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS review_queue (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS score_history (
    trend_id TEXT NOT NULL,
    date TEXT NOT NULL,
    score INTEGER NOT NULL,
    PRIMARY KEY (trend_id, date)
  );

  -- Raw per-candidate signal snapshots (e.g. today's YouTube mention count for a keyword),
  -- used to compute period-over-period growth for signals that have no built-in history API.
  CREATE TABLE IF NOT EXISTS candidate_snapshots (
    keyword TEXT NOT NULL,
    metric TEXT NOT NULL,
    date TEXT NOT NULL,
    value REAL NOT NULL,
    PRIMARY KEY (keyword, metric, date)
  );
`)

export function upsertTrend(trend: TrendCard) {
  db.prepare(
    `INSERT INTO trends (id, data, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  ).run(trend.id, JSON.stringify(trend))

  db.prepare(
    `INSERT INTO score_history (trend_id, date, score) VALUES (?, date('now'), ?)
     ON CONFLICT(trend_id, date) DO UPDATE SET score = excluded.score`,
  ).run(trend.id, trend.score)
}

export function listTrends(): TrendCard[] {
  const rows = db.prepare('SELECT data FROM trends ORDER BY updated_at DESC').all() as { data: string }[]
  return rows.map((r) => JSON.parse(r.data) as TrendCard)
}

export function getTrend(id: string): TrendCard | undefined {
  const row = db.prepare('SELECT data FROM trends WHERE id = ?').get(id) as { data: string } | undefined
  return row ? (JSON.parse(row.data) as TrendCard) : undefined
}

export function enqueueReview(item: ReviewItem) {
  db.prepare(
    `INSERT INTO review_queue (id, data, status, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
  ).run(item.id, JSON.stringify(item), item.status, item.createdAt)
}

export function listReviewQueue(status: 'pending' | 'approved' | 'rejected' = 'pending'): ReviewItem[] {
  const rows = db.prepare('SELECT data FROM review_queue WHERE status = ? ORDER BY created_at DESC').all(status) as {
    data: string
  }[]
  return rows.map((r) => JSON.parse(r.data) as ReviewItem)
}

export function setReviewStatus(id: string, status: 'approved' | 'rejected') {
  db.prepare('UPDATE review_queue SET status = ? WHERE id = ?').run(status, id)
}

export function recordSnapshot(keyword: string, metric: string, value: number) {
  db.prepare(
    `INSERT INTO candidate_snapshots (keyword, metric, date, value) VALUES (?, ?, date('now'), ?)
     ON CONFLICT(keyword, metric, date) DO UPDATE SET value = excluded.value`,
  ).run(keyword, metric, value)
}

/** Most recent snapshot strictly before today, used as the "previous period" baseline. */
export function getPreviousSnapshot(keyword: string, metric: string): number | null {
  const row = db
    .prepare(
      `SELECT value FROM candidate_snapshots
       WHERE keyword = ? AND metric = ? AND date < date('now')
       ORDER BY date DESC LIMIT 1`,
    )
    .get(keyword, metric) as { value: number } | undefined
  return row ? row.value : null
}
