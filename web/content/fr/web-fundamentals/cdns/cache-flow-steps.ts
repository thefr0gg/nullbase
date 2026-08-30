import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const cacheFlowSteps: StepFlowStep[] = [
  {
    actor: "Client",
    title: "La requête atteint l'Edge le plus proche",
    description:
      "Le DNS résout le nom d'hôte du CDN vers le serveur Edge géographiquement (ou topologiquement) le plus proche du client — pas vers le serveur d'origine, qui peut se trouver à l'autre bout de la planète.",
  },
  {
    actor: "Serveur Edge",
    title: "Cache Miss",
    description:
      "Première requête pour cet actif à cet emplacement Edge : rien n'est encore en Cache. Le serveur Edge doit aller le chercher quelque part qui le possède réellement.",
    detail: "Cache-Status: MISS",
  },
  {
    actor: "Serveur Edge",
    title: "Récupération depuis l'origine",
    description:
      "Le serveur Edge demande l'actif au serveur d'origine (votre backend réel), exactement comme le ferait un client normal.",
  },
  {
    actor: "Serveur Edge",
    title: "Mise en Cache et diffusion",
    description:
      "Le serveur Edge stocke une copie localement — la durée étant contrôlée par Cache-Control/TTL — puis la retourne au client. Cette première requête a payé le coût complet de l'aller-retour vers l'origine.",
    detail: "Cache-Control: max-age=3600",
  },
  {
    actor: "Serveur Edge",
    title: "Cache Hit (chaque requête suivante)",
    description:
      "Chaque requête suivante pour le même actif à cet emplacement Edge, que ce soit de ce client ou d'un autre, est servie directement depuis le Cache — sans aucun trajet vers l'origine, jusqu'à l'expiration du TTL.",
    detail: "Cache-Status: HIT",
  },
];
