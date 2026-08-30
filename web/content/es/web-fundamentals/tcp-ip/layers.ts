import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const tcpIpLayerItems: ItemExplorerItem[] = [
  {
    id: "application",
    label: "Aplicación",
    color: "purple",
    detail: "Donde residen tus protocolos: HTTP, DNS, SMTP. Esta suele ser la única capa que el código de aplicación toca directamente.",
  },
  {
    id: "transport",
    label: "Transporte",
    color: "blue",
    detail: "TCP o UDP. Añade puertos (para que varias aplicaciones puedan compartir una sola dirección IP) y, para TCP, fiabilidad — ordenación, retransmisión, control de flujo.",
  },
  {
    id: "internet",
    label: "Internet",
    color: "green",
    detail: "IP. Añade direccionamiento y enrutamiento — llevar un paquete de una red a otra, sin garantía de entrega ni de orden por sí sola.",
  },
  {
    id: "link",
    label: "Enlace",
    color: "orange",
    detail: "Ethernet, Wi-Fi. Mueve una trama a través de un único enlace físico o local — la capa salto a salto, no de extremo a extremo.",
  },
];
