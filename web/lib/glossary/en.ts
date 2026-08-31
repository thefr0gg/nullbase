import type { GlossaryMap } from "./types";

/**
 * Centralized, cross-cutting term definitions for `<GlossaryTerm>` — unlike
 * step/exercise data, these aren't scoped to one page: TCP is referenced
 * from dozens of unrelated articles, so it's defined once here rather than
 * duplicated per colocated content file. English-only for now, matching
 * this site's existing practice of shipping new content in English first
 * and translating it in a later pass (see `web/content/en/databases`,
 * `web-apis`, etc., none of which are translated yet either).
 */
export const en: GlossaryMap = {
  tcp: {
    term: "TCP",
    definition: "Transmission Control Protocol — a connection-oriented transport protocol with guaranteed, ordered delivery.",
    href: "/en/networking/tcp",
  },
  udp: {
    term: "UDP",
    definition: "User Datagram Protocol — a connectionless transport protocol with no delivery or ordering guarantees, trading reliability for speed.",
    href: "/en/networking/udp",
  },
  dns: {
    term: "DNS",
    definition: "Domain Name System — translates human-readable domain names into the IP addresses computers actually route to.",
    href: "/en/web-fundamentals/dns",
  },
  tls: {
    term: "TLS",
    definition: "Transport Layer Security — encrypts a connection and verifies the server's identity via a certificate.",
    href: "/en/web-fundamentals/tls",
  },
  http: {
    term: "HTTP",
    definition: "Hypertext Transfer Protocol — the request/response protocol browsers and APIs use to communicate.",
    href: "/en/web-fundamentals/http",
  },
  jwt: {
    term: "JWT",
    definition: "JSON Web Token — a signed, self-contained token carrying identity and claims without a server-side session lookup.",
    href: "/en/security/jwt",
  },
  oauth: {
    term: "OAuth 2.0",
    definition: "A protocol for granting one service limited, revocable access to a user's data on another service, without sharing a password.",
    href: "/en/security/oauth-2-0",
  },
  sql: {
    term: "SQL",
    definition: "Structured Query Language — the declarative language nearly every relational database uses to query and modify data.",
    href: "/en/databases/sql",
  },
  cors: {
    term: "CORS",
    definition: "Cross-Origin Resource Sharing — the browser-enforced mechanism that lets a server opt in to letting another origin read its responses.",
    href: "/en/security/cors",
  },
  api: {
    term: "API",
    definition: "Application Programming Interface — a defined way for one piece of software to request functionality or data from another.",
  },
};
