import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const cacheFlowSteps: StepFlowStep[] = [
  {
    actor: "Cliente",
    title: "La solicitud llega al Edge más cercano",
    description:
      "El DNS resuelve el nombre de host de la CDN al servidor Edge geográfica (o topológicamente) más cercano al cliente — no al servidor de origen, que podría estar al otro lado del planeta.",
  },
  {
    actor: "Servidor Edge",
    title: "Cache Miss",
    description:
      "Primera solicitud de este recurso en esta ubicación Edge: aún no hay nada en Cache. El servidor Edge tiene que ir a buscarlo a algún lugar que realmente lo tenga.",
    detail: "Cache-Status: MISS",
  },
  {
    actor: "Servidor Edge",
    title: "Obtención desde el origen",
    description:
      "El servidor Edge solicita el recurso al servidor de origen (tu backend real), exactamente como lo haría un cliente normal.",
  },
  {
    actor: "Servidor Edge",
    title: "Almacenamiento en Cache y entrega",
    description:
      "El servidor Edge guarda una copia localmente — durante cuánto tiempo lo controla Cache-Control/TTL — y la devuelve al cliente. Esta primera solicitud pagó el coste completo del viaje de ida y vuelta al origen.",
    detail: "Cache-Control: max-age=3600",
  },
  {
    actor: "Servidor Edge",
    title: "Cache Hit (cada solicitud después)",
    description:
      "Cada solicitud posterior del mismo recurso en esta ubicación Edge, ya sea de este cliente o de cualquier otro, se sirve directamente desde la Cache — sin ningún viaje al origen, hasta que expire el TTL.",
    detail: "Cache-Status: HIT",
  },
];
