import { afterEach, describe, expect, it, vi } from "vitest";
import { jsIframeProvider } from "./js-iframe-provider";
import { TIMEOUT_ERROR } from "./types";

/**
 * jsdom doesn't execute an iframe's `srcdoc` script, so the sandbox's
 * "ready"/"result" handshake never actually fires in this environment —
 * which makes it a good test of the one behavior that's hardest to verify
 * by hand: the parent-side watchdog cleans up and resolves with
 * `TIMEOUT_ERROR` when nothing responds in time, rather than hanging.
 */
describe("jsIframeProvider", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.querySelectorAll("iframe").forEach((el) => el.remove());
  });

  it("creates exactly one hidden, sandboxed iframe per run", async () => {
    vi.useFakeTimers();
    const promise = jsIframeProvider.run("console.log(1)", { timeoutMs: 1000 });
    expect(document.querySelectorAll("iframe")).toHaveLength(1);
    const iframe = document.querySelector("iframe")!;
    expect(iframe.getAttribute("sandbox")).toBe("allow-scripts");

    await vi.advanceTimersByTimeAsync(1000);
    await promise;
  });

  it("resolves with TIMEOUT_ERROR and removes the iframe if nothing responds in time", async () => {
    vi.useFakeTimers();
    const promise = jsIframeProvider.run("while(true){}", { timeoutMs: 500 });

    await vi.advanceTimersByTimeAsync(500);
    const result = await promise;

    expect(result.error).toBe(TIMEOUT_ERROR);
    expect(document.querySelectorAll("iframe")).toHaveLength(0);
  });

  it("does not resolve before the timeout elapses", async () => {
    vi.useFakeTimers();
    let resolved = false;
    const promise = jsIframeProvider.run("1", { timeoutMs: 1000 }).then((r) => {
      resolved = true;
      return r;
    });

    await vi.advanceTimersByTimeAsync(500);
    expect(resolved).toBe(false);

    await vi.advanceTimersByTimeAsync(500);
    await promise;
    expect(resolved).toBe(true);
  });
});
