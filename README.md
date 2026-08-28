# nullbase

Monorepo for the nullbase developer reference — a fully static frontend and a
standalone Cloudflare Worker API.

```
                    GitHub
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   nullbase.wiki           api.nullbase.wiki
   Frontend Worker          API Worker
   (static assets)               │
          │                      ▼
          │                Cloudflare D1 (nullbase-db)
          ▼
       Browser
```

| Workspace | What | Where served | Data (dev) | Data (prod) |
|---|---|---|---|---|
| `web/` | Next.js static export (MDX reference, playgrounds) | `nullbase.wiki` | — | — |
| `api/` | Hono API on Cloudflare Workers | `api.nullbase.wiki` | SQLite via better-sqlite3 (`api/data/nullbase.db`) | D1 binding `DB` → `nullbase-db` |

## Getting started

```bash
npm install            # installs all workspaces
npm run db:migrate     # create local schema (api/data/nullbase.db)
npm run db:seed        # demo data
npm run db:admin -- admin@example.com yourpassword   # create an admin account

npm run dev:all        # web (localhost:3000) + api (localhost:8787)
# or separately:
npm run dev:web
npm run dev:api
```

Reset the local database anytime: `npm run db:reset`.

## API

Base URL is configured in **one place**: `web/lib/api.ts`
(`NEXT_PUBLIC_API_BASE_URL`, dev `http://localhost:8787`, prod
`https://api.nullbase.wiki`). All routes are versioned under `/v1`:

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET  | `/v1/health` | — | liveness + db check |
| POST | `/v1/admin/login` | — | email + password → session token |
| GET  | `/v1/admin/me` | token | session identity |
| GET  | `/v1/admin/feedback` | token | list feedback (filters + pagination) |
| PATCH| `/v1/admin/feedback/:id` | token | triage status |
| POST | `/v1/feedback` | — | submit page feedback |
| GET  | `/v1/likes?page=/http` | — | like count for a page |
| POST | `/v1/likes` | — | like a page (deduped per visitor) |

The database layer is a port/adapters design: services and repositories are
written once against `api/src/db/port.ts`; `db/d1.ts` (production) and
`db/sqlite.ts` (development) are the only driver-specific code.

## Database commands

| Command | Local (SQLite) | Production (D1) |
|---|---|---|
| migrate | `npm run db:migrate` | `npm run db:migrate:remote` |
| seed    | `npm run db:seed` | `npm run db:seed:remote` |
| reset   | `npm run db:reset` | — |
| admin   | `npm run db:admin -- <email> <password>` | prints the SQL to run via `wrangler d1 execute --remote` |

Schema lives in `api/migrations/` — the same files for both engines.

## Deployment (independent — one never triggers the other)

```bash
npm run deploy:web   # build web/ then `wrangler deploy` (static assets worker)
npm run deploy:api   # `wrangler deploy` in api/ (API worker + D1 binding)
```

Secrets: `cd api && npx wrangler secret put ADMIN_TOKEN_SECRET` (required in
production). Local development uses a dev default from `.dev.vars`
(see `api/.dev.vars.example`) — never commit real secrets.
