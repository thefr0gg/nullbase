/**
 * The interface `CodePlayground` runs code through — never coupled to one
 * execution backend. Today only `javascript` has a provider (a sandboxed
 * iframe, see `js-iframe-provider.ts`); adding a second language later
 * means writing one more `ExecutionProvider` and registering it in
 * `providers.ts`, not touching the component.
 */
export interface ExecutionResult {
  stdout: string;
  stderr?: string;
  /** A raw error message, or the sentinel `TIMEOUT_ERROR` below. */
  error?: string;
}

export interface ExecutionProvider {
  language: string;
  label: string;
  run(code: string, options?: { timeoutMs?: number }): Promise<ExecutionResult>;
}

/** Sentinel `ExecutionResult.error` value — the caller renders
 *  `dict.timeoutError` for this instead of the raw string. */
export const TIMEOUT_ERROR = "__timeout__";
