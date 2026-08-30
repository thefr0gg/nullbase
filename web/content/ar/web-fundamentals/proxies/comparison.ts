import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const proxyComparisonItems: ItemExplorerItem[] = [
  {
    id: "forward",
    label: "Forward Proxy",
    color: "blue",
    columns: {
      sits: "أمام العميل",
      hides: "العميل، عن الخادم",
      knows: "الخادم لا يعلم أنه يتحدث مع Proxy",
      examples: "مرشِّحات الويب في الشركات، وشبكات VPN، وبعض حاجبات الإعلانات",
    },
  },
  {
    id: "reverse",
    label: "Reverse Proxy",
    color: "green",
    columns: {
      sits: "أمام الخادم (أو الخوادم)",
      hides: "الخادم (أو الخوادم)، عن العميل",
      knows: "العميل لا يعلم أنه يتحدث مع Proxy",
      examples: "nginx/Cloudflare أمام خلفية ما، وموازنات الحمل، وبوابات API",
    },
  },
];
