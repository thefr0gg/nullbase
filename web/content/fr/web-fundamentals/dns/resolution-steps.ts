import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const resolutionSteps: StepFlowStep[] = [
  {
    actor: "Navigateur",
    title: "Vérification du Cache local",
    description:
      "Avant d'interroger quiconque d'autre, le navigateur vérifie son propre Cache DNS (et le Cache du système d'exploitation en dessous). Rien n'est encore en Cache lors d'une première visite, la recherche doit donc sortir sur le réseau.",
  },
  {
    actor: "Recursive Resolver",
    title: "Interrogation du Recursive Resolver",
    description:
      "Le système d'exploitation transmet la question à un Recursive Resolver — généralement celui de votre fournisseur d'accès ou un résolveur public comme 1.1.1.1 ou 8.8.8.8. Le rôle de ce Resolver est de faire tout le travail restant et de renvoyer une réponse finale unique.",
    detail: "Requête : www.example.com A?\nÀ : 1.1.1.1 (Recursive Resolver)",
  },
  {
    actor: "Root Server",
    title: "Interrogation d'un Root Server",
    description:
      "Le Resolver ne sait pas encore où réside example.com, il interroge donc l'un des treize groupes de Root Servers. Le Root Server ne connaît pas non plus la réponse — mais il sait qui gère .com.",
    detail: "Requête : www.example.com A?\nLe Root répond : « demande à un serveur TLD .com »",
  },
  {
    actor: "Serveur TLD",
    title: "Interrogation du serveur TLD .com",
    description:
      "Le Resolver suit le renvoi vers un serveur de domaine de premier niveau (TLD) responsable de .com. Il ne possède toujours pas l'adresse IP — mais il sait quels serveurs de noms font autorité pour example.com spécifiquement.",
    detail: "Requête : www.example.com A?\nLe TLD répond : « demande à ns1.example.com »",
  },
  {
    actor: "Serveur faisant autorité",
    title: "Interrogation du serveur faisant autorité",
    description:
      "C'est le serveur que le fournisseur DNS d'example.com exploite lui-même — la source de vérité réelle pour ses enregistrements. Il possède la vraie réponse.",
    detail: "Requête : www.example.com A?\nRéponse : 93.184.216.34",
  },
  {
    actor: "Recursive Resolver",
    title: "Mise en Cache et retour de la réponse",
    description:
      "Le Recursive Resolver met le résultat en Cache pour la durée TTL de l'enregistrement (afin que la prochaine recherche passe directement à cette étape) et transmet enfin l'adresse IP au navigateur, qui peut désormais ouvrir une connexion.",
    detail: "www.example.com -> 93.184.216.34 (en Cache)",
  },
];
