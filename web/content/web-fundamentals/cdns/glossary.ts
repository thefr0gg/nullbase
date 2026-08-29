import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const cdnGlossaryItems: ItemExplorerItem[] = [
  { id: "origin", label: "Origin", color: "blue", detail: "Your actual backend server — the source of truth the CDN falls back to on a cache miss." },
  { id: "edge", label: "Edge Server", color: "green", detail: "A CDN server physically close to end users, caching and serving content on the origin's behalf." },
  { id: "pop", label: "PoP", color: "green", detail: "\"Point of Presence\" — a physical data center location housing one or more edge servers." },
  { id: "ttl", label: "TTL", color: "purple", detail: "\"Time To Live\" — how long an edge server keeps a cached copy before treating it as stale and re-fetching from origin." },
  { id: "purge", label: "Purge / Invalidate", color: "orange", detail: "Manually telling every edge server to drop a cached copy immediately, instead of waiting for the TTL to expire — used when origin content changes unexpectedly." },
  { id: "origin-shield", label: "Origin Shield", color: "red", detail: "An extra caching layer between edge servers and the origin, so a cache miss at 50 different edges doesn't turn into 50 simultaneous requests hitting the origin at once." },
];
