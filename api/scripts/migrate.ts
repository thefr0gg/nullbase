/**
 * Local SQLite migration runner (development only).
 *
 * Applies api/migrations/*.sql to api/data/nullbase.db via better-sqlite3,
 * tracking applied files in a `_migrations` table. The SAME sql files are
 * applied to production D1 by `npm run db:migrate:remote`
 * (`wrangler d1 migrations apply`), so there is exactly one schema source.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SqliteDatabase } from "../src/db/sqlite";

const here = path.dirname(fileURLToPath(import.meta.url));
const dbFile = process.env.SQLITE_PATH ?? path.resolve(here, "../data/nullbase.db");
const migrationsDir = path.resolve(here, "../migrations");

const db = new SqliteDatabase(dbFile);

db.handle.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )
`);

const applied = new Set(
  (db.handle.prepare("SELECT name FROM _migrations").all() as { name: string }[]).map(
    (r) => r.name,
  ),
);

const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql") && f !== "seed.sql")
  .sort();

let ran = 0;
for (const file of files) {
  if (applied.has(file)) continue;
  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
  // Atomic apply via raw SQL (better-sqlite3 forbids db.exec inside its
  // transaction() helper): schema + bookkeeping commit together, or not at all.
  const timestamp = new Date().toISOString();
  try {
    db.handle.exec(
      `BEGIN;\n${sql}\nINSERT INTO _migrations (name, applied_at) VALUES ('${file}', '${timestamp}');\nCOMMIT;`,
    );
  } catch (err) {
    try {
      db.handle.exec("ROLLBACK;");
    } catch {
      /* nothing to roll back */
    }
    throw err;
  }
  console.log(`applied  ${file}`);
  ran++;
}

if (ran === 0) console.log("up to date — no pending migrations");
console.log(`database: ${dbFile}`);
db.close();