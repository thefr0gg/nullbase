/**
 * Creates or updates an admin account.
 *
 * Local development:
 *   npm run db:admin -- admin@nullbase.wiki s3cret!
 *   → writes the hashed row straight into api/data/nullbase.db.
 *
 * The same PBKDF2 SQL is printed for production (D1 has no shell access):
 *   npx wrangler d1 execute nullbase-db --remote --command "<printed SQL>"
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "../src/lib/crypto";
import { SqliteDatabase } from "../src/db/sqlite";

const [emailArg, passwordArg] = process.argv.slice(2);

if (!emailArg || !passwordArg || !emailArg.includes("@")) {
  console.error("usage: npm run db:admin -- <email> <password>");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const { hash, salt } = await hashPassword(passwordArg);

// Print the portable SQL FIRST so it is available even if the local write fails.
const remoteSql =
  `INSERT INTO admin_users (email, password_hash, password_salt, created_at) ` +
  `VALUES ('${email}', '${hash}', '${salt}', '${new Date().toISOString()}') ` +
  `ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, password_salt = excluded.password_salt;`;

console.log("Production (D1) — run:");
console.log(`  npx wrangler d1 execute nullbase-db --remote --command "${remoteSql.replace(/"/g, '\\"')}"`);
console.log("");

const here = path.dirname(fileURLToPath(import.meta.url));
const dbFile = process.env.SQLITE_PATH ?? path.resolve(here, "../data/nullbase.db");
const db = new SqliteDatabase(dbFile);

db.handle
  .prepare(
    `INSERT INTO admin_users (email, password_hash, password_salt, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       password_hash = excluded.password_hash,
       password_salt = excluded.password_salt`,
  )
  .run(email, hash, salt, new Date().toISOString());

console.log(`local admin written: ${email} -> ${dbFile}`);
db.close();