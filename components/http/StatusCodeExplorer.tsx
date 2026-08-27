"use client";

import { useState } from "react";
import { Badge, Button } from "@/app/_components/ui";

interface CodeDef {
  code: number;
  label: string;
  color: "green" | "blue" | "orange" | "red";
}

const CODES: CodeDef[] = [
  { code: 200, label: "200 OK", color: "green" },
  { code: 201, label: "201 Created", color: "green" },
  { code: 204, label: "204 No Content", color: "green" },
  { code: 301, label: "301 Moved Permanently", color: "blue" },
  { code: 302, label: "302 Found", color: "blue" },
  { code: 304, label: "304 Not Modified", color: "blue" },
  { code: 400, label: "400 Bad Request", color: "orange" },
  { code: 401, label: "401 Unauthorized", color: "orange" },
  { code: 403, label: "403 Forbidden", color: "orange" },
  { code: 404, label: "404 Not Found", color: "red" },
  { code: 405, label: "405 Method Not Allowed", color: "red" },
  { code: 409, label: "409 Conflict", color: "red" },
  { code: 429, label: "429 Too Many Requests", color: "orange" },
  { code: 500, label: "500 Internal Server Error", color: "red" },
  { code: 502, label: "502 Bad Gateway", color: "red" },
  { code: 503, label: "503 Service Unavailable", color: "red" },
  { code: 504, label: "504 Gateway Timeout", color: "red" },
];

/**
 * Interactive status-code explorer. Clicking a code issues a real request to
 * `/api/http/status/<code>` and renders the live response.
 */
export default function StatusCodeExplorer({
  defaultCode = 200,
}: { defaultCode?: number }) {
  const [active, setActive] = useState(defaultCode);
  const [resp, setResp] = useState<ExplorerResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(code: number) {
    setActive(code);
    setLoading(true);
    setResp(null);
    try {
      const r = await fetch(`/api/http/status/${code}`);
      const body = await r.text();
      let payload: { status?: number; reason?: string; message?: string } = {};
      try {
        payload = JSON.parse(body);
      } catch {
        /* non-JSON body */
      }
      setResp({
        status: payload.status ?? r.status,
        reason: payload.reason ?? r.statusText,
        body,
      });
    } catch (e) {
      setResp({ status: code, reason: "Error", body: "Could not reach the server." });
    } finally {
      setLoading(false);
    }
  }

  const activeDef = CODES.find((c) => c.code === active);

  return (
    <div className="my-6 grid gap-4">
      <div className="flex flex-wrap gap-2">
        {CODES.map((c) => (
          <Button
            key={c.code}
            onClick={() => run(c.code)}
            disabled={loading}
            variant={active === c.code ? "primary" : "ghost"}
            className="text-xs"
          >
            {c.label}
          </Button>
        ))}
      </div>
      {resp && (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-[0_12px_24px_-8px_rgba(59,130,246,0.12)]">
          <Badge color={activeDef?.color ?? "blue"}>
            {resp.status} {resp.reason}
          </Badge>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-background p-3 text-xs">
            {resp.body}
          </pre>
        </div>
      )}
    </div>
  );
}

interface ExplorerResponse {
  status: number;
  reason: string;
  body: string;
}
