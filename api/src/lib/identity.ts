import type { Context } from "hono";
import type { AppEnv, RequestIdentity } from "../types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Extracts the anti-spam identity from a request: the client-generated
 * visitor UUID (validated — invalid values are ignored), plus ip/user-agent.
 * Nothing here is stored raw; services hash it with the server secret.
 */
export function readIdentity(c: Context<AppEnv>): RequestIdentity {
  const rawVisitorId = c.req.header("x-visitor-id");
  return {
    visitorId: rawVisitorId && UUID_RE.test(rawVisitorId) ? rawVisitorId : null,
    ip:
      c.req.header("cf-connecting-ip") ??
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      null,
    userAgent: c.req.header("user-agent") ?? null,
  };
}