import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A webhook delivery, from triggering event to a retried redelivery —
 *  colocated per the interactive system's authoring convention. */
export const webhookDeliverySteps: StepFlowStep[] = [
  {
    actor: "Tu aplicación",
    title: "Registrar un endpoint",
    description:
      "Antes de que se pueda entregar nada, le indicas al servicio emisor una URL a la que llamar y qué eventos te interesan — usualmente mediante un dashboard o una llamada a la API de \"crear webhook\".",
    detail: "POST https://api.payments.example/webhooks\n{ \"url\": \"https://your-app.example/hooks/payments\",\n  \"events\": [\"payment.succeeded\"] }",
  },
  {
    actor: "Servicio emisor",
    title: "Algo sucede",
    description:
      "Más tarde, completamente independiente de lo que haya hecho tu aplicación, ocurre un evento del lado del servicio emisor — un pago se completa, un build termina, un archivo termina de procesarse.",
  },
  {
    actor: "Servicio emisor",
    title: "POST a tu URL",
    description:
      "El emisor hace un POST HTTP saliente a la URL que registraste, con el evento como cuerpo. También firma el payload para que puedas verificar que la solicitud realmente vino de ellos, no de un atacante que adivinó tu URL.",
    detail: "POST /hooks/payments HTTP/1.1\nX-Signature: sha256=4a1f...\nContent-Type: application/json\n\n{ \"event\": \"payment.succeeded\", \"id\": \"pay_123\" }",
  },
  {
    actor: "Tu aplicación",
    title: "Verificar y responder rápido",
    description:
      "Tu endpoint recalcula la firma sobre el cuerpo en crudo usando un secreto compartido y la compara con el header — esto es lo que impide que se acepte una solicitud falsificada. Luego responde rápidamente (idealmente en menos de unos segundos) con un 2xx, y hace cualquier trabajo lento (enviar un correo, actualizar una base de datos) después, no antes de responder.",
  },
  {
    actor: "Servicio emisor",
    title: "¿Sin respuesta, o un error?",
    description:
      "Si tu endpoint da timeout, es inalcanzable, o devuelve un estado que no es 2xx, la mayoría de los emisores de webhooks no simplemente se rinden — reintentan, usualmente con backoff exponencial (esperar 1 minuto, luego 5, luego 30...), durante un número acotado de intentos o cantidad de tiempo.",
  },
  {
    actor: "Tu aplicación",
    title: "Manejar una reentrega de forma segura",
    description:
      "Debido a los reintentos, el mismo evento puede llegar más de una vez — un reintento no significa que el primer intento realmente se perdiera, solo que el emisor no recibió tu respuesta a tiempo. Los emisores adjuntan un ID de evento exactamente por esta razón: rastrea qué IDs ya has procesado y omite los duplicados, la misma idea que una clave de idempotencia.",
  },
];
