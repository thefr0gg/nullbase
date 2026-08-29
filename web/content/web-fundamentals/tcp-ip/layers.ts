import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const tcpIpLayerItems: ItemExplorerItem[] = [
  {
    id: "application",
    label: "Application",
    color: "purple",
    detail: "Where your protocols live: HTTP, DNS, SMTP. This is the only layer application code usually touches directly.",
  },
  {
    id: "transport",
    label: "Transport",
    color: "blue",
    detail: "TCP or UDP. Adds ports (so multiple applications can share one IP address) and, for TCP, reliability — ordering, retransmission, flow control.",
  },
  {
    id: "internet",
    label: "Internet",
    color: "green",
    detail: "IP. Adds addressing and routing — getting a packet from one network to another, with no guarantee of delivery or order on its own.",
  },
  {
    id: "link",
    label: "Link",
    color: "orange",
    detail: "Ethernet, Wi-Fi. Moves a frame across a single physical or local link — the hop-by-hop layer, not end-to-end.",
  },
];
