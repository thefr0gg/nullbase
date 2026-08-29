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
    <div className="my-8 overflow-hidden rounded-3xl border border-border bg-surface shadow-card hover:translate-y-0 hover:shadow-card">
      <div className="border-b border-border bg-background/60 p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Request line
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {METHODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors duration-150 hover:translate-y-0 hover:shadow-none",
                    method === m
                      ? "border-border bg-background text-text-primary"
                      : "border-border bg-surface text-text-primary hover:border-border hover:bg-background/80",
                  ].join(" ")}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                Target
              </label>
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full min-w-0 rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-text-primary outline-none transition focus:border-electric-blue focus:ring-3 focus:ring-electric-blue/15"
              />
            </div>
            <Button
              onClick={send}
              disabled={loading}
              variant="primary"
              className="h-[52px] w-full min-w-0 rounded-xl px-4 text-sm sm:w-auto sm:min-w-[120px]"
            >
              {loading ? "Sending…" : "Send request"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        <div className="space-y-2">
          <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Headers
          </label>
          <textarea
            value={headersText}
            onChange={(e) => setHeadersText(e.target.value)}
            placeholder="Headers — one per line as `Name: value`"
            className="h-32 max-h-80 w-full max-w-full rounded-2xl border border-border bg-background p-3 font-mono text-xs text-text-primary outline-none transition focus:border-electric-blue focus:ring-3 focus:ring-electric-blue/15 resize-y"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Body
          </label>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Request body"
            className="h-32 max-h-80 w-full max-w-full rounded-2xl border border-border bg-background p-3 font-mono text-xs text-text-primary outline-none transition focus:border-electric-blue focus:ring-3 focus:ring-electric-blue/15 resize-y disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBodyless}
          />
        </div>
      </div>

      {error && (
        <div className="px-4 pb-4 sm:px-5">
          <code className="block rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </code>
        </div>
      )}

      {result && <ResponsePanel result={result} />}
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
    <div className="border-t border-border bg-background/60 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
          Response
        </p>
        <Badge color={level} className="rounded-full px-2.5 py-1">
          {result.status} {result.statusText}
        </Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <pre className="overflow-auto rounded-2xl border border-border bg-surface p-3 font-mono text-[11px] leading-6 text-text-primary">
          {result.body}
        </pre>
        <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
          {result.headers.map(([k, v]) => (
            <li
              key={k}
              className="flex items-start justify-between gap-2 border-b border-border px-3 py-2 last:border-b-0"
            >
              <span className="font-mono text-[11px] text-text-secondary">{k}</span>
              <span className="break-all text-right font-mono text-[11px] text-text-primary">
                {v}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
