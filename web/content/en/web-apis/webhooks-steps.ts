import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A webhook delivery, from triggering event to a retried redelivery —
 *  colocated per the interactive system's authoring convention. */
export const webhookDeliverySteps: StepFlowStep[] = [
  {
    actor: "Your app",
    title: "Register an endpoint",
    description:
      "Before anything can be delivered, you tell the sending service a URL to call and which events you care about — usually via a dashboard or a \"create webhook\" API call.",
    detail: "POST https://api.payments.example/webhooks\n{ \"url\": \"https://your-app.example/hooks/payments\",\n  \"events\": [\"payment.succeeded\"] }",
  },
  {
    actor: "Sending service",
    title: "Something happens",
    description:
      "Later, completely independent of anything your app did, an event occurs on the sending service's side — a payment clears, a build finishes, a file finishes processing.",
  },
  {
    actor: "Sending service",
    title: "POST to your URL",
    description:
      "The sender makes an outbound HTTP POST to the URL you registered, with the event as the body. It also signs the payload so you can verify the request really came from them, not an attacker who guessed your URL.",
    detail: "POST /hooks/payments HTTP/1.1\nX-Signature: sha256=4a1f...\nContent-Type: application/json\n\n{ \"event\": \"payment.succeeded\", \"id\": \"pay_123\" }",
  },
  {
    actor: "Your app",
    title: "Verify and respond fast",
    description:
      "Your endpoint recomputes the signature over the raw body using a shared secret and compares it to the header — this is what stops a forged request from being accepted. Then it responds quickly (ideally under a few seconds) with a 2xx, and does any slow work (sending an email, updating a database) afterward, not before responding.",
  },
  {
    actor: "Sending service",
    title: "No response, or an error?",
    description:
      "If your endpoint times out, is unreachable, or returns a non-2xx status, most webhook senders don't just give up — they retry, usually with exponential backoff (wait 1 minute, then 5, then 30...), for some bounded number of attempts or amount of time.",
  },
  {
    actor: "Your app",
    title: "Handle a redelivery safely",
    description:
      "Because of retries, the same event can arrive more than once — a retry doesn't mean the first attempt was actually lost, only that the sender didn't get your response in time. Senders attach an event ID for exactly this reason: track which IDs you've already processed and skip duplicates, the same idea as an idempotency key.",
  },
];
