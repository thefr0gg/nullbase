/**
 * Single source of truth for individual HTTP status code leaf pages
 * (`content/en/web-fundamentals/http/status-codes/<code>.mdx`). Each entry
 * here becomes one generated .mdx file via `generate-status-codes.ts` — add
 * a new status code by adding an entry, not by hand-writing a new .mdx file.
 *
 * `weight` mirrors the existing frontmatter convention on this content
 * subtree: class hub pages (2xx/3xx/4xx/5xx) use 1-4, leaf pages use a
 * higher number roughly ordered by code so they sort after their hub in any
 * listing that sorts by weight within the same directory.
 */
export type StatusCodeEntry = {
  code: number;
  name: string;
  /** One-sentence definition. Rendered as the page's opening paragraph with
   *  the bolded span pre-marked using `**...**` — keep it a single sentence
   *  answering "what is this status code" directly, for snippet-eligibility. */
  definition: string;
  /** Optional second sentence appended after the definition, unbolded
   *  (e.g. "It is the most common status code on the web."). */
  definitionFollowup?: string;
  /** Frontmatter `description` — a distinct, slightly longer restatement. */
  description: string;
  weight: number;
  klass: "2xx" | "3xx" | "4xx" | "5xx";
  details: string[];
  example: string;
  mistakes: { avoid: string; because: string }[];
  /** Extra markdown injected after "Common Mistakes" and before "See Also" —
   *  for genuine one-offs like the 401 vs 403 comparison table. Omit for the
   *  common case where the template's sections are enough. */
  extra?: string;
  seeAlso: { label: string; href: string; note?: string }[];
};

const classHub: Record<StatusCodeEntry["klass"], { label: string; href: string; note: string }> = {
  "2xx": { label: "2xx Success", href: "/en/web-fundamentals/http/status-codes/2xx", note: "Request succeeded." },
  "3xx": { label: "3xx Redirection", href: "/en/web-fundamentals/http/status-codes/3xx", note: "Further action needed." },
  "4xx": { label: "4xx Client Error", href: "/en/web-fundamentals/http/status-codes/4xx", note: "The client did something wrong." },
  "5xx": { label: "5xx Server Error", href: "/en/web-fundamentals/http/status-codes/5xx", note: "The server failed." },
};

const statusCodesReference = {
  label: "Status Codes Reference",
  href: "/en/web-fundamentals/http/status-codes",
  note: "All codes at a glance.",
};

export const statusCodes: StatusCodeEntry[] = [
  {
    code: 200,
    name: "OK",
    definition: "the request has succeeded",
    definitionFollowup: "It is the most common status code on the web.",
    description: "The server successfully processed the request.",
    weight: 41,
    klass: "2xx",
    details: [
      "**Class:** 2xx (Success)",
      "**Typical with:** `GET`, `PUT`, `PATCH`, `DELETE`, `POST`",
      "**Caching:** a `200` response is cacheable by default.",
    ],
    example: `HTTP/1.1 200 OK
Content-Type: application/json

{ "status": 200, "message": "OK" }`,
    mistakes: [],
    seeAlso: [statusCodesReference, classHub["2xx"]],
  },
  {
    code: 201,
    name: "Created",
    definition: "the request succeeded and a new resource was created",
    description: "The request succeeded and a new resource was created as a result.",
    weight: 42,
    klass: "2xx",
    details: [
      "**Class:** 2xx (Success)",
      "**Typical with:** `POST`, sometimes `PUT`",
      "**Should include:** a `Location` header pointing to the newly created resource, and usually the resource itself in the body.",
    ],
    example: `POST /api/users HTTP/1.1
Content-Type: application/json

{ "name": "Alice" }

HTTP/1.1 201 Created
Location: /api/users/42
Content-Type: application/json

{ "id": 42, "name": "Alice" }`,
    mistakes: [
      {
        avoid: "Returning `200` instead of `201` for creation",
        because: "clients (and monitoring) rely on `201` to know a new resource now exists.",
      },
      {
        avoid: "Omitting the `Location` header",
        because: "it tells the client exactly where to find what it just created.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["2xx"],
      { label: "POST", href: "/en/web-fundamentals/http/methods/post", note: "The method most often paired with 201." },
    ],
  },
  {
    code: 204,
    name: "No Content",
    definition: "the server successfully processed the request, but there is no content to send in response",
    description: "The server successfully processed the request and there is no content to send back.",
    weight: 43,
    klass: "2xx",
    details: [
      "**Class:** 2xx (Success)",
      "**Typical with:** `DELETE`, `PUT`, `PATCH`",
      "**Body:** must be empty — a `204` response must not include a message body.",
    ],
    example: `DELETE /api/users/42 HTTP/1.1

HTTP/1.1 204 No Content`,
    mistakes: [
      {
        avoid: "Sending a response body with `204`",
        because: "clients and proxies expect none, and some will error on one.",
      },
      {
        avoid: "Using `200` with an empty body instead",
        because: '`204` explicitly signals "nothing more to say," which is more precise than a `200` with no content.',
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["2xx"],
      { label: "DELETE", href: "/en/web-fundamentals/http/methods/delete", note: "The method most often paired with 204." },
    ],
  },
  {
    code: 301,
    name: "Moved Permanently",
    definition: "the target resource has been permanently moved to a new URL",
    description: "The target resource has been permanently moved to a new URL.",
    weight: 44,
    klass: "3xx",
    details: [
      "**Class:** 3xx (Redirection)",
      "**Caching:** cacheable by default — browsers and CDNs may remember the redirect.",
      "**SEO:** a `301` passes most link equity to the new URL, which is why it's the standard choice for permanent domain or path changes.",
      "**Method:** historically, clients may switch a `POST` to a `GET` when following a `301` — use `308` if the method must be preserved.",
    ],
    example: `GET /old-page HTTP/1.1

HTTP/1.1 301 Moved Permanently
Location: /new-page`,
    mistakes: [
      {
        avoid: "Using `301` for a temporary move",
        because: "use `302` or `307` instead, since `301` gets cached aggressively by browsers and search engines.",
      },
      {
        avoid: "Chaining multiple redirects",
        because: "each hop adds latency; point directly at the final URL.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["3xx"],
      { label: "308 Permanent Redirect", href: "/en/web-fundamentals/http/status-codes/308", note: "Like 301, but preserves the method." },
    ],
  },
  {
    code: 302,
    name: "Found",
    definition: "the target resource temporarily resides under a different URL",
    description: "The target resource temporarily resides under a different URL.",
    weight: 45,
    klass: "3xx",
    details: [
      "**Class:** 3xx (Redirection)",
      "**Typical use:** post-login redirects, temporary maintenance pages, A/B routing.",
      "**Method:** historically, clients may switch a `POST` to a `GET` when following a `302` — use `307` if the method must be preserved.",
    ],
    example: `GET /dashboard HTTP/1.1

HTTP/1.1 302 Found
Location: /login`,
    mistakes: [
      {
        avoid: "Using `302` when the move is actually permanent",
        because: "search engines won't transfer ranking signals the way they do with `301`.",
      },
      {
        avoid: "Relying on the method being preserved",
        because: "some clients rewrite `POST` to `GET` on a `302`; use `307` if that matters.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["3xx"],
      { label: "307 Temporary Redirect", href: "/en/web-fundamentals/http/status-codes/307", note: "Like 302, but preserves the method." },
    ],
  },
  {
    code: 304,
    name: "Not Modified",
    definition: "the resource has not changed since the version the client already has cached",
    description: "The resource has not changed since the client's cached version — reuse it.",
    weight: 46,
    klass: "3xx",
    details: [
      "**Class:** 3xx (Redirection)",
      "**Triggered by:** conditional requests using `If-None-Match` (with `ETag`) or `If-Modified-Since` (with `Last-Modified`).",
      "**Body:** must be empty — a `304` never carries a message body.",
    ],
    example: `GET /style.css HTTP/1.1
If-None-Match: "abc123"

HTTP/1.1 304 Not Modified
ETag: "abc123"`,
    mistakes: [
      {
        avoid: "Sending a body with `304`",
        because: "it defeats the purpose of the response and violates the spec.",
      },
      {
        avoid: "Not setting `ETag`/`Last-Modified` on the original response",
        because: "without them, the client has nothing to send back for `304` to ever trigger.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["3xx"],
      { label: "Cache-Control", href: "/en/web-fundamentals/http/headers/cache-control", note: "Caching directives that work alongside 304." },
    ],
  },
  {
    code: 307,
    name: "Temporary Redirect",
    definition: "the target resource temporarily resides under a different URL, and the client must repeat the request with the same method",
    description: "The target resource temporarily resides under a different URL, and the request method must not change.",
    weight: 47,
    klass: "3xx",
    details: [
      "**Class:** 3xx (Redirection)",
      "**Difference from 302:** `307` guarantees the method (and body, for `POST`/`PUT`) is preserved; `302` does not.",
      "**Typical use:** redirecting API clients where the original method must be retried exactly.",
    ],
    example: `POST /submit HTTP/1.1
Content-Type: application/json

{ "vote": "yes" }

HTTP/1.1 307 Temporary Redirect
Location: /submit-v2`,
    mistakes: [
      {
        avoid: "Using `302` when the method must be preserved",
        because: "many clients silently downgrade `POST` to `GET` on `302`, which `307` prevents.",
      },
      {
        avoid: "Using `307` for a permanent move",
        because: "use `308` instead so caches and search engines treat it as permanent.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["3xx"],
      { label: "302 Found", href: "/en/web-fundamentals/http/status-codes/302", note: "Temporary redirect that may change the method." },
    ],
  },
  {
    code: 308,
    name: "Permanent Redirect",
    definition: "the target resource has permanently moved to a new URL, and the client must repeat the request with the same method",
    description: "The target resource has been permanently moved, and the request method must not change.",
    weight: 48,
    klass: "3xx",
    details: [
      "**Class:** 3xx (Redirection)",
      "**Difference from 301:** `308` guarantees the method (and body, for `POST`/`PUT`) is preserved; `301` does not.",
      "**SEO:** passes link equity like `301` does, while keeping the original method intact.",
    ],
    example: `PUT /api/v1/resource HTTP/1.1
Content-Type: application/json

{ "value": 1 }

HTTP/1.1 308 Permanent Redirect
Location: /api/v2/resource`,
    mistakes: [
      {
        avoid: "Using `301` when the method must be preserved",
        because: "some clients rewrite `POST`/`PUT` to `GET` on a `301`, which `308` prevents.",
      },
      {
        avoid: "Using `308` for a temporary move",
        because: "use `307` instead so caches don't treat it as permanent.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["3xx"],
      { label: "301 Moved Permanently", href: "/en/web-fundamentals/http/status-codes/301", note: "Permanent redirect that may change the method." },
    ],
  },
  {
    code: 400,
    name: "Bad Request",
    definition: "the server cannot or will not process the request due to something the client did wrong",
    description: "The server cannot process the request due to malformed syntax or invalid data.",
    weight: 44,
    klass: "4xx",
    details: [
      "**Class:** 4xx (Client error)",
      "**When to use:** invalid JSON, missing required fields, malformed query parameters, or a request the server can't parse at all.",
      "**Not for:** authentication (`401`) or permission (`403`) problems — reserve `400` for structurally or semantically invalid requests.",
    ],
    example: `POST /api/users HTTP/1.1
Content-Type: application/json

{ invalid json }

HTTP/1.1 400 Bad Request
{
  "error": "Invalid JSON syntax"
}`,
    mistakes: [
      {
        avoid: "Using `400` as a catch-all for every client error",
        because: "`401`, `403`, `404`, `409`, and `422` are all more specific and more useful to the caller.",
      },
      {
        avoid: "Returning `400` with no explanation",
        because: "include what was wrong and, ideally, which field.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["4xx"],
      { label: "422 Unprocessable Entity", href: "/en/web-fundamentals/http/status-codes/422", note: "Valid syntax, rejected data." },
    ],
  },
  {
    code: 401,
    name: "Unauthorized",
    definition: "the request lacks valid authentication credentials for the target resource",
    description: "The request lacks valid authentication credentials for the target resource.",
    weight: 45,
    klass: "4xx",
    details: [
      "**Class:** 4xx (Client error)",
      "**When to use:** no credentials were sent, or the credentials sent are invalid or expired.",
      "**Should include:** a `WWW-Authenticate` header describing how to authenticate.",
    ],
    example: `GET /api/admin HTTP/1.1

HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="api"
{
  "error": "No authentication provided"
}`,
    mistakes: [
      {
        avoid: "Returning `401` when the user is authenticated but lacks permission",
        because: "that's `403`.",
      },
      {
        avoid: "Omitting `WWW-Authenticate`",
        because: "clients need it to know which auth scheme to use.",
      },
    ],
    extra: `Despite the name, \`401\` means "you're not logged in," not "you don't have permission" — that's \`403\`.

## 401 vs 403

| 401 Unauthorized | 403 Forbidden |
|-----------------|---------------|
| You need to log in | You're logged in, but no permission |
| No credentials, or invalid/expired credentials | Valid credentials, but insufficient role/permission |
| Include \`WWW-Authenticate\` | Don't include \`WWW-Authenticate\` |`,
    seeAlso: [
      statusCodesReference,
      classHub["4xx"],
      { label: "403 Forbidden", href: "/en/web-fundamentals/http/status-codes/403", note: "Authenticated, but not permitted." },
      { label: "Authorization", href: "/en/web-fundamentals/http/headers/authorization", note: "The header that prevents most 401s." },
    ],
  },
  {
    code: 403,
    name: "Forbidden",
    definition: "the server understood the request but refuses to authorize it",
    description: "The server understood the request but refuses to authorize it.",
    weight: 46,
    klass: "4xx",
    details: [
      "**Class:** 4xx (Client error)",
      "**When to use:** the client is authenticated but doesn't have permission for this specific resource or action.",
      "**Do not include:** a `WWW-Authenticate` header — the problem isn't a missing credential.",
    ],
    example: `GET /api/admin HTTP/1.1
Authorization: Bearer valid-token

HTTP/1.1 403 Forbidden
{
  "error": "Insufficient permissions"
}`,
    mistakes: [
      {
        avoid: "Returning `404` instead of `403` to hide that a resource exists",
        because: "this is sometimes intentional for security, but document the tradeoff; usually `403` is more honest and more useful to legitimate clients.",
      },
      {
        avoid: "Returning `403` when the real problem is missing authentication",
        because: "that's `401`.",
      },
    ],
    extra: `The client is typically authenticated but lacks the role or permission needed — unlike \`401\`, logging in again won't help.

## 401 vs 403

| 401 Unauthorized | 403 Forbidden |
|-----------------|---------------|
| You need to log in | You're logged in, but no permission |
| No credentials, or invalid/expired credentials | Valid credentials, but insufficient role/permission |
| Include \`WWW-Authenticate\` | Don't include \`WWW-Authenticate\` |`,
    seeAlso: [
      statusCodesReference,
      classHub["4xx"],
      { label: "401 Unauthorized", href: "/en/web-fundamentals/http/status-codes/401", note: "Not authenticated at all." },
    ],
  },
  {
    code: 404,
    name: "Not Found",
    definition: "the server did not find a current representation for the target resource",
    description: "The server did not find a current representation for the target resource.",
    weight: 45,
    klass: "4xx",
    details: [
      "**Class:** 4xx (Client error)",
      "**When to use:** the URL is not known to the server, or the resource has been intentionally removed.",
      "**SEO note:** a soft `404` (returning `200` with \"not found\" content) harms search indexing — always return the real `404`.",
    ],
    example: `HTTP/1.1 404 Not Found
Content-Type: text/html

<h1>404 Not Found</h1>
<p>The requested resource does not exist.</p>`,
    mistakes: [],
    seeAlso: [statusCodesReference, classHub["4xx"]],
  },
  {
    code: 409,
    name: "Conflict",
    definition: "the request conflicts with the current state of the target resource",
    description: "The request conflicts with the current state of the target resource.",
    weight: 47,
    klass: "4xx",
    details: [
      "**Class:** 4xx (Client error)",
      "**When to use:** optimistic-concurrency mismatches (stale `If-Match`), duplicate unique fields (e.g. an email that already exists), or two operations racing on the same resource.",
      "**Response should explain:** what conflicted, so the client can decide how to resolve it (retry, merge, or abort).",
    ],
    example: `PUT /api/documents/42 HTTP/1.1
If-Match: "old-version"

HTTP/1.1 409 Conflict
{
  "error": "The document was modified by someone else"
}`,
    mistakes: [
      {
        avoid: "Using `400` for conflicts",
        because: "`409` is more specific and tells the client the request itself was valid, just untimely.",
      },
      {
        avoid: "Not explaining the conflict",
        because: "a bare `409` with no detail leaves the client guessing whether to retry or give up.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["4xx"],
      { label: "422 Unprocessable Entity", href: "/en/web-fundamentals/http/status-codes/422", note: "Valid syntax, rejected data." },
    ],
  },
  {
    code: 422,
    name: "Unprocessable Entity",
    definition: "the request is syntactically valid but the server can't process the contained instructions because the data itself is invalid",
    description: "The request is well-formed but contains semantically invalid data.",
    weight: 48,
    klass: "4xx",
    details: [
      "**Class:** 4xx (Client error)",
      "**Difference from 400:** `400` means the request itself is malformed; `422` means the request is well-formed but the data fails validation (bad email format, out-of-range value, business-rule violation).",
      "**Response should include:** which field(s) failed and why, so the client can correct them.",
    ],
    example: `POST /api/users HTTP/1.1
Content-Type: application/json

{
  "name": "Alice",
  "email": "invalid-email"
}

HTTP/1.1 422 Unprocessable Entity
{
  "error": "Invalid email format"
}`,
    mistakes: [
      {
        avoid: "Using `400` for validation failures",
        because: "reserve `400` for genuinely malformed requests and use `422` for semantically invalid data.",
      },
      {
        avoid: "Returning a single generic error message when multiple fields failed validation",
        because: "list them all so the client doesn't have to resubmit repeatedly.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["4xx"],
      { label: "400 Bad Request", href: "/en/web-fundamentals/http/status-codes/400", note: "Malformed syntax, not just bad data." },
    ],
  },
  {
    code: 429,
    name: "Too Many Requests",
    definition: "the client has sent too many requests in a given amount of time and is being rate limited",
    description: "The client has sent too many requests in a given amount of time (rate limiting).",
    weight: 49,
    klass: "4xx",
    details: [
      "**Class:** 4xx (Client error)",
      "**When to use:** per-client, per-IP, or per-API-key request quotas have been exceeded.",
      "**Should include:** a `Retry-After` header telling the client how long to wait before trying again.",
    ],
    example: `POST /api/login HTTP/1.1

HTTP/1.1 429 Too Many Requests
Retry-After: 60
{
  "error": "Rate limit exceeded. Try again in 60 seconds."
}`,
    mistakes: [
      {
        avoid: "Omitting `Retry-After`",
        because: "without it, clients have to guess when to retry, which often makes rate limiting worse, not better.",
      },
      {
        avoid: "Returning `503` for rate limiting",
        because: "`503` implies the server itself is overloaded; `429` correctly signals it's this specific client that must slow down.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["4xx"],
      { label: "503 Service Unavailable", href: "/en/web-fundamentals/http/status-codes/503", note: "The server, not the client, is the bottleneck." },
    ],
  },
  {
    code: 500,
    name: "Internal Server Error",
    definition: "the server has encountered a situation it does not know how to handle",
    description: "The server has encountered a situation it does not know how to handle.",
    weight: 49,
    klass: "5xx",
    details: [
      "**Class:** 5xx (Server error)",
      "**When to use:** an unexpected condition was encountered and no more specific message is appropriate.",
      "**Do not retry** blindly — `500` is not idempotent by guarantee, but the request may have partially succeeded on the server.",
    ],
    example: `HTTP/1.1 500 Internal Server Error
Content-Type: text/html

<h1>500 Internal Server Error</h1>
<p>Something went wrong on our end.</p>`,
    mistakes: [],
    seeAlso: [statusCodesReference, classHub["5xx"]],
  },
  {
    code: 502,
    name: "Bad Gateway",
    definition: "a server acting as a gateway or proxy received an invalid or malformed response from the upstream server it was trying to reach",
    description: "A server acting as a gateway or proxy received an invalid response from the upstream server.",
    weight: 50,
    klass: "5xx",
    details: [
      "**Class:** 5xx (Server error)",
      "**Typical cause:** the upstream application server crashed, restarted, or returned garbage while the proxy (nginx, a load balancer, a CDN) was waiting for a response.",
      "**Who fixes it:** the origin/backend, not the client — retrying the exact same request rarely helps until the upstream recovers.",
    ],
    example: `GET /api/data HTTP/1.1

HTTP/1.1 502 Bad Gateway
Content-Type: text/html

<h1>502 Bad Gateway</h1>
<p>The upstream server returned an invalid response.</p>`,
    mistakes: [
      {
        avoid: "Confusing `502` with `503`",
        because: "`502` means the upstream sent back something invalid; `503` means the server (or upstream) is deliberately unavailable, e.g. overloaded or in maintenance.",
      },
      {
        avoid: "Retrying aggressively without backoff",
        because: "a struggling upstream service gets worse under a retry storm.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["5xx"],
      { label: "503 Service Unavailable", href: "/en/web-fundamentals/http/status-codes/503", note: "Server temporarily can't handle requests." },
      { label: "Proxies & Gateways", href: "/en/web-fundamentals/http/proxies", note: "Where 502s come from." },
    ],
  },
  {
    code: 503,
    name: "Service Unavailable",
    definition: "the server is currently unable to handle the request, typically because it's overloaded or down for maintenance",
    description: "The server is currently unable to handle the request, usually due to overload or maintenance.",
    weight: 51,
    klass: "5xx",
    details: [
      "**Class:** 5xx (Server error)",
      "**Typical cause:** the server is intentionally refusing traffic (deploy in progress, maintenance window) or is overwhelmed by load.",
      "**Should include:** a `Retry-After` header telling the client when to try again.",
    ],
    example: `GET /api/data HTTP/1.1

HTTP/1.1 503 Service Unavailable
Retry-After: 120
Content-Type: text/html

<h1>503 Service Unavailable</h1>
<p>We're undergoing maintenance. Please try again shortly.</p>`,
    mistakes: [
      {
        avoid: "Omitting `Retry-After`",
        because: "without it, clients (and search engine crawlers) can't tell whether this is a five-second blip or a permanent outage.",
      },
      {
        avoid: "Using `500` for planned maintenance",
        because: "`503` more precisely tells clients (and monitoring) the outage is expected and temporary.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["5xx"],
      { label: "502 Bad Gateway", href: "/en/web-fundamentals/http/status-codes/502", note: "Upstream sent an invalid response." },
      { label: "504 Gateway Timeout", href: "/en/web-fundamentals/http/status-codes/504", note: "Upstream took too long." },
    ],
  },
  {
    code: 504,
    name: "Gateway Timeout",
    definition: "a server acting as a gateway or proxy did not receive a response from the upstream server in time",
    description: "A server acting as a gateway or proxy did not receive a timely response from the upstream server.",
    weight: 52,
    klass: "5xx",
    details: [
      "**Class:** 5xx (Server error)",
      "**Typical cause:** a slow database query, an overloaded backend, or a network issue between the proxy and the origin server.",
      "**Difference from 502:** `502` means the upstream responded with something invalid; `504` means it didn't respond in time at all.",
    ],
    example: `GET /api/report HTTP/1.1

HTTP/1.1 504 Gateway Timeout
Content-Type: text/html

<h1>504 Gateway Timeout</h1>
<p>The upstream server took too long to respond.</p>`,
    mistakes: [
      {
        avoid: "Setting proxy timeouts shorter than the operation genuinely needs",
        because: "a long-running but healthy request shouldn't be cut off and reported as a failure.",
      },
      {
        avoid: "Confusing `504` with `408 Request Timeout`",
        because: "`408` is about the client being too slow to send the request; `504` is about the upstream being too slow to respond.",
      },
    ],
    seeAlso: [
      statusCodesReference,
      classHub["5xx"],
      { label: "502 Bad Gateway", href: "/en/web-fundamentals/http/status-codes/502", note: "Upstream sent an invalid response." },
      { label: "Proxies & Gateways", href: "/en/web-fundamentals/http/proxies", note: "Where 504s come from." },
    ],
  },
];
