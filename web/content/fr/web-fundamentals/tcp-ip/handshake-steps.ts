import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const tcpLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Client",
    title: "SYN",
    description:
      "Le client choisit un numéro de séquence initial aléatoire et envoie un segment avec le drapeau SYN activé, proposant de démarrer une connexion.",
    detail: "Client -> Serveur\nflags: SYN\nseq: 1000",
  },
  {
    actor: "Serveur",
    title: "SYN-ACK",
    description:
      "Le serveur accuse réception du numéro de séquence du client (seq+1) et envoie son propre SYN avec son propre numéro de séquence initial aléatoire, proposant la connexion en retour.",
    detail: "Serveur -> Client\nflags: SYN, ACK\nseq: 5000  ack: 1001",
  },
  {
    actor: "Client",
    title: "ACK",
    description:
      "Le client accuse réception du numéro de séquence du serveur. Les deux côtés ont désormais confirmé qu'ils peuvent envoyer ET recevoir — la connexion est établie.",
    detail: "Client -> Serveur\nflags: ACK\nseq: 1001  ack: 5001",
  },
  {
    actor: "Les deux",
    title: "Transfert de données",
    description:
      "Une fois la connexion ouverte, les deux côtés échangent des données par segments, chacun acquitté par numéro de séquence. Si l'accusé de réception d'un segment n'arrive pas à temps, TCP le retransmet — c'est ce qui rend TCP fiable, contrairement à UDP.",
  },
  {
    actor: "Client",
    title: "FIN",
    description:
      "Lorsque le client a fini d'envoyer, il envoie un segment avec le drapeau FIN — « je n'ai plus de données pour toi », pas « ferme immédiatement ». La connexion peut encore recevoir des données du serveur après cela.",
    detail: "Client -> Serveur\nflags: FIN\nseq: 2000",
  },
  {
    actor: "Serveur",
    title: "ACK, puis FIN, puis ACK",
    description:
      "Le serveur acquitte le FIN du client, termine d'envoyer ce qu'il avait encore, puis envoie son propre FIN. Le client l'acquitte, et alors seulement les deux côtés libèrent la connexion — une clôture en quatre étapes qui reflète l'établissement en trois étapes.",
    detail: "Serveur -> Client : ACK\nServeur -> Client : FIN\nClient -> Serveur : ACK",
  },
];
