"use client";

import { useState } from "react";
import { Badge, Button } from "@/app/_components/ui";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
type Method = (typeof METHODS)[number];

/**
 * Live HTTP request playground. The "server" is simulated entirely in the
 * browser: the request the learner composes is echoed back as a JSON
 * response, so the demo works on a fully static deployment with no backend
 * and no external dependency.
 */
export default function HttpRequest({
  defaultMethod = "GET",
  defaultPath = "/api/http/echo",
  defaultHeaders = "Accept: application/json\nContent-Type: application/json\nX-Demo: nullbase",
  defaultBody = JSON.stringify({ hello: "world" }, null, 2),
}: {
  defaultMethod?: Method;
  defaultPath?: string;
  defaultHeaders?: string;
  defaultBody?: string;
}) {
  const [method, setMethod] = useState<Method>(defaultMethod);
  const [path, setPath] = useState(defaultPath);
  const [headersText, setHeadersText] = useState(defaultHeaders);
  const [bodyText, setBodyText] = useState(defaultBody);
  const [result, setResult] = useState<RequestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function parseHeaders(text: string): [string, string][] {
    const out: [string, string][] = [];
    for (const line of text.split("\n")) {
      const [k, ...rest] = line.trim().split(":");
      if (!k) continue;
      const v = rest.join(":").trim();
      if (k.trim() && v) out.push([k.trim(), v]);
    }
    return out;
  }

  async function send() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const safePath = path.startsWith("/") ? path : "/" + path;
      const headers = parseHeaders(headersText);
      const isBodyless = method === "GET" || method === "HEAD";
      // Brief pause so the pending state mirrors a real request round trip.
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Resolve the request line exactly like a server would see it.
      const url = new URL(safePath, window.location.origin);
      const echoHeaders: [string, string][] = [
        ...headers,
        ["host", window.location.host],
        ["user-agent", navigator.userAgent],
        ["accept-language", navigator.language || "*"],
      ];
      const payload = {
        method,
        url: url.toString(),
        path: url.pathname,
        search: url.search,
        headers: Object.fromEntries(echoHeaders),
        body: isBodyless ? undefined : bodyText || undefined,
        receivedAt: new Date().toISOString(),
      };

      // A static site has no server, so any path is "echoed" with a 200 —
      // this is a browser simulation, not a real network round trip.
      setResult({
        status: 200,
        statusText: "OK",
        headers: [
          ["content-type", "application/json"],
          ["x-simulated-by", "nullbase in-browser echo"],
        ],
        body: JSON.stringify(payload, null, 2),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const isBodyless = method === "GET" || method === "HEAD";

  return (
    <div className="my-6 grid gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-text-secondary">Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <label className="text-xs text-text-secondary">Path</label>
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="w-52 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-electric-blue"
        />
        <Button onClick={send} disabled={loading} variant="primary">
          {loading ? "Sending…" : "Send"}
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <textarea
          value={headersText}
          onChange={(e) => setHeadersText(e.target.value)}
          placeholder="Headers — one per line as `Name: value`"
          className="h-28 w-full rounded-xl border border-border bg-surface p-3 font-mono text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue"
        />
        <textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Request body"
          className="h-28 w-full rounded-xl border border-border bg-surface p-3 font-mono text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-electric-blue"
          disabled={isBodyless}
        />
      </div>

      {error && (
        <code className="block rounded-md bg-danger/10 p-2 text-sm text-danger">
          {error}
        </code>
      )}

      {result && (
        <ResponsePanel result={result} />
      )}
    </div>
  );
}

interface RequestResult {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: string;
}

function ResponsePanel({ result }: { result: RequestResult }) {
  const level: "green" | "red" | "blue" =
    result.status >= 200 && result.status < 300
      ? "green"
      : result.status >= 400
        ? "red"
        : "blue";
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[0_12px_24px_-8px_rgba(59,130,246,0.12)]">
      <Badge color={level}>
        {result.status} {result.statusText}
      </Badge>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <pre className="overflow-auto rounded-xl bg-background p-3 text-xs">
          {result.body}
        </pre>
        <ul className="space-y-1">
          {result.headers.map(([k, v]) => (
            <li key={k} className="font-mono text-xs">
              <span className="text-text-secondary">{k}:</span>{" "}
              <span className="text-text-primary">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
