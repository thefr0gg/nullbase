import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const reverseProxySteps: StepFlowStep[] = [
  {
    actor: "Cliente",
    title: "La solicitud llega al Proxy",
    description:
      "El navegador envía una solicitud a example.com. No tiene idea de que hay algo más que un único servidor al otro lado — el DNS simplemente resolvió example.com a la dirección IP del Proxy.",
    detail: "GET /api/users HTTP/1.1\nHost: example.com",
  },
  {
    actor: "Reverse Proxy",
    title: "Decidir a dónde va",
    description:
      "El Proxy inspecciona la solicitud — normalmente solo la ruta o el encabezado Host — y decide qué servidor backend debe realmente gestionarla. Así es como un único nombre de host público puede enrutar a muchos servicios backend diferentes.",
    detail: "Regla: /api/* -> backend-api:8080\nRegla: /*     -> backend-web:3000",
  },
  {
    actor: "Reverse Proxy",
    title: "Reenvío al backend",
    description:
      "El Proxy abre su propia conexión al backend elegido y reenvía la solicitud, a menudo añadiendo encabezados como X-Forwarded-For para que el backend pueda seguir viendo la IP original del cliente.",
    detail: "GET /api/users HTTP/1.1\nHost: backend-api:8080\nX-Forwarded-For: 203.0.113.42",
  },
  {
    actor: "Backend",
    title: "El backend responde",
    description:
      "El servidor backend hace el trabajo real y envía su respuesta — al Proxy, no directamente al cliente.",
  },
  {
    actor: "Reverse Proxy",
    title: "Retransmisión de la respuesta",
    description:
      "El Proxy pasa la respuesta al cliente. La IP real del backend, su puerto, e incluso su existencia nunca se exponen — hasta donde el cliente puede saber, example.com respondió directamente.",
  },
];
