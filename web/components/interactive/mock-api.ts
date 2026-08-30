/**
 * A tiny, pure, client-side "REST API" simulator for `RequestPlayground`'s
 * `http` protocol. Nothing here is a real network call — it's the same kind
 * of deterministic string templating every widget on the site already does,
 * just varied by path/method instead of collapsing everything into one
 * always-200 echo. This is what makes exploring *different* paths actually
 * teach something (a 404 for an unknown id, a 401 without credentials, a
 * 400 for a malformed body) instead of every request looking identical.
 */

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

export interface SimulatedResult {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
}

export interface HttpAdapterInput {
  target: string;
  method: HttpMethod;
  headers: string; // raw "Name: value" lines, as typed into the headers textarea
  body: string;
}

export interface ExamplePath {
  method: HttpMethod;
  path: string;
  label?: string;
}

/** The chip set shown under the target field when a page doesn't supply
 *  its own — deliberately spans the variety the router below produces. */
export const DEFAULT_HTTP_EXAMPLES: ExamplePath[] = [
  { method: "GET", path: "/api/users" },
  { method: "GET", path: "/api/users/42" },
  { method: "GET", path: "/api/users/999" },
  { method: "POST", path: "/api/users" },
  { method: "GET", path: "/api/profile" },
];

export function parseHeaders(text: string): [string, string][] {
  const out: [string, string][] = [];
  for (const line of text.split("\n")) {
    const [k, ...rest] = line.trim().split(":");
    if (!k) continue;
    const v = rest.join(":").trim();
    if (k.trim() && v) out.push([k.trim(), v]);
  }
  return out;
}

function json(
  status: number,
  statusText: string,
  payload: unknown,
  extraHeaders: [string, string][] = [],
): SimulatedResult {
  const body = JSON.stringify(payload, null, 2);
  return {
    status,
    statusText,
    headers: [
      ["content-type", "application/json"],
      ["content-length", String(new TextEncoder().encode(body).length)],
      ...extraHeaders,
    ],
    body,
  };
}

function noBody(status: number, statusText: string, extraHeaders: [string, string][] = []): SimulatedResult {
  return { status, statusText, headers: extraHeaders, body: "" };
}

function parseJsonBody(body: string): Record<string, unknown> | null {
  if (!body.trim()) return null;
  try {
    const parsed = JSON.parse(body);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

interface MockUser {
  id: number;
  name: string;
  email: string;
}

const USERS: MockUser[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
  { id: 2, name: "Alan Turing", email: "alan@example.com" },
  { id: 42, name: "Grace Hopper", email: "grace@example.com" },
];

/** Deliberately loose — unlike MockUser, documents in a schemaless store
 *  aren't required to share the same fields. */
const DOCUMENTS: Record<string, unknown>[] = [
  { _id: "656f1a...01", name: "Grace Hopper", tags: ["admiral", "compiler"] },
  { _id: "656f1a...02", name: "Ada Lovelace", notes: "First published algorithm" },
];

interface MockItem {
  id: number;
  name: string;
}

const ITEMS: MockItem[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `Item ${i + 1}`,
}));

/** Falls back to the site's original behavior: echo back whatever was sent,
 *  always `200 OK`. This is what every existing page's hardcoded
 *  `/api/http/echo` (and any other path the router below doesn't recognize)
 *  keeps getting — nothing breaks for content that predates this router. */
function echo({ target, method, headers, body }: HttpAdapterInput): SimulatedResult {
  const safePath = target.startsWith("/") ? target : "/" + target;
  const isBodyless = method === "GET" || method === "HEAD";
  const url = new URL(safePath, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  const echoHeaders: [string, string][] = [
    ...parseHeaders(headers),
    ["host", typeof window !== "undefined" ? window.location.host : "localhost"],
    ["user-agent", typeof navigator !== "undefined" ? navigator.userAgent : "nullbase"],
  ];
  return json(
    200,
    "OK",
    {
      method,
      url: url.toString(),
      path: url.pathname,
      search: url.search,
      headers: Object.fromEntries(echoHeaders),
      body: isBodyless ? undefined : body || undefined,
      receivedAt: new Date().toISOString(),
    },
    [["x-simulated-by", "nullbase in-browser echo"]],
  );
}

/**
 * Routes a simulated HTTP request. Only a handful of paths have real
 * REST-ish behavior (`/api/users`, `/api/users/:id`, `/api/profile`) —
 * everything else, including `/api/http/echo`, falls through to `echo()`.
 */
export function simulateHttp(input: HttpAdapterInput): SimulatedResult {
  const safePath = input.target.startsWith("/") ? input.target : "/" + input.target;
  const url = new URL(safePath, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = input.method;

  if (path === "/api/profile") {
    const hasAuth = parseHeaders(input.headers).some(([k]) => k.toLowerCase() === "authorization");
    if (!hasAuth) {
      return json(401, "Unauthorized", {
        error: "Unauthorized",
        message: "Missing Authorization header.",
      });
    }
    return json(200, "OK", { id: 7, name: "Demo User", email: "demo@nullbase.wiki", plan: "free" });
  }

  const usersMatch = path.match(/^\/api\/users(?:\/([^/]+))?$/);
  if (usersMatch) {
    const idParam = usersMatch[1];

    if (idParam === undefined) {
      if (method === "GET" || method === "HEAD") {
        return json(200, "OK", { data: USERS, count: USERS.length });
      }
      if (method === "POST") {
        const parsed = parseJsonBody(input.body);
        const name = parsed?.name;
        if (typeof name !== "string" || !name.trim()) {
          return json(400, "Bad Request", {
            error: "Bad Request",
            message: 'Expected a JSON body with a "name" field.',
          });
        }
        const created = { id: 100, name, email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com` };
        return json(201, "Created", created, [["location", "/api/users/100"]]);
      }
      if (method === "OPTIONS") {
        return noBody(204, "No Content", [["allow", "GET, POST, OPTIONS"]]);
      }
      return json(405, "Method Not Allowed", { error: "Method Not Allowed" }, [
        ["allow", "GET, POST, OPTIONS"],
      ]);
    }

    const id = Number(idParam);
    const user = Number.isInteger(id) ? USERS.find((u) => u.id === id) : undefined;

    if (method === "DELETE") {
      if (!user) return json(404, "Not Found", { error: "Not Found", message: `No user with id ${idParam}.` });
      return noBody(204, "No Content");
    }
    if (!user) {
      return json(404, "Not Found", { error: "Not Found", message: `No user with id ${idParam}.` });
    }
    if (method === "GET" || method === "HEAD") return json(200, "OK", user);
    if (method === "PUT" || method === "PATCH") {
      const parsed = parseJsonBody(input.body);
      if (method === "PUT" && !parsed) {
        return json(400, "Bad Request", { error: "Bad Request", message: "PUT requires a full JSON body." });
      }
      return json(200, "OK", { ...user, ...parsed });
    }
    return json(405, "Method Not Allowed", { error: "Method Not Allowed" }, [
      ["allow", "GET, PUT, PATCH, DELETE"],
    ]);
  }

  if (path === "/api/v1/users") {
    return json(200, "OK", { data: USERS.map(({ id, name, email }) => ({ id, name, email })) });
  }
  if (path === "/api/v2/users") {
    return json(200, "OK", {
      data: USERS.map(({ id, name, email }) => {
        const [first_name, ...rest] = name.split(" ");
        return { id, first_name, last_name: rest.join(" "), email };
      }),
    });
  }

  if (path === "/api/admin") {
    const role = parseHeaders(input.headers).find(([k]) => k.toLowerCase() === "x-role")?.[1];
    if (role !== "admin") {
      return json(403, "Forbidden", {
        error: "Forbidden",
        message: 'Requires an "X-Role: admin" header.',
      });
    }
    return json(200, "OK", { message: "Welcome, admin." });
  }

  if (path === "/api/items") {
    return paginateItems(url.searchParams);
  }

  if (path === "/api/rate-limited") {
    return rateLimited();
  }

  if (path === "/api/orders" && method === "POST") {
    return createOrder(input);
  }

  if (path === "/api/login" && method === "POST") {
    return json(200, "OK", { message: "Logged in." }, [
      ["set-cookie", "session=abc123; HttpOnly; Secure; SameSite=Lax; Max-Age=3600; Path=/"],
    ]);
  }

  if (path === "/api/form-submit" && method === "POST") {
    return submitForm(input);
  }

  if (path === "/api/documents") {
    if (method === "GET") return json(200, "OK", { data: DOCUMENTS, count: DOCUMENTS.length });
    if (method === "POST") {
      const parsed = parseJsonBody(input.body);
      if (!parsed) return json(400, "Bad Request", { error: "Bad Request", message: "Expected a JSON document body." });
      // Every field the caller sent is stored as-is — no column list to
      // validate against, which is the entire point of the demo: two
      // documents in the same collection don't need matching shapes.
      const created = { _id: `656f1a...${(DOCUMENTS.length + 1).toString().padStart(2, "0")}`, ...parsed };
      return json(201, "Created", created);
    }
    return json(405, "Method Not Allowed", { error: "Method Not Allowed" }, [["allow", "GET, POST"]]);
  }

  return echo(input);
}

/** Parses either `application/x-www-form-urlencoded` (`key=value&key2=...`)
 *  or a JSON body, depending on what was actually typed in — lets one route
 *  demonstrate both content types without the learner needing two pages. */
function submitForm(input: HttpAdapterInput): SimulatedResult {
  const contentType = parseHeaders(input.headers).find(([k]) => k.toLowerCase() === "content-type")?.[1] ?? "";
  const body = input.body.trim();

  if (contentType.includes("json")) {
    const parsed = parseJsonBody(body);
    return json(200, "OK", { received: parsed ?? {}, contentType });
  }

  const fields: Record<string, string> = {};
  for (const pair of body.split("&")) {
    if (!pair) continue;
    const [k, v = ""] = pair.split("=");
    fields[decodeURIComponent(k.replace(/\+/g, " "))] = decodeURIComponent(v.replace(/\+/g, " "));
  }
  return json(200, "OK", { received: fields, contentType: contentType || "application/x-www-form-urlencoded" });
}

const PAGE_LIMIT_DEFAULT = 5;

/** Supports both pagination styles side by side: `?page=&limit=` (offset)
 *  and `?cursor=&limit=` (cursor — the id of the last item already seen). */
function paginateItems(params: URLSearchParams): SimulatedResult {
  const limit = Math.max(1, Math.min(20, Number(params.get("limit")) || PAGE_LIMIT_DEFAULT));

  if (params.has("page")) {
    const page = Math.max(1, Number(params.get("page")) || 1);
    const start = (page - 1) * limit;
    const data = ITEMS.slice(start, start + limit);
    return json(200, "OK", {
      data,
      page,
      limit,
      total: ITEMS.length,
      has_more: start + limit < ITEMS.length,
    });
  }

  const cursor = Number(params.get("cursor")) || 0;
  const startIndex = ITEMS.findIndex((i) => i.id > cursor);
  const slice = startIndex === -1 ? [] : ITEMS.slice(startIndex, startIndex + limit);
  const lastId = slice.at(-1)?.id;
  const hasMore = lastId !== undefined && ITEMS.some((i) => i.id > lastId);
  return json(200, "OK", {
    data: slice,
    next_cursor: hasMore ? lastId : null,
    has_more: hasMore,
  });
}

/**
 * Deliberately stateful, unlike every other route in this file — a real
 * rate limiter has to track calls across requests, so a pure per-call
 * function can't demonstrate one. Module-level state is fine here: this is
 * an in-browser teaching demo, not persisted anywhere, and a page reload
 * naturally resets it.
 */
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 30_000;
let rateLimitCount = 0;
let rateLimitWindowStart = 0;

function rateLimited(): SimulatedResult {
  const now = Date.now();
  if (now - rateLimitWindowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitWindowStart = now;
    rateLimitCount = 0;
  }
  rateLimitCount += 1;
  const resetAt = rateLimitWindowStart + RATE_LIMIT_WINDOW_MS;
  const remaining = Math.max(0, RATE_LIMIT - rateLimitCount);
  const rateHeaders: [string, string][] = [
    ["x-ratelimit-limit", String(RATE_LIMIT)],
    ["x-ratelimit-remaining", String(remaining)],
    ["x-ratelimit-reset", String(Math.ceil(resetAt / 1000))],
  ];

  if (rateLimitCount > RATE_LIMIT) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
    return json(
      429,
      "Too Many Requests",
      { error: "Too Many Requests", message: `Rate limit exceeded. Retry in ${retryAfter}s.` },
      [...rateHeaders, ["retry-after", String(retryAfter)]],
    );
  }
  return json(200, "OK", { message: "Request accepted.", requestsUsed: rateLimitCount }, rateHeaders);
}

/**
 * Deliberately stateful, same reasoning as `rateLimited()` above — caching
 * a response per idempotency key is the entire point of the demo. Module-
 * level `Map`, reset on page reload.
 */
const idempotencyCache = new Map<string, SimulatedResult>();

function createOrder(input: HttpAdapterInput): SimulatedResult {
  const key = parseHeaders(input.headers).find(([k]) => k.toLowerCase() === "idempotency-key")?.[1];

  if (key && idempotencyCache.has(key)) {
    const cached = idempotencyCache.get(key)!;
    return { ...cached, headers: [...cached.headers, ["x-idempotent-replay", "true"]] };
  }

  const parsed = parseJsonBody(input.body);
  const result = json(201, "Created", {
    id: `ord_${Math.random().toString(36).slice(2, 10)}`,
    ...parsed,
    createdAt: new Date().toISOString(),
  });

  if (key) idempotencyCache.set(key, result);
  return result;
}
