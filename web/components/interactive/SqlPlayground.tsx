"use client";

import { useEffect, useRef, useState } from "react";
import type { Database, QueryExecResult, SqlJsStatic } from "sql.js";
import { Badge, Button } from "@/app/_components/ui";
import { DetailPanel, EyebrowLabel, PlaygroundSection, PlaygroundShell } from "./_shared";
import { CodeEditor } from "./CodeEditor";

const SQL_KEYWORDS = [
  "SELECT", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "INDEX",
  "DROP", "ALTER", "ADD", "COLUMN", "PRIMARY", "KEY", "FOREIGN", "REFERENCES", "NOT", "NULL",
  "DEFAULT", "UNIQUE", "CHECK", "CONSTRAINT", "JOIN", "INNER", "LEFT", "RIGHT", "OUTER", "ON",
  "GROUP", "BY", "ORDER", "HAVING", "LIMIT", "OFFSET", "AND", "OR", "AS", "DISTINCT", "UNION",
  "ALL", "WITH", "RECURSIVE", "CASE", "WHEN", "THEN", "ELSE", "END", "IN", "LIKE", "BETWEEN",
  "IS", "BEGIN", "COMMIT", "ROLLBACK", "TRANSACTION", "SAVEPOINT", "TO", "PRAGMA", "EXPLAIN",
  "QUERY", "PLAN", "RETURNING", "CONFLICT", "DO", "NOTHING", "CASCADE", "RESTRICT",
  "AUTOINCREMENT", "INTEGER", "TEXT", "REAL", "BLOB", "NUMERIC", "VARCHAR", "INT", "BOOLEAN",
  "TRUE", "FALSE",
];

const SQL_TOKEN_RE = new RegExp(
  `(--[^\\n]*)|('(?:[^']|'')*')|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b(?:${SQL_KEYWORDS.join("|")})\\b)`,
  "gi",
);

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Same regex-tokenize-the-escaped-string approach as `_shared.tsx`'s
 *  `highlightJson`, just with SQL's token classes instead of JSON's. */
function highlightSql(raw: string): string {
  const escaped = escapeHtml(raw);
  return escaped.replace(SQL_TOKEN_RE, (match, comment, string, number, keyword) => {
    if (comment) return `<span class="text-text-secondary italic">${comment}</span>`;
    if (string) return `<span class="text-success">${string}</span>`;
    if (number) return `<span class="text-tangerine">${number}</span>`;
    if (keyword) return `<span class="text-electric-blue font-semibold">${keyword}</span>`;
    return match;
  });
}

/**
 * A genuinely real SQLite database running in the browser — via sql.js
 * (SQLite compiled to WebAssembly), not a mock or a hand-rolled interpreter
 * like the rest of this directory's `RequestPlayground`/`Codec`. Every query
 * result, error message, and query plan on a page using this is what real
 * SQLite actually produces, not scripted output — which is the whole point
 * for the Databases section (`EXPLAIN QUERY PLAN`, foreign key constraint
 * violations, and transaction rollback all need to be real to teach anything
 * honest). Nothing here ever leaves the browser: the database lives entirely
 * in WASM memory for the life of the page.
 *
 * The wasm binary (`public/sql-wasm.wasm`) is fetched once, lazily, only on
 * a page that actually renders this component — same reasoning as
 * `MermaidDiagram`'s dynamic `import("mermaid")`.
 */

export interface SqlPlaygroundProps {
  title?: string;
  /** DDL/DML run once against a fresh in-memory database when this widget
   *  mounts (and again on Reset) — typically CREATE TABLE + seed INSERTs. */
  schema: string;
  defaultQuery?: string;
  /** Turns on SQLite's foreign_keys pragma (off by default in SQLite
   *  itself) — needed for the Foreign Keys page's constraint-violation demo. */
  enforceForeignKeys?: boolean;
}

type Status = "loading" | "ready" | "error";

export default function SqlPlayground({ title, schema, defaultQuery = "", enforceForeignKeys = false }: SqlPlaygroundProps) {
  const dbRef = useRef<Database | null>(null);
  const sqlRef = useRef<SqlJsStatic | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [initError, setInitError] = useState<string | null>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [results, setResults] = useState<QueryExecResult[] | null>(null);
  const [rowsModified, setRowsModified] = useState<number | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  function seed(db: Database) {
    if (enforceForeignKeys) db.run("PRAGMA foreign_keys = ON;");
    db.run(schema);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const initSqlJs = (await import("sql.js")).default;
        const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
        if (cancelled) return;
        sqlRef.current = SQL;
        const db = new SQL.Database();
        seed(db);
        dbRef.current = db;
        setStatus("ready");
      } catch (e) {
        if (!cancelled) {
          setInitError(e instanceof Error ? e.message : "Could not load the SQLite engine.");
          setStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- schema/enforceForeignKeys are page-authored constants, not reactive state.
  }, []);

  function run() {
    const db = dbRef.current;
    if (!db) return;
    setRunning(true);
    setRunError(null);
    try {
      const res = db.exec(query);
      setResults(res);
      setRowsModified(res.length === 0 ? db.getRowsModified() : null);
    } catch (e) {
      setResults(null);
      setRowsModified(null);
      setRunError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setRunning(false);
    }
  }

  function reset() {
    const SQL = sqlRef.current;
    if (!SQL) return;
    dbRef.current?.close();
    dbRef.current = new SQL.Database();
    seed(dbRef.current);
    setResults(null);
    setRowsModified(null);
    setRunError(null);
  }

  return (
    <PlaygroundShell>
      <PlaygroundSection divider="bottom" tone="muted">
        <div className="mb-2 flex items-center justify-between gap-2">
          <EyebrowLabel as="span" className="mb-0">
            {title ?? "SQL"}
          </EyebrowLabel>
          <Badge color="green" className="shrink-0">
            Real SQLite — runs in your browser
          </Badge>
        </div>

        {status === "loading" && <p className="text-sm text-text-secondary">Loading SQLite…</p>}
        {status === "error" && (
          <code className="block rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {initError}
          </code>
        )}

        {status === "ready" && (
          <>
            <CodeEditor
              value={query}
              onChange={setQuery}
              highlight={highlightSql}
              placeholder="SELECT * FROM ..."
              aria-label="SQL query"
              className="focus-within:border-electric-blue focus-within:ring-3 focus-within:ring-electric-blue/15"
            />
            <div className="mt-3 flex items-center gap-2">
              <Button onClick={run} disabled={running} variant="primary" className="text-sm">
                {running ? "Running…" : "Run query"}
              </Button>
              <Button onClick={reset} variant="ghost" className="text-sm">
                Reset data
              </Button>
            </div>
          </>
        )}
      </PlaygroundSection>

      {status === "ready" && (runError || results || rowsModified !== null) && (
        <PlaygroundSection>
          {runError ? (
            <code className="block rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {runError}
            </code>
          ) : results && results.length > 0 ? (
            <div className="flex flex-col gap-4">
              {results.map((r, i) => (
                <ResultTable key={i} result={r} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary">
              Query executed. {rowsModified ?? 0} row{rowsModified === 1 ? "" : "s"} affected.
            </p>
          )}
        </PlaygroundSection>
      )}
    </PlaygroundShell>
  );
}

function ResultTable({ result }: { result: QueryExecResult }) {
  return (
    <DetailPanel className="overflow-x-auto scroll-shadow-x">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="bg-background/60">
            {result.columns.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap border-b border-border px-3 py-2 text-start font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-text-secondary"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.values.map((row, i) => (
            <tr key={i} className="last:[&>td]:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="border-b border-border px-3 py-2 font-mono text-xs text-text-primary">
                  {cell === null ? <span className="text-text-secondary italic">NULL</span> : String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </DetailPanel>
  );
}
