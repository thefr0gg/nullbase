import type { ExecutionProvider } from "./types";
import { jsIframeProvider } from "./js-iframe-provider";

/** One entry per supported language — add a provider here to support a new
 *  language without touching `CodePlayground`. */
export const executionProviders: Record<string, ExecutionProvider> = {
  javascript: jsIframeProvider,
};

export function getExecutionProvider(language: string): ExecutionProvider | undefined {
  return executionProviders[language];
}
