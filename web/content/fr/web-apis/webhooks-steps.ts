import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A webhook delivery, from triggering event to a retried redelivery —
 *  colocated per the interactive system's authoring convention. */
export const webhookDeliverySteps: StepFlowStep[] = [
  {
    actor: "Votre app",
    title: "Enregistrer un endpoint",
    description:
      "Avant que quoi que ce soit puisse être livré, vous indiquez au service émetteur une URL à appeler et les événements qui vous intéressent — généralement via un tableau de bord ou un appel API « create webhook ».",
    detail: "POST https://api.payments.example/webhooks\n{ \"url\": \"https://your-app.example/hooks/payments\",\n  \"events\": [\"payment.succeeded\"] }",
  },
  {
    actor: "Service émetteur",
    title: "Quelque chose se produit",
    description:
      "Plus tard, complètement indépendamment de ce que votre app a fait, un événement se produit du côté du service émetteur — un paiement passe, un build se termine, un fichier finit d'être traité.",
  },
  {
    actor: "Service émetteur",
    title: "POST vers votre URL",
    description:
      "L'émetteur fait un POST HTTP sortant vers l'URL que vous avez enregistrée, avec l'événement comme corps. Il signe aussi le payload pour que vous puissiez vérifier que la requête vient réellement de lui, pas d'un attaquant ayant deviné votre URL.",
    detail: "POST /hooks/payments HTTP/1.1\nX-Signature: sha256=4a1f...\nContent-Type: application/json\n\n{ \"event\": \"payment.succeeded\", \"id\": \"pay_123\" }",
  },
  {
    actor: "Votre app",
    title: "Vérifier et répondre vite",
    description:
      "Votre endpoint recalcule la signature sur le corps brut en utilisant un secret partagé et la compare au header — c'est ce qui empêche une requête forgée d'être acceptée. Il répond ensuite rapidement (idéalement en moins de quelques secondes) avec un 2xx, et effectue tout travail lent (envoyer un e-mail, mettre à jour une base de données) après, pas avant de répondre.",
  },
  {
    actor: "Service émetteur",
    title: "Pas de réponse, ou une erreur ?",
    description:
      "Si votre endpoint expire, est injoignable, ou retourne un statut non-2xx, la plupart des émetteurs de webhooks n'abandonnent pas simplement — ils réessaient, généralement avec un backoff exponentiel (attendre 1 minute, puis 5, puis 30...), pour un nombre limité de tentatives ou une durée limitée.",
  },
  {
    actor: "Votre app",
    title: "Gérer une redélivrance en toute sécurité",
    description:
      "À cause des réessais, le même événement peut arriver plus d'une fois — un réessai ne signifie pas que la première tentative a réellement été perdue, seulement que l'émetteur n'a pas reçu votre réponse à temps. Les émetteurs attachent un ID d'événement exactement pour cette raison : suivez les ID déjà traités et ignorez les doublons, la même idée qu'une clé d'idempotence.",
  },
];
