import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const reverseProxySteps: StepFlowStep[] = [
  {
    actor: "Client",
    title: "La requête atteint le Proxy",
    description:
      "Le navigateur envoie une requête à example.com. Il n'a aucune idée qu'il existe autre chose qu'un seul serveur de l'autre côté — le DNS a simplement résolu example.com vers l'adresse IP du Proxy.",
    detail: "GET /api/users HTTP/1.1\nHost: example.com",
  },
  {
    actor: "Reverse Proxy",
    title: "Détermination de la destination",
    description:
      "Le Proxy inspecte la requête — généralement juste le chemin ou l'en-tête Host — et décide quel serveur backend doit réellement la traiter. C'est ainsi qu'un seul nom d'hôte public peut router vers de nombreux services backend différents.",
    detail: "Règle : /api/* -> backend-api:8080\nRègle : /*     -> backend-web:3000",
  },
  {
    actor: "Reverse Proxy",
    title: "Transfert vers le backend",
    description:
      "Le Proxy ouvre sa propre connexion vers le backend choisi et transmet la requête, ajoutant souvent des en-têtes comme X-Forwarded-For pour que le backend puisse toujours voir l'adresse IP originale du client.",
    detail: "GET /api/users HTTP/1.1\nHost: backend-api:8080\nX-Forwarded-For: 203.0.113.42",
  },
  {
    actor: "Backend",
    title: "Le backend répond",
    description:
      "Le serveur backend effectue le travail réel et envoie sa réponse — au Proxy, pas directement au client.",
  },
  {
    actor: "Reverse Proxy",
    title: "Relais de la réponse",
    description:
      "Le Proxy transmet la réponse au client. L'IP réelle du backend, son port, et même son existence ne sont jamais exposés — pour autant que le client puisse le dire, example.com a répondu directement.",
  },
];
