import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve('data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'toolforge.db');
export const db = new DatabaseSync(DB_PATH);

export function initDatabase() {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      tagline TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      price_inr REAL NOT NULL,
      is_subscription INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending_review',
      version TEXT NOT NULL DEFAULT '1.0.0',
      release_notes TEXT,
      download_filename TEXT NOT NULL,
      file_size_kb INTEGER NOT NULL DEFAULT 1024,
      sales_count INTEGER NOT NULL DEFAULT 0,
      rating_avg REAL NOT NULL DEFAULT 5.0,
      rating_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      amount_inr REAL NOT NULL,
      commission_rate REAL NOT NULL,
      platform_fee_inr REAL NOT NULL,
      creator_earnings_inr REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      payment_method TEXT NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      idempotency_key TEXT UNIQUE,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS user_library (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      license_key TEXT NOT NULL,
      download_count INTEGER NOT NULL DEFAULT 0,
      purchased_at TEXT NOT NULL,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      added_at TEXT NOT NULL,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS platform_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_webhooks (
      id TEXT PRIMARY KEY,
      event_id TEXT UNIQUE NOT NULL,
      event_type TEXT NOT NULL,
      payload TEXT,
      status TEXT NOT NULL DEFAULT 'processed',
      created_at TEXT NOT NULL
    );

    INSERT OR IGNORE INTO platform_config (key, value) VALUES ('default_commission_rate', '0.10');
    INSERT OR IGNORE INTO platform_config (key, value) VALUES ('platform_name', 'ToolForge');
  `);
}

export function runInTransaction<T>(fn: () => T): T {
  db.exec('BEGIN TRANSACTION');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
