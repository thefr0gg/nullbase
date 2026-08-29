import RequestPlayground, { type HttpMethod } from "./RequestPlayground";
import ItemExplorer, { type ItemExplorerItem } from "./ItemExplorer";
import type { ExamplePath } from "./mock-api";

/**
 * Backward-compatible wrappers for the two original MDX tag names
 * (`<HttpRequest>`, `<StatusCodeExplorer>`) so the existing content under
 * web/content/http/** keeps working unedited after their implementations
 * moved into the generalized RequestPlayground/ItemExplorer primitives.
 */

export function LegacyHttpRequest({
  defaultMethod,
  defaultPath,
  defaultHeaders,
  defaultBody,
  examplePaths,
}: {
  defaultMethod?: HttpMethod;
  defaultPath?: string;
  defaultHeaders?: string;
  defaultBody?: string;
  examplePaths?: ExamplePath[];
}) {
  return (
    <RequestPlayground
      protocol="http"
      defaultMethod={defaultMethod}
      defaultTarget={defaultPath}
      defaultHeaders={defaultHeaders}
      defaultBody={defaultBody}
      examplePaths={examplePaths}
    />
  );
}

interface StatusCodeDef {
  code: number;
  label: string;
  reason: string;
  color: ItemExplorerItem["color"];
}

const STATUS_CODES: StatusCodeDef[] = [
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

function statusResponseBody(def: StatusCodeDef): string {
  return JSON.stringify(
    {
      status: def.code,
      reason: def.reason,
      message: `This is a simulated ${def.code} response from nullbase.`,
    },
    null,
    2,
  );
}

const STATUS_ITEMS: ItemExplorerItem[] = STATUS_CODES.map((def) => ({
  id: String(def.code),
  label: def.label,
  color: def.color,
  detail: <pre className="overflow-x-auto rounded-xl bg-background p-3 text-xs">{statusResponseBody(def)}</pre>,
}));

export function LegacyStatusCodeExplorer({ defaultCode = 200 }: { defaultCode?: number }) {
  return <ItemExplorer items={STATUS_ITEMS} layout="pills" defaultId={String(defaultCode)} />;
}
