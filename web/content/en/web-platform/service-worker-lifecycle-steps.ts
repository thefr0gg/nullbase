import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A service worker's install -> activate -> fetch -> update lifecycle —
 *  colocated per the interactive system's authoring convention. */
export const serviceWorkerLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Page",
    title: "Register",
    description:
      "The page's own JavaScript registers a separate script as its service worker. The browser downloads it and starts installing it in the background — the page that registered it keeps running unaffected.",
    detail: "navigator.serviceWorker.register(\"/sw.js\");",
  },
  {
    actor: "Service worker",
    title: "Install",
    description:
      "The install event fires once. This is typically where a service worker pre-caches the assets it wants available offline, using the Cache API.",
    detail: 'self.addEventListener("install", (e) => {\n  e.waitUntil(caches.open("v1").then((c) => c.addAll(["/", "/app.js", "/app.css"])));\n});',
  },
  {
    actor: "Service worker",
    title: "Waiting",
    description:
      "If an older version of the service worker is already controlling open pages, the new one waits here rather than taking over immediately — by default, it only activates once every page controlled by the old version has been closed, so a user never has two incompatible versions running against the same open tab.",
  },
  {
    actor: "Service worker",
    title: "Activate",
    description:
      "Once nothing is using the old version, activate fires — a good place to clean up caches from a previous version that are no longer needed.",
    detail: 'self.addEventListener("activate", (e) => {\n  e.waitUntil(caches.delete("v0")); // drop the old cache\n});',
  },
  {
    actor: "Service worker",
    title: "Intercept fetches",
    description:
      "From now on, the service worker sits between the page and the network — every request the page makes fires a fetch event the worker can intercept, and respond to from cache, from the network, or a mix of both (e.g. cache-first, falling back to network).",
    detail: 'self.addEventListener("fetch", (e) => {\n  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));\n});',
  },
  {
    actor: "Browser",
    title: "Check for updates",
    description:
      "The browser periodically re-fetches the service worker script and byte-compares it to the installed version. A single changed byte is treated as a new version, restarting this whole lifecycle for the new script — which is why a stale cached version can seem \"stuck\" until every old tab is closed.",
  },
];
