import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const handshakeSteps: StepFlowStep[] = [
  {
    actor: "Client",
    title: "Client Hello",
    description:
      "Le navigateur ouvre une connexion TCP, puis envoie immédiatement un ClientHello : les versions TLS et suites de chiffrement qu'il supporte, un nombre aléatoire, et un partage de clé pour l'échange de clés.",
    detail: "ClientHello\n  supported_versions: TLS 1.3\n  cipher_suites: [...]\n  key_share: <clé publique du client>",
  },
  {
    actor: "Serveur",
    title: "Server Hello + certificat",
    description:
      "Le serveur choisit une suite de chiffrement supportée par les deux côtés, renvoie son propre partage de clé, et présente son certificat — la preuve (signée par une autorité de certification de confiance) qu'il est bien celui qu'il prétend être.",
    detail: "ServerHello\n  cipher_suite: TLS_AES_128_GCM_SHA256\n  key_share: <clé publique du serveur>\nCertificate : example.com (émis par Let's Encrypt)",
  },
  {
    actor: "Client",
    title: "Vérification du certificat",
    description:
      "Le client vérifie la chaîne de certificats jusqu'à une autorité racine en laquelle il a déjà confiance, confirme que le nom d'hôte correspond, et vérifie qu'il n'a pas expiré ni été révoqué. Si l'un de ces contrôles échoue, la connexion est abandonnée — c'est la vérification que représente l'icône du cadenas du navigateur.",
  },
  {
    actor: "Client et serveur",
    title: "Dérivation de la clé de session",
    description:
      "En utilisant un échange de clés Diffie-Hellman (sur courbe elliptique), les deux côtés calculent indépendamment la même clé de session symétrique à partir des partages de clés échangés précédemment — la clé elle-même n'est jamais transmise, seul le matériel public nécessaire pour la dériver l'est.",
  },
  {
    actor: "Client et serveur",
    title: "Finished",
    description:
      "Chaque côté envoie un message « Finished », chiffré avec la nouvelle clé de session, qui hache tout ce qui a été échangé jusqu'ici. Si chaque côté peut déchiffrer et vérifier le message Finished de l'autre, les deux savent désormais que la Handshake a réussi et que rien n'a été altéré en transit.",
  },
  {
    actor: "Les deux",
    title: "Données applicatives chiffrées",
    description:
      "La Handshake est terminée. À partir de là, chaque octet — la requête HTTP, les en-têtes, le corps de la réponse — voyage chiffré sous la clé de session. C'est le moment où HTTP devient effectivement HTTPS.",
  },
];
