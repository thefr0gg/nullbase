import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const cacheFlowSteps: StepFlowStep[] = [
  {
    actor: "Client",
    title: "Request hits the nearest edge",
    description:
      "DNS resolves the CDN's hostname to whichever edge server is geographically (or network-topologically) closest to the client — not to the origin server, which might be on the other side of the planet.",
  },
  {
    actor: "Edge server",
    title: "Cache miss",
    description:
      "First request for this asset at this edge location: nothing is cached yet. The edge server has to go fetch it from somewhere that actually has it.",
    detail: "Cache-Status: MISS",
  },
  {
    actor: "Edge server",
    title: "Fetch from origin",
    description:
      "The edge server requests the asset from the origin server (your actual backend), exactly like a normal client would.",
  },
  {
    actor: "Edge server",
    title: "Cache and serve",
    description:
      "The edge server stores a copy locally — for how long is controlled by Cache-Control/TTL — and returns it to the client. This first request paid the full round-trip cost to the origin.",
    detail: "Cache-Control: max-age=3600",
  },
  {
    actor: "Edge server",
    title: "Cache hit (every request after)",
    description:
      "Every subsequent request for the same asset at this edge location, from this client or any other, is served directly from the cache — no trip to the origin at all, until the TTL expires.",
    detail: "Cache-Status: HIT",
  },
];
