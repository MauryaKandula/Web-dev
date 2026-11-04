import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db, initDatabase } from './database.ts';

/** Create local-only test identities. Catalog listings and reviews are never seeded. */
export function seedData() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Local demo identities must never be seeded in production.');
  }

  initDatabase();

  const salt = bcrypt.genSaltSync(10);
  const randomPasswordHash = () => bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), salt);
  const users = [
    ['usr_admin', 'admin@toolforge.test', randomPasswordHash(), 'Local Admin', 'admin'],
    ['usr_creator_1', 'creator@toolforge.test', randomPasswordHash(), 'Demo Creator', 'creator'],
    ['usr_creator_2', 'builder@toolforge.test', randomPasswordHash(), 'Demo Builder', 'creator'],
    ['usr_customer', 'customer@toolforge.test', randomPasswordHash(), 'Demo Customer', 'customer']
  ] as const;

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const [id, email, passwordHash, name, role] of users) {
    insertUser.run(id, email, passwordHash, name, role, '', new Date().toISOString());
  }

  console.log('[Seed] Local test identities are ready. No marketplace products or reviews were added.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedData();
}
