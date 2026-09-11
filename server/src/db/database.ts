import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';

const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite');
type DatabaseSync = any;

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure target folder exists
  const dbDir = path.dirname(config.databasePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new DatabaseSync(config.databasePath);

  // Enable WAL mode for better concurrent performance
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA foreign_keys = ON;');

  initSchema(dbInstance);
  return dbInstance;
}

function initSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'guest',
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      method TEXT NOT NULL,
      url TEXT NOT NULL,
      headers_json TEXT DEFAULT '{}',
      body_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'guest',
      method TEXT NOT NULL,
      url TEXT NOT NULL,
      status_code INTEGER,
      latency_ms REAL,
      size_bytes INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS environments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'guest',
      name TEXT NOT NULL,
      variables_json TEXT NOT NULL DEFAULT '{}',
      is_active INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

export interface CollectionRecord {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
  requests?: SavedRequestRecord[];
}

export interface SavedRequestRecord {
  id: number;
  collection_id: number;
  name: string;
  method: string;
  url: string;
  headers_json: string;
  body_json: string | null;
  created_at: string;
}

export interface HistoryRecord {
  id: number;
  user_id: string;
  method: string;
  url: string;
  status_code: number;
  latency_ms: number;
  size_bytes: number;
  created_at: string;
}

export interface EnvironmentRecord {
  id: number;
  user_id: string;
  name: string;
  variables_json: string;
  is_active: number;
  created_at: string;
}

// Database helper functions
export const db = {
  getCollections(userId = 'guest'): CollectionRecord[] {
    const database = getDatabase();
    const rows = database
      .prepare('SELECT * FROM collections WHERE user_id = ? OR user_id = \'system\' ORDER BY id ASC')
      .all(userId) as any[];

    const collections: CollectionRecord[] = [];
    const getRequestsStmt = database.prepare(
      'SELECT * FROM saved_requests WHERE collection_id = ? ORDER BY id ASC'
    );

    for (const row of rows) {
      const requests = getRequestsStmt.all(row.id) as SavedRequestRecord[];
      collections.push({
        ...row,
        requests,
      });
    }

    return collections;
  },

  createCollection(name: string, userId = 'guest'): CollectionRecord {
    const database = getDatabase();
    const now = new Date().toISOString();
    const result = database
      .prepare('INSERT INTO collections (user_id, name, created_at) VALUES (?, ?, ?)')
      .run(userId, name, now);

    return {
      id: Number(result.lastInsertRowid),
      user_id: userId,
      name,
      created_at: now,
      requests: [],
    };
  },

  deleteCollection(id: number, userId = 'guest'): boolean {
    const database = getDatabase();
    const result = database
      .prepare('DELETE FROM collections WHERE id = ? AND (user_id = ? OR user_id = \'guest\')')
      .run(id, userId);
    return Number(result.changes) > 0;
  },

  saveRequest(
    collectionId: number,
    name: string,
    method: string,
    url: string,
    headers: Record<string, string> = {},
    body?: string
  ): SavedRequestRecord {
    const database = getDatabase();
    const now = new Date().toISOString();
    const headersJson = JSON.stringify(headers);
    const bodyJson = body || null;

    const result = database
      .prepare(`
        INSERT INTO saved_requests (collection_id, name, method, url, headers_json, body_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(collectionId, name, method, url, headersJson, bodyJson, now);

    return {
      id: Number(result.lastInsertRowid),
      collection_id: collectionId,
      name,
      method,
      url,
      headers_json: headersJson,
      body_json: bodyJson,
      created_at: now,
    };
  },

  deleteSavedRequest(id: number): boolean {
    const database = getDatabase();
    const result = database.prepare('DELETE FROM saved_requests WHERE id = ?').run(id);
    return Number(result.changes) > 0;
  },

  getHistory(userId = 'guest', limit = 50): HistoryRecord[] {
    const database = getDatabase();
    return database
      .prepare('SELECT * FROM history WHERE user_id = ? ORDER BY id DESC LIMIT ?')
      .all(userId, limit) as any[];
  },

  addHistory(
    userId: string,
    method: string,
    url: string,
    statusCode: number,
    latencyMs: number,
    sizeBytes = 0
  ): HistoryRecord {
    const database = getDatabase();
    const now = new Date().toISOString();
    const result = database
      .prepare(`
        INSERT INTO history (user_id, method, url, status_code, latency_ms, size_bytes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(userId, method, url, statusCode, latencyMs, sizeBytes, now);

    return {
      id: Number(result.lastInsertRowid),
      user_id: userId,
      method,
      url,
      status_code: statusCode,
      latency_ms: latencyMs,
      size_bytes: sizeBytes,
      created_at: now,
    };
  },

  clearHistory(userId = 'guest'): boolean {
    const database = getDatabase();
    const result = database.prepare('DELETE FROM history WHERE user_id = ?').run(userId);
    return Number(result.changes) > 0;
  },

  getEnvironments(userId = 'guest'): EnvironmentRecord[] {
    const database = getDatabase();
    return database
      .prepare('SELECT * FROM environments WHERE user_id = ? OR user_id = \'system\' ORDER BY id ASC')
      .all(userId) as any[];
  },

  saveEnvironment(name: string, variables: Record<string, string>, isActive = 0, userId = 'guest'): EnvironmentRecord {
    const database = getDatabase();
    const now = new Date().toISOString();
    const variablesJson = JSON.stringify(variables);

    if (isActive === 1) {
      database.prepare('UPDATE environments SET is_active = 0 WHERE user_id = ?').run(userId);
    }

    const result = database
      .prepare(`
        INSERT INTO environments (user_id, name, variables_json, is_active, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(userId, name, variablesJson, isActive, now);

    return {
      id: Number(result.lastInsertRowid),
      user_id: userId,
      name,
      variables_json: variablesJson,
      is_active: isActive,
      created_at: now,
    };
  },
};
