"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import clsx from "clsx";
import { Badge, Button } from "@/app/_components/ui";
import { useInteractiveDict } from "@/lib/i18n/step-flow-context";
import { format } from "@/lib/i18n/format";
import { DetailPanel, EyebrowLabel, JsonBlock, PlaygroundSection, PlaygroundShell, SimulatedTag } from "./_shared";
import {
  DEFAULT_HTTP_EXAMPLES,
  HTTP_METHODS,
  parseHeaders,
  simulateHttp,
  type ExamplePath,
  type HttpMethod,
  type SimulatedResult,
} from "./mock-api";

export type { HttpMethod } from "./mock-api";

/**
 * Generalizes the site's original `HttpRequest` playground to any
 * request/response- or message-exchange-shaped interaction via a `protocol`
 * prop. Every protocol is simulated entirely client-side (no network calls,
 * no backend) — the "response" is deterministic string templating over
 * whatever the learner typed in, exactly like the original HTTP-only
 * component this replaces.
 */

export type Protocol = "http" | "graphql" | "websocket" | "webhook";

export interface SimulatedMessage {
  direction: "sent" | "received";
  body: string;
  delayMs?: number;
}

export interface RequestPlaygroundProps {
  protocol?: Protocol;
  title?: string;
  defaultTarget?: string;
  defaultMethod?: HttpMethod; // http only
  defaultHeaders?: string; // http/webhook — "Name: value" lines
  defaultBody?: string; // http body / graphql query text / webhook payload
  defaultVariables?: string; // graphql only — JSON text
  simulatedMessages?: SimulatedMessage[]; // websocket only
  /** Clickable "try this" chips under the target field. Defaults to
   *  `DEFAULT_HTTP_EXAMPLES` for protocol="http"; empty for everything else. */
  examplePaths?: ExamplePath[];
}

function buildCurl({
  method,
  target,
  headers,
  body,
  isBodyless,
}: {
  method: HttpMethod;
  target: string;
  headers: string;
  body: string;
  isBodyless: boolean;
}): string {
  const safePath = target.startsWith("/") ? target : "/" + target;
  const parts = [`curl -X ${method} "${safePath}"`];
  for (const [k, v] of parseHeaders(headers)) {
    parts.push(`-H "${k}: ${v}"`);
  }
  if (!isBodyless && body.trim()) {
    parts.push(`-d '${body.replace(/'/g, `'\\''`)}'`);
  }
  return parts.join(" \\\n  ");
}

/** Per-protocol simulation — small pure functions, not sub-components, so
 *  the shared shell/loading-state/response-panel chrome below never has to
 *  branch on protocol itself. */
const adapters: Record<
  Exclude<Protocol, "websocket">,
  (input: { target: string; method?: HttpMethod; headers: string; body: string; variables?: string }) => SimulatedResult
> = {
  http: ({ target, method = "GET", headers, body }) => simulateHttp({ target, method, headers, body }),

  graphql: ({ target, body, variables }) => {
    let parsedVariables: unknown = undefined;
    try {
      parsedVariables = variables ? JSON.parse(variables) : undefined;
    } catch {
      parsedVariables = variables;
    }
    return {
      status: 200,
      statusText: "OK",
      headers: [["content-type", "application/json"]],
      body: JSON.stringify(
        {
          data: {
            // A real server would resolve this against a schema; nullbase's
            // demo just echoes what was sent so the shape stays honest about
            // being simulated, not a real GraphQL endpoint.
            _simulatedEcho: { endpoint: target, query: body, variables: parsedVariables },
          },
        },
        null,
        2,
      ),
    };
  },

  webhook: ({ target, headers, body }) => {
    return {
      status: 200,
      statusText: "OK",
      headers: [
        ["content-type", "application/json"],
        ["x-simulated-by", "nullbase in-browser echo"],
      ],
      body: JSON.stringify(
        {
          received: true,
          endpoint: target,
          headers: Object.fromEntries(parseHeaders(headers)),
          payload: (() => {
            try {
              return JSON.parse(body);
            } catch {
              return body;
            }
          })(),
          receivedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    };
  },
};

export default function RequestPlayground({
  protocol = "http",
  title,
  defaultTarget = "/api/http/echo",
  defaultMethod = "GET",
  defaultHeaders = "Accept: application/json\nContent-Type: application/json\nX-Demo: nullbase",
  defaultBody = JSON.stringify({ hello: "world" }, null, 2),
  defaultVariables = "{}",
  simulatedMessages = [],
  examplePaths,
}: RequestPlaygroundProps) {
  // All hooks must run unconditionally on every render (rules-of-hooks) —
  // the websocket early return happens below, after every hook this
  // component owns has already been called.
  const [method, setMethod] = useState<HttpMethod>(defaultMethod);
  const [target, setTarget] = useState(defaultTarget);
  const [headersText, setHeadersText] = useState(defaultHeaders);
  const [bodyText, setBodyText] = useState(defaultBody);
  const [variablesText, setVariablesText] = useState(defaultVariables);
  const [result, setResult] = useState<SimulatedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dict = useInteractiveDict();
  const t = dict.requestPlayground;

  if (protocol === "websocket") {
    return <WebSocketPlayground title={title} target={defaultTarget} messages={simulatedMessages} />;
  }

  const isBodyless = protocol === "http" && (method === "GET" || method === "HEAD");
  const chips = examplePaths ?? (protocol === "http" ? DEFAULT_HTTP_EXAMPLES : []);

  // Accepts overrides so clicking an example chip can send with the chip's
  // method/path immediately — `setMethod`/`setTarget` are async, so without
  // this `send()` would still see the *previous* state on that same click.
  async function send(overrides?: { method?: HttpMethod; target?: string }) {
    const effectiveMethod = overrides?.method ?? method;
    const effectiveTarget = overrides?.target ?? target;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Brief pause so the pending state mirrors a real request round trip —
      // pure theater, no network call ever happens.
      await new Promise((resolve) => setTimeout(resolve, 250));
      // `protocol !== "websocket"` here (that branch returned above before
      // `send` could ever be wired to a button) — TS can't see that through
      // the closure, so narrow explicitly.
      const adapter = adapters[protocol as Exclude<Protocol, "websocket">];
      setResult(
        adapter({ target: effectiveTarget, method: effectiveMethod, headers: headersText, body: bodyText, variables: variablesText }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function pickExample(ex: ExamplePath) {
    setMethod(ex.method);
    setTarget(ex.path);
    void send({ method: ex.method, target: ex.path });
  }

  const targetLabel =
    protocol === "graphql" ? t.targetLabelEndpoint : protocol === "webhook" ? t.targetLabelWebhook : t.targetLabelDefault;
  const curlCommand =
    protocol === "http"
      ? buildCurl({ method, target, headers: headersText, body: bodyText, isBodyless })
      : undefined;

  return (
    <PlaygroundShell>
      <PlaygroundSection divider="bottom" tone="muted">
        <div className="mb-2 flex items-center justify-between gap-2">
          <EyebrowLabel as="span" className="mb-0">
            {title ?? (protocol === "http" ? t.defaultTitleHttp : format(t.defaultTitleProtocol, { protocol }))}
          </EyebrowLabel>
          <SimulatedTag label={dict.simulated} />
        </div>

        {protocol === "http" && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {HTTP_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={[
                  "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors duration-150",
                  method === m
                    ? "border-border bg-background text-text-primary"
                    : "border-border bg-surface text-text-primary hover:bg-background/80",
                ].join(" ")}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <EyebrowLabel as="label" className="mb-1.5">
              {targetLabel}
            </EyebrowLabel>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full min-w-0 rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-text-primary outline-none transition focus:border-electric-blue focus:ring-3 focus:ring-electric-blue/15"
            />
          </div>
          <Button
            onClick={() => send()}
            disabled={loading}
            variant="primary"
            className="h-[52px] w-full min-w-0 rounded-xl px-4 text-sm sm:w-auto sm:min-w-[120px]"
          >
            {loading ? t.sending : t.send}
          </Button>
        </div>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pickExample(ex)}
                disabled={loading}
                className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[0.7rem] text-text-secondary transition-colors hover:border-electric-blue/40 hover:text-electric-blue"
              >
                <span className="font-semibold text-text-primary">{ex.label ?? ex.method}</span> {ex.path}
              </button>
            ))}
          </div>
        )}
      </PlaygroundSection>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
        {protocol !== "graphql" && (
          <div className="space-y-2">
            <EyebrowLabel as="label">{t.headersLabel}</EyebrowLabel>
            <textarea
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              placeholder={t.headersPlaceholder}
              className="h-32 max-h-80 w-full max-w-full resize-y rounded-2xl border border-border bg-background p-3 font-mono text-xs text-text-primary outline-none transition focus:border-electric-blue focus:ring-3 focus:ring-electric-blue/15"
            />
          </div>
        )}
        <div className="space-y-2">
          <EyebrowLabel as="label">{protocol === "graphql" ? t.queryLabel : t.bodyLabel}</EyebrowLabel>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder={protocol === "graphql" ? t.bodyPlaceholderGraphql : t.bodyPlaceholderDefault}
            className="h-32 max-h-80 w-full max-w-full resize-y rounded-2xl border border-border bg-background p-3 font-mono text-xs text-text-primary outline-none transition focus:border-electric-blue focus:ring-3 focus:ring-electric-blue/15 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBodyless}
          />
        </div>
        {protocol === "graphql" && (
          <div className="space-y-2 sm:col-span-2">
            <EyebrowLabel as="label">{t.variablesLabel}</EyebrowLabel>
            <textarea
              value={variablesText}
              onChange={(e) => setVariablesText(e.target.value)}
              className="h-20 max-h-80 w-full max-w-full resize-y rounded-2xl border border-border bg-background p-3 font-mono text-xs text-text-primary outline-none transition focus:border-electric-blue focus:ring-3 focus:ring-electric-blue/15"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 pb-4 sm:px-5">
          <code className="block rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </code>
        </div>
      )}

      {result && <ResponsePanel result={result} curl={curlCommand} />}
    </PlaygroundShell>
  );
}

function ResponsePanel({ result, curl }: { result: SimulatedResult; curl?: string }) {
  const [tab, setTab] = useState<"body" | "headers">("body");
  const [copied, setCopied] = useState<"body" | "curl" | null>(null);
  const t = useInteractiveDict().requestPlayground;
  const level: "green" | "red" | "blue" =
    result.status >= 200 && result.status < 300 ? "green" : result.status >= 400 ? "red" : "blue";

  async function copy(text: string, which: "body" | "curl") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied((c) => (c === which ? null : c)), 1500);
    } catch {
      // Clipboard unavailable (permissions, insecure context) — button just
      // never shows "Copied", nothing to recover from.
    }
  }

  return (
    <PlaygroundSection divider="top" tone="muted">
      <div className="mb-3 flex items-center justify-between gap-3">
        <EyebrowLabel as="span" className="mb-0">
          {t.responseLabel}
        </EyebrowLabel>
        <Badge color={level} className="rounded-full px-2.5 py-1">
          {result.status} {result.statusText}
        </Badge>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-full border border-border bg-background p-0.5">
          <button
            type="button"
            onClick={() => setTab("body")}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              tab === "body" ? "bg-surface text-text-primary shadow-card" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {t.tabBody}
          </button>
          <button
            type="button"
            onClick={() => setTab("headers")}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              tab === "headers" ? "bg-surface text-text-primary shadow-card" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {format(t.tabHeaders, { count: result.headers.length })}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => copy(result.body, "body")}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          >
            {copied === "body" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === "body" ? t.copied : t.copy}
          </button>
          {curl && (
            <button
              type="button"
              onClick={() => copy(curl, "curl")}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            >
              {copied === "curl" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === "curl" ? t.copied : t.copyCurl}
            </button>
          )}
        </div>
      </div>

      {tab === "body" ? (
        <JsonBlock text={result.body || t.emptyBody} className="rounded-2xl border border-border bg-surface p-3" />
      ) : (
        <DetailPanel className="overflow-hidden">
          {result.headers.length === 0 ? (
            <p className="px-3 py-2 text-xs text-text-secondary">{t.noHeaders}</p>
          ) : (
            result.headers.map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-2 border-b border-border px-3 py-2 last:border-b-0">
                <span className="font-mono text-[11px] text-text-secondary">{k}</span>
                <span className="break-all text-right font-mono text-[11px] text-text-primary">{v}</span>
              </div>
            ))
          )}
        </DetailPanel>
      )}
    </PlaygroundSection>
  );
}

/** WebSocket is message-log shaped, not request/response shaped — a
 *  "Connect" button plays back an author-scripted exchange with delays. */
function WebSocketPlayground({
  title,
  target,
  messages,
}: {
  title?: string;
  target: string;
  messages: SimulatedMessage[];
}) {
  const [shown, setShown] = useState<SimulatedMessage[]>([]);
  const [connecting, setConnecting] = useState(false);
  const connected = shown.length > 0;
  const dict = useInteractiveDict();
  const t = dict.requestPlayground;

  async function connect() {
    setConnecting(true);
    setShown([]);
    for (const message of messages) {
      await new Promise((resolve) => setTimeout(resolve, message.delayMs ?? 400));
      setShown((prev) => [...prev, message]);
    }
    setConnecting(false);
  }

  return (
    <PlaygroundShell>
      <PlaygroundSection divider="bottom" tone="muted">
        <div className="mb-3 flex items-center justify-between gap-2">
          <EyebrowLabel as="span" className="mb-0">
            {title ?? t.wsDefaultTitle}
          </EyebrowLabel>
          <SimulatedTag label={dict.simulated} />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 truncate rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm text-text-primary">
            {target}
          </code>
          <Button onClick={connect} disabled={connecting} variant="primary" className="sm:min-w-[120px]">
            {connecting ? t.wsConnecting : connected ? t.wsReconnect : t.wsConnect}
          </Button>
        </div>
      </PlaygroundSection>

      {shown.length > 0 && (
        <PlaygroundSection>
          <ul className="flex flex-col gap-2">
            {shown.map((m, i) => (
              <li
                key={i}
                className={[
                  "max-w-[85%] rounded-2xl border border-border px-3 py-2 font-mono text-xs",
                  m.direction === "sent" ? "self-end bg-electric-blue/10 text-text-primary" : "self-start bg-surface text-text-primary",
                ].join(" ")}
              >
                <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                  {m.direction === "sent" ? t.sent : t.received}
                </span>
                {m.body}
              </li>
            ))}
          </ul>
        </PlaygroundSection>
      )}
    </PlaygroundShell>
  );
}
