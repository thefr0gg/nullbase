"use client";

import { useState } from "react";
import { Badge, Button } from "@/app/_components/ui";

interface CodeDef {
  code: number;
  label: string;
  reason: string;
  color: "green" | "blue" | "orange" | "red";
}

const CODES: CodeDef[] = [
  { code: 200, label: "200 OK", reason: "OK", color: "green" },
  { code: 201, label: "201 Created", reason: "Created", color: "green" },
  { code: 204, label: "204 No Content", reason: "No Content", color: "green" },
  { code: 301, label: "301 Moved Permanently", reason: "Moved Permanently", color: "blue" },
  { code: 302, label: "302 Found", reason: "Found", color: "blue" },
  { code: 304, label: "304 Not Modified", reason: "Not Modified", color: "blue" },
  { code: 400, label: "400 Bad Request", reason: "Bad Request", color: "orange" },
  { code: 401, label: "401 Unauthorized", reason: "Unauthorized", color: "orange" },
  { code: 403, label: "403 Forbidden", reason: "Forbidden", color: "orange" },
  { code: 404, label: "404 Not Found", reason: "Not Found", color: "red" },
  { code: 405, label: "405 Method Not Allowed", reason: "Method Not Allowed", color: "red" },
  { code: 409, label: "409 Conflict", reason: "Conflict", color: "red" },
  { code: 429, label: "429 Too Many Requests", reason: "Too Many Requests", color: "orange" },
  { code: 500, label: "500 Internal Server Error", reason: "Internal Server Error", color: "red" },
  { code: 502, label: "502 Bad Gateway", reason: "Bad Gateway", color: "red" },
  { code: 503, label: "503 Service Unavailable", reason: "Service Unavailable", color: "red" },
  { code: 504, label: "504 Gateway Timeout", reason: "Gateway Timeout", color: "red" },
];

/**
 * Interactive status-code explorer. Clicking a code renders a simulated HTTP
 * response carrying that status, generated entirely in the browser so the
 * demo works on a fully static deployment (no backend required).
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
    // Brief pause so the pending state mirrors a real request round trip.
    await new Promise((resolve) => setTimeout(resolve, 250));
    const def = CODES.find((c) => c.code === code);
    const reason = def?.reason ?? "Unknown";
    setResp({
      status: code,
      reason,
      body: JSON.stringify(
        {
          status: code,
          reason,
          message: `This is a simulated ${code} response from nullbase.`,
        },
        null,
        2,
      ),
    });
    setLoading(false);
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
