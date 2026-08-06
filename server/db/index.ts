import { createRequire } from 'node:module'
import * as schema from './schema'

const require = createRequire(import.meta.url)

let _db: any = null

export function getDb(): any {
  if (_db) return _db

  const config  = useRuntimeConfig()
  const dialect = config.dbDialect || 'sqlite'
  const url     = config.dbUrl || './data/memorial.db'

  if (dialect === 'sqlite') {
    const Database               = require('better-sqlite3')
    const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3')
    const sqlite                 = new Database(url)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')
    initSqlite(sqlite)
    _db = drizzleSqlite(sqlite, { schema })
    return _db
  }

  if (dialect === 'postgres') {
    const { drizzle: drizzlePg } = require('drizzle-orm/node-postgres')
    const { Pool }               = require('pg')
    const pool                   = new Pool({ connectionString: url })
    _db = drizzlePg(pool, { schema })
    return _db
  }

  if (dialect === 'mariadb') {
    const { drizzle: drizzleMysql } = require('drizzle-orm/mysql2')
    const mysql2                    = require('mysql2/promise')
    const pool                      = mysql2.createPool(url)
    _db = drizzleMysql(pool, { schema, mode: 'default' })
    return _db
  }

  throw new Error(`Unknown DB_DIALECT: ${dialect}. Use sqlite, postgres, or mariadb.`)
}

function initSqlite(sqlite: any) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      message       TEXT    NOT NULL,
      email         TEXT,
      password_hash TEXT,
      highlight     INTEGER NOT NULL DEFAULT 0,
      active        INTEGER NOT NULL DEFAULT 1,
      custom_fields TEXT,
      create_time   INTEGER NOT NULL,
      update_time   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS message_images (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      path       TEXT    NOT NULL,
      "order"    INTEGER NOT NULL DEFAULT 0
    );
  `)
}
