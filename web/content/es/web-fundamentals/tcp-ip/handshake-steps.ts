import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const tcpLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Cliente",
    title: "SYN",
    description:
      "El cliente elige un número de secuencia inicial aleatorio y envía un segmento con el indicador SYN activado, proponiendo iniciar una conexión.",
    detail: "Cliente -> Servidor\nflags: SYN\nseq: 1000",
  },
  {
    actor: "Servidor",
    title: "SYN-ACK",
    description:
      "El servidor confirma el número de secuencia del cliente (seq+1) y envía su propio SYN con su propio número de secuencia inicial aleatorio, proponiendo la conexión de vuelta.",
    detail: "Servidor -> Cliente\nflags: SYN, ACK\nseq: 5000  ack: 1001",
  },
  {
    actor: "Cliente",
    title: "ACK",
    description:
      "El cliente confirma el número de secuencia del servidor. Ambos lados han confirmado ahora que pueden enviar Y recibir — la conexión está establecida.",
    detail: "Cliente -> Servidor\nflags: ACK\nseq: 1001  ack: 5001",
  },
  {
    actor: "Ambos",
    title: "Transferencia de datos",
    description:
      "Con la conexión abierta, ambos lados intercambian datos en segmentos, cada uno confirmado por número de secuencia. Si la confirmación de un segmento no llega a tiempo, TCP lo retransmite — esto es lo que hace fiable a TCP, a diferencia de UDP.",
  },
  {
    actor: "Cliente",
    title: "FIN",
    description:
      "Cuando el cliente termina de enviar, envía un segmento con el indicador FIN — «no tengo más datos para ti», no «cierra inmediatamente». La conexión todavía puede recibir datos del servidor después de esto.",
    detail: "Cliente -> Servidor\nflags: FIN\nseq: 2000",
  },
  {
    actor: "Servidor",
    title: "ACK, luego FIN, luego ACK",
    description:
      "El servidor confirma el FIN del cliente, termina de enviar lo que aún tenía, y luego envía su propio FIN. El cliente lo confirma, y solo entonces ambos lados liberan la conexión — un cierre de cuatro pasos que refleja el establecimiento de tres pasos.",
    detail: "Servidor -> Cliente: ACK\nServidor -> Cliente: FIN\nCliente -> Servidor: ACK",
  },
];
