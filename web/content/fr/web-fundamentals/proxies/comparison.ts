import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const proxyComparisonItems: ItemExplorerItem[] = [
  {
    id: "forward",
    label: "Forward Proxy",
    color: "blue",
    columns: {
      sits: "Devant le client",
      hides: "Le client, du serveur",
      knows: "Le serveur ne sait pas qu'il parle à un Proxy",
      examples: "Filtres web d'entreprise, VPN, certains bloqueurs de publicités",
    },
  },
  {
    id: "reverse",
    label: "Reverse Proxy",
    color: "green",
    columns: {
      sits: "Devant le(s) serveur(s)",
      hides: "Le(s) serveur(s), du client",
      knows: "Le client ne sait pas qu'il parle à un Proxy",
      examples: "nginx/Cloudflare devant un backend, équilibreurs de charge, passerelles API",
    },
  },
];
