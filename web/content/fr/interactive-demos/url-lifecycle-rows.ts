import type { DiagramRow } from "@/components/interactive/DiagramExplorer";

export const urlLifecycleRows: DiagramRow[] = [
  {
    nodes: [{ id: "url", label: "URL saisie", color: "default", detail: "Le navigateur dispose d'une chaîne brute — rien n'a encore été interprété." }],
  },
  {
    connectorLabel: "analyse",
    nodes: [{ id: "parsing", label: "Analyse de l'URL", color: "blue", detail: "Le navigateur découpe la chaîne en schéma, hôte, port, chemin et requête — voir la décomposition ci-dessus pour savoir exactement quels caractères marquent chaque limite." }],
  },
  {
    connectorLabel: "résoudre l'hôte",
    nodes: [{ id: "dns", label: "DNS", color: "green", detail: "Le segment hôte (ex. example.com) est résolu en adresse IP — en vérifiant d'abord le cache du système, puis un résolveur, avant même d'atteindre le réseau." }],
  },
  {
    connectorLabel: "connexion",
    nodes: [{ id: "tcp", label: "TCP", color: "purple", detail: "Une poignée de main en trois temps établit une connexion fiable et ordonnée vers cette adresse IP, sur le port de l'URL (443 pour https, 80 pour http)." }],
  },
  {
    connectorLabel: "https uniquement",
    nodes: [{ id: "tls", label: "TLS", color: "orange", detail: "Pour https, une poignée de main négocie le chiffrement et vérifie le certificat du serveur avant qu'aucune donnée HTTP ne soit envoyée." }],
  },
  {
    connectorLabel: "requête",
    nodes: [{ id: "http", label: "HTTP", color: "blue", detail: "Le navigateur envoie une ligne de requête et des en-têtes construits à partir du chemin et de la requête de l'URL, sur la connexion désormais sécurisée." }],
  },
  {
    connectorLabel: "traitement",
    nodes: [{ id: "server", label: "Serveur", color: "green", detail: "Le serveur route la requête selon le chemin, exécute la logique applicative et produit une réponse." }],
  },
  {
    connectorLabel: "réponse",
    nodes: [{ id: "browser", label: "Le navigateur affiche", color: "purple", detail: "Le navigateur reçoit la réponse et l'affiche — la connexion peut rester ouverte et être réutilisée pour d'autres requêtes vers la même origine." }],
  },
];
