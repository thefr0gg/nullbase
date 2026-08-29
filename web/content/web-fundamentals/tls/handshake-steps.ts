import type { StepFlowStep } from "@/components/interactive/StepFlow";

/**
 * A simplified TLS 1.3 handshake (1-RTT) — colocated next to index.mdx per
 * the interactive system's authoring convention for nested step data.
 */
export const handshakeSteps: StepFlowStep[] = [
  {
    actor: "Client",
    title: "Client Hello",
    description:
      "The browser opens a TCP connection, then immediately sends a ClientHello: which TLS versions and cipher suites it supports, a random number, and a key share for key exchange.",
    detail: "ClientHello\n  supported_versions: TLS 1.3\n  cipher_suites: [...]\n  key_share: <client public key>",
  },
  {
    actor: "Server",
    title: "Server Hello + certificate",
    description:
      "The server picks a cipher suite both sides support, sends back its own key share, and presents its certificate — proof (signed by a trusted Certificate Authority) that it really is who it claims to be.",
    detail: "ServerHello\n  cipher_suite: TLS_AES_128_GCM_SHA256\n  key_share: <server public key>\nCertificate: example.com (issued by Let's Encrypt)",
  },
  {
    actor: "Client",
    title: "Verify the certificate",
    description:
      "The client checks the certificate chain up to a root CA it already trusts, confirms the hostname matches, and checks it hasn't expired or been revoked. If any of that fails, the connection is aborted — this is the check a browser's padlock icon represents.",
  },
  {
    actor: "Client & server",
    title: "Derive the session key",
    description:
      "Using (Elliptic-curve) Diffie-Hellman key exchange, both sides independently compute the same symmetric session key from the key shares exchanged earlier — the key itself is never transmitted, only the public material needed to derive it.",
  },
  {
    actor: "Client & server",
    title: "Finished",
    description:
      "Both sides send a \"Finished\" message, encrypted with the new session key, that hashes everything exchanged so far. If either side can decrypt and verify the other's Finished message, both now know the handshake succeeded and nothing was tampered with in transit.",
  },
  {
    actor: "Both",
    title: "Encrypted application data",
    description:
      "The handshake is done. From here, every byte — the HTTP request, headers, response body — travels encrypted under the session key. This is the point HTTP effectively becomes HTTPS.",
  },
];
