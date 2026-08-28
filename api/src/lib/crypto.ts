/**
 * Runtime-agnostic crypto helpers built on Web Crypto (crypto.subtle),
 * which behaves identically in Node 18+ and Cloudflare workerd — this is
 * what keeps password hashing and token signing portable between the
 * better-sqlite3 dev server and the D1 production worker.
 */

const PBKDF2_ITERATIONS = 100_000;
const encoder = new TextEncoder();

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  return fromBase64(value.replace(/-/g, "+").replace(/_/g, "/"));
}

// ---------------------------------------------------------------------------
// Passwords (PBKDF2-SHA256, salted — no plaintext, no native deps)
// ---------------------------------------------------------------------------

export async function hashPassword(
  password: string,
  existingSalt?: string,
): Promise<{ hash: string; salt: string }> {
  const saltBytes = existingSalt
    ? fromBase64(existingSalt)
    : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return { hash: toBase64(bits), salt: toBase64(saltBytes) };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  const candidate = await hashPassword(password, salt);
  return timingSafeEqual(candidate.hash, hash);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Session tokens (stateless HMAC-SHA256: base64url(payload).base64url(sig))
// ---------------------------------------------------------------------------

export interface TokenPayload {
  sub: number; // admin user id
  exp: number; // unix seconds
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signToken(
  payload: TokenPayload,
  secret: string,
  ttlSeconds: number,
): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify({ ...payload, exp: payload.exp || Math.floor(Date.now() / 1000) + ttlSeconds })));
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(body));
  return `${body}.${toBase64Url(signature)}`;
}

export async function verifyToken(
  token: string,
  secret: string,
): Promise<TokenPayload | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64Url(sig) as unknown as ArrayBuffer,
    encoder.encode(body),
  );
  if (!valid) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as TokenPayload;
    if (!Number.isInteger(payload.sub) || typeof payload.exp !== "number") return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// One-way identity hashing (likes/feedback anti-spam — no raw data stored)
// ---------------------------------------------------------------------------

/**
 * Salted SHA-256 over the given request attributes + the server secret.
 * Used for both the visitor identity (visitorId | ip | ua) and the network
 * identity (ip). Clients cannot precompute these without the secret.
 */
export async function hashWithSecret(
  parts: (string | null | undefined)[],
  secret: string,
): Promise<string> {
  const joined = parts.map((p) => p ?? "").join("|");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`${joined}|${secret}`),
  );
  return toBase64Url(digest);
}