import type { StateMachineState, StateMachineTransition } from "@/components/interactive/StateMachine";

export const httpLifecycleStates: StateMachineState[] = [
  { id: "idle", label: "Inactivo", color: "default", detail: "No hay ninguna solicitud en curso. Aquí es donde empieza un cliente y adonde vuelve tras un ciclo completo." },
  { id: "sending", label: "Enviando", color: "blue", detail: "El cliente ha escrito la línea de solicitud y las cabeceras y las está enviando por una conexión abierta." },
  { id: "awaiting", label: "Esperando respuesta", color: "orange", detail: "La solicitud se ha enviado por completo; el cliente ahora espera la línea de estado, las cabeceras y el cuerpo del servidor." },
  { id: "receiving", label: "Recibiendo", color: "purple", detail: "La respuesta ha empezado a llegar — para un cuerpo fragmentado (chunked) o en streaming, este estado puede durar un rato." },
  { id: "done", label: "Terminado", color: "green", detail: "Se ha recibido la respuesta completa y se ha entregado al código de la aplicación." },
];

export const httpLifecycleTransitions: StateMachineTransition[] = [
  { from: "idle", to: "sending", label: "client.send()", detail: "El código de la aplicación inicia una solicitud." },
  { from: "sending", to: "awaiting", label: "solicitud completamente escrita", detail: "Todos los bytes de cabeceras y cuerpo han salido del cliente." },
  { from: "awaiting", to: "receiving", label: "línea de estado recibida", detail: "Llegan los primeros bytes de la respuesta del servidor." },
  { from: "receiving", to: "done", label: "cuerpo completo", detail: "Ha llegado el cuerpo de respuesta completo (o un Content-Length definido)." },
  { from: "done", to: "idle", label: "reinicio", detail: "El cliente está listo para enviar otra solicitud, posiblemente reutilizando la misma conexión." },
  { from: "awaiting", to: "idle", label: "tiempo agotado / cancelación", detail: "Un cliente puede desistir mientras aún espera, sin llegar nunca a \"recibiendo\"." },
];
