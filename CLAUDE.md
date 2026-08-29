# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

nullbase is a monorepo for a developer reference site: a fully static Next.js
frontend (`web/`) and a standalone Cloudflare Worker API (`api/`), deployed
and served independently.

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

| Workspace | What | Served at | Dev data | Prod data |
|---|---|---|---|---|
| `web/` | Next.js static export (MDX reference content, playgrounds) | `nullbase.wiki` | — | — |
| `api/` | Hono API on Cloudflare Workers | `api.nullbase.wiki` | SQLite via better-sqlite3 (`api/data/nullbase.db`) | D1 binding `DB` → `nullbase-db` |

npm workspaces tie the two together (`web`, `api`); each deploys as its own
Cloudflare Worker and one never triggers the other.

## Commands

Run from the repo root unless noted.

```bash
npm install                                          # installs all workspaces
npm run db:migrate                                    # create local schema (api/data/nullbase.db)
npm run db:seed                                        # demo data
npm run db:admin -- admin@example.com yourpassword      # create an admin account
npm run db:reset                                        # wipe + re-migrate + re-seed local db

npm run dev:all      # web (localhost:3000) + api (localhost:8787), concurrently
npm run dev:web       # web only
npm run dev:api        # api only

npm run lint           # eslint (web) + tsc --noEmit (api)
npm run build           # next build -> web/out (static export)

npm run deploy:web    # build web/, then `wrangler deploy` (static assets worker)
npm run deploy:api     # `wrangler deploy` in api/ (API worker + D1 binding)
```

There is no test suite in either workspace. `npm run lint` (ESLint for `web/`,
`tsc --noEmit` for `api/`) is the correctness gate before shipping changes.
`api/scripts/smoke-test.ps1` and `api/scripts/anti-spam-test.ps1` are manual
PowerShell smoke scripts against a running dev API, not part of `npm run lint`.

Remote (production D1) database commands, run from `api/`:

```bash
npm run db:migrate:remote                 # wrangler d1 migrations apply nullbase-db --remote
npm run db:seed:remote                     # wrangler d1 execute --remote --file migrations/seed.sql
npm run db:admin                            # local: writes the admin row; against remote it instead
                                              # prints the SQL to run via `wrangler d1 execute --remote`
```

Schema lives in `api/migrations/` — the same `.sql` files apply to both the
local SQLite runner and D1.

## API architecture (`api/`)

Hono app on Cloudflare Workers. All routes are versioned under `/v1`.

- **`src/app.ts`** is the only place routing, middleware, services, and the
  database port are wired together (`createApp(config)`). Both runtime
  entrypoints call it with their own adapter — business logic exists exactly
  once.
- **`src/worker.ts`** — production Cloudflare Worker entrypoint. Reads the D1
  binding (`env.DB`) and `ADMIN_TOKEN_SECRET`, builds an `AppConfig`, calls
  `createApp`.
- **`src/dev-server.ts`** — plain-Node dev entrypoint (`@hono/node-server`),
  runs the *same* app against `better-sqlite3` at `api/data/nullbase.db`. No
  wrangler/workerd involved; started via `tsx watch`.
- **Database port/adapters** (`src/db/port.ts`): the `Database`/`DbStatement`
  interfaces are the *only* database abstraction services/repositories may
  depend on. The shape mirrors Cloudflare D1's prepared-statement API, so
  `db/d1.ts` (production) is a thin wrapper and `db/sqlite.ts` (dev) adapts
  better-sqlite3 to the same interface. Known limitation: no multi-statement
  transactions yet (D1 has `batch()`, better-sqlite3 has sync transactions) —
  add that to the port before writing repository code that needs it.
- **Layering**: `routes/` (Hono handlers) → `services/` (business logic,
  built once in `services/index.ts` via `createServices(db, tokenSecret)`) →
  `repositories/` (SQL against the `Database` port). Routes never touch the
  db port directly.
- Errors: throw typed errors from `services/errors.ts` (e.g.
  `RateLimitedError`); `app.onError` in `app.ts` maps them to HTTP responses
  (429 with `Retry-After`, etc). Don't handle these per-route.
- CORS is explicit and environment-driven (`ALLOWED_ORIGINS`), since the
  frontend and API are different origins by design — see
  `src/middleware/cors.ts` and the `DEFAULT_ALLOWED_ORIGINS` fallback in
  `worker.ts`.
- Auth is a bearer session token issued by `POST /v1/admin/login`, verified
  by `src/middleware/auth.ts`; `ADMIN_TOKEN_SECRET` is a Wrangler secret in
  prod (`npx wrangler secret put ADMIN_TOKEN_SECRET`) and a `.dev.vars`
  default locally (see `api/.dev.vars.example` — never commit real secrets).
- Anti-spam / anti-abuse uses a visitor identity header (`X-Visitor-Id`, a
  random client-side UUID, not a fingerprint) — see `src/lib/identity.ts` and
  `web/lib/visitor.ts` on the frontend side.

## Web architecture (`web/`)

Next.js App Router, `output: "export"` — a fully static site (`next build`
emits plain HTML/CSS/JS to `web/out`, deployed as a Cloudflare Workers static
assets site per `web/wrangler.jsonc`). There is no Next.js server at runtime;
anything requiring `node:fs` etc. only runs at build time.

- **Content is data, not code.** Every page under `web/content/**/*.mdx`
  becomes a statically generated route automatically — adding an `.mdx` file
  is enough, there is no routing table to edit. The catch-all
  `app/[...slug]/page.tsx` handles every path with ≥1 segment (`/` is
  `app/page.tsx`); `dynamicParams = false` means only slugs produced by
  `generateStaticParams` (i.e. `getAllSlugs()`) exist — everything else 404s.
- **`lib/content/loader.ts`** walks `web/content` for `.mdx` files, derives
  the URL slug from the file path (`index.mdx` drops the trailing segment),
  parses YAML frontmatter with `gray-matter`, and validates it against
  **`lib/content/schema.ts`**'s `PageFrontmatterSchema` (zod) — `title`,
  optional `description`/`category`/`weight`, `interactive` +
  `interactiveType` (`"http-request" | "status-explorer" |
  "headers-playground"`) for pages embedding a playground, `toc`. Invalid
  frontmatter throws at build time — fix the `.mdx` file, not the loader.
  `getSearchIndex()` builds the client-side search data from the same tree.
- The page component dynamically `import()`s the compiled `.mdx` module by
  its file-relative path — this is how @next/mdx's Next integration resolves
  MDX-as-route content.
- Interactive playgrounds (`components/http/HttpRequest.tsx`,
  `StatusCodeExplorer.tsx`) simulate responses client-side; there's no server
  to call in a static export, so these are self-contained, not API-backed.
- **`lib/api.ts`** is the single source of truth for talking to the `api/`
  worker: base URL (`NEXT_PUBLIC_API_BASE_URL`, dev `http://localhost:8787`,
  prod `https://api.nullbase.wiki` — baked in at build time since a static
  export has no runtime env), a hardened `fetch` wrapper (10s timeout, no
  credentials, zod-validated responses, typed `ApiError`), and one function
  per API route (`getPageLikes`, `likePage`, `submitFeedback`). Add new API
  calls here rather than calling `fetch` from components directly.
- MDX rendering uses `remark-frontmatter` + `rehype-pretty-code` (Shiki,
  light/dark themes) configured in `next.config.ts`; plugin options must stay
  string/array-serializable (no JS-function plugin options) since Turbopack
  can't accept those.
- `web/AGENTS.md` / `web/CLAUDE.md` are auto-regenerated by `next dev` on
  every run (see the file's own header) — don't hand-edit them, and don't be
  surprised if they show as modified in git status.

## Conventions worth knowing

- Everything on the API side is written once against the `Database` port —
  never import `better-sqlite3` or D1-specific types outside `db/d1.ts` /
  `db/sqlite.ts`.
- Adding a new content topic/collection on the frontend is purely additive:
  drop `.mdx` files with valid frontmatter under `web/content/`; no code
  changes needed for routing, static params, or search indexing.
- The two workspaces deploy independently and know nothing about each
  other's internals — cross-cutting contracts (API base URL, route shapes)
  live in `web/lib/api.ts` on one side and `api/src/routes/*.ts` on the
  other; keep both in sync by hand when a route's shape changes.
