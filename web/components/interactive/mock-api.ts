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

  return echo(input);
}
