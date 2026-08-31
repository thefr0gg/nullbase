import type { ExecutionProvider, ExecutionResult } from "./types";
import { TIMEOUT_ERROR } from "./types";

/**
 * Runs user JavaScript in a sandboxed iframe — `sandbox="allow-scripts"`
 * with `allow-same-origin` deliberately omitted, so the iframe gets an
 * opaque origin: no access to this page's cookies, DOM, storage, or
 * same-origin `fetch`. A fresh iframe is created per run and torn down
 * immediately after (success, error, or timeout) rather than reused, so
 * nothing about one run's globals can leak into the next.
 *
 * `console.log`/`warn`/`info` are captured as stdout, `console.error` as
 * stderr, and a thrown exception is reported as `error`. There is no
 * network or timer access from inside the sandbox script itself beyond
 * what plain JS gives it — an infinite loop is caught by the parent-side
 * watchdog timeout, which just discards the iframe outright (there's no way
 * to interrupt a synchronous infinite loop from outside, only to stop
 * waiting for it and never grant it another chance to respond).
 */

const DEFAULT_TIMEOUT_MS = 3000;

const SANDBOX_HTML = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
(function () {
  function serialize(args) {
    return Array.prototype.map.call(args, function (a) {
      if (typeof a === "string") return a;
      try { return JSON.stringify(a); } catch (e) { return String(a); }
    }).join(" ");
  }
  var logs = [];
  var errs = [];
  console.log = console.info = console.warn = function () { logs.push(serialize(arguments)); };
  console.error = function () { errs.push(serialize(arguments)); };

  window.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "run") return;
    var result = { stdout: "", stderr: "" };
    try {
      // eslint-disable-next-line no-new-func -- the whole point of this sandbox is to run author/learner code
      var fn = new Function(event.data.code);
      fn();
      result.stdout = logs.join("\\n");
      if (errs.length) result.stderr = errs.join("\\n");
    } catch (err) {
      result.stdout = logs.join("\\n");
      if (errs.length) result.stderr = errs.join("\\n");
      result.error = err && err.message ? err.message : String(err);
    }
    parent.postMessage({ type: "result", id: event.data.id, result: result }, "*");
  });

  parent.postMessage({ type: "ready" }, "*");
})();
<\/script></body></html>`;

export const jsIframeProvider: ExecutionProvider = {
  language: "javascript",
  label: "JavaScript",
  run(code, options) {
    const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    return new Promise<ExecutionResult>((resolve) => {
      if (typeof document === "undefined") {
        resolve({ stdout: "", error: "Execution is only available in the browser." });
        return;
      }

      const id = Math.random().toString(36).slice(2);
      const iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.setAttribute("aria-hidden", "true");
      iframe.style.cssText = "position:absolute;width:0;height:0;border:0;pointer-events:none;";
      iframe.srcdoc = SANDBOX_HTML;

      let settled = false;
      function finish(result: ExecutionResult) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        window.removeEventListener("message", onMessage);
        iframe.remove();
        resolve(result);
      }

      const timer = window.setTimeout(() => finish({ stdout: "", error: TIMEOUT_ERROR }), timeoutMs);

      function onMessage(event: MessageEvent) {
        if (event.source !== iframe.contentWindow || !event.data) return;
        if (event.data.type === "ready") {
          iframe.contentWindow?.postMessage({ type: "run", id, code }, "*");
        } else if (event.data.type === "result" && event.data.id === id) {
          finish(event.data.result as ExecutionResult);
        }
      }

      window.addEventListener("message", onMessage);
      document.body.appendChild(iframe);
    });
  },
};
