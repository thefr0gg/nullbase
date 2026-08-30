import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const proxyComparisonItems: ItemExplorerItem[] = [
  {
    id: "forward",
    label: "Forward Proxy",
    color: "blue",
    columns: {
      sits: "In front of the client",
      hides: "The client, from the server",
      knows: "The server doesn't know it's talking to a proxy",
      examples: "Corporate web filters, VPNs, some ad blockers",
    },
  },
  {
    id: "reverse",
    label: "Reverse Proxy",
    color: "green",
    columns: {
      sits: "In front of the server(s)",
      hides: "The server(s), from the client",
      knows: "The client doesn't know it's talking to a proxy",
      examples: "nginx/Cloudflare in front of a backend, load balancers, API gateways",
    },
  },
];
