/**
 * Local SQLite seeder (development only). Applies migrations/seed.sql to
 * api/data/nullbase.db. For production, use
 * `npm run db:seed:remote` (wrangler d1 execute --remote --file seed.sql).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SqliteDatabase } from "../src/db/sqlite";

const here = path.dirname(fileURLToPath(import.meta.url));
const dbFile = process.env.SQLITE_PATH ?? path.resolve(here, "../data/nullbase.db");

const db = new SqliteDatabase(dbFile);
db.handle.exec(fs.readFileSync(path.resolve(here, "../migrations/seed.sql"), "utf-8"));
console.log(`seeded: ${dbFile}`);
db.close();