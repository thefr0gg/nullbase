import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const proxyComparisonItems: ItemExplorerItem[] = [
  {
    id: "forward",
    label: "Forward Proxy",
    color: "blue",
    columns: {
      sits: "Delante del cliente",
      hides: "El cliente, del servidor",
      knows: "El servidor no sabe que está hablando con un Proxy",
      examples: "Filtros web corporativos, VPN, algunos bloqueadores de anuncios",
    },
  },
  {
    id: "reverse",
    label: "Reverse Proxy",
    color: "green",
    columns: {
      sits: "Delante del/de los servidor(es)",
      hides: "El/los servidor(es), del cliente",
      knows: "El cliente no sabe que está hablando con un Proxy",
      examples: "nginx/Cloudflare delante de un backend, balanceadores de carga, puertas de enlace de API",
    },
  },
];
