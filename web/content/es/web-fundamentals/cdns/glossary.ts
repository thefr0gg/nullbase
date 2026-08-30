import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const cdnGlossaryItems: ItemExplorerItem[] = [
  { id: "origin", label: "Origin Server", color: "blue", detail: "Tu backend real — la fuente de verdad a la que recurre la CDN ante un Cache Miss." },
  { id: "edge", label: "Edge Server", color: "green", detail: "Un servidor de CDN físicamente cercano a los usuarios finales, que cachea y sirve contenido en nombre del origen." },
  { id: "pop", label: "Punto de presencia (PoP)", color: "green", detail: "Una ubicación de centro de datos físico que alberga uno o más Edge Servers." },
  { id: "ttl", label: "Tiempo de vida (TTL)", color: "purple", detail: "Cuánto tiempo mantiene un servidor Edge una copia en Cache antes de considerarla obsoleta y volver a obtenerla del origen." },
  { id: "purge", label: "Purga / Invalidación", color: "orange", detail: "Indicar manualmente a cada servidor Edge que descarte una copia en Cache de inmediato, en lugar de esperar a que expire el TTL — se usa cuando el contenido del origen cambia inesperadamente." },
  { id: "origin-shield", label: "Origin Shield", color: "red", detail: "Una capa de Cache adicional entre los servidores Edge y el origen, para que un Cache Miss en 50 Edges diferentes no se convierta en 50 solicitudes simultáneas llegando al origen a la vez." },
];
