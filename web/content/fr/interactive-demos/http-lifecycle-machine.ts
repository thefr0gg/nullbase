import type { StateMachineState, StateMachineTransition } from "@/components/interactive/StateMachine";

export const httpLifecycleStates: StateMachineState[] = [
  { id: "idle", label: "Inactif", color: "default", detail: "Aucune requête en cours. C'est le point de départ d'un client, et où il revient après un cycle complet." },
  { id: "sending", label: "Envoi", color: "blue", detail: "Le client a écrit la ligne de requête et les en-têtes et est en train de les envoyer sur une connexion ouverte." },
  { id: "awaiting", label: "En attente de réponse", color: "orange", detail: "La requête a été entièrement envoyée ; le client attend maintenant la ligne de statut, les en-têtes et le corps du serveur." },
  { id: "receiving", label: "Réception", color: "purple", detail: "La réponse a commencé à arriver — pour un corps découpé (chunked) ou en flux, cet état peut durer un moment." },
  { id: "done", label: "Terminé", color: "green", detail: "La réponse complète a été reçue et transmise au code applicatif." },
];

export const httpLifecycleTransitions: StateMachineTransition[] = [
  { from: "idle", to: "sending", label: "client.send()", detail: "Le code applicatif initie une requête." },
  { from: "sending", to: "awaiting", label: "requête entièrement écrite", detail: "Chaque octet d'en-tête et de corps a quitté le client." },
  { from: "awaiting", to: "receiving", label: "ligne de statut reçue", detail: "Les premiers octets de la réponse du serveur arrivent." },
  { from: "receiving", to: "done", label: "corps complet", detail: "Le corps de réponse complet (ou un Content-Length défini) est arrivé." },
  { from: "done", to: "idle", label: "réinitialisation", detail: "Le client est prêt à envoyer une autre requête, en réutilisant éventuellement la même connexion." },
  { from: "awaiting", to: "idle", label: "délai dépassé / abandon", detail: "Un client peut abandonner alors qu'il attend encore, sans jamais atteindre l'état « réception »." },
];
