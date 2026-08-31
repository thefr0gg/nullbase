import type { GlossaryMap } from "./types";

/**
 * See `en.ts` for the rationale behind a centralized, cross-cutting term
 * map. `href` points to `/fr/...` for sections that are actually
 * translated (web-fundamentals) and falls back to `/en/...` for sections
 * that only exist in English so far (networking, security, databases).
 */
export const fr: GlossaryMap = {
  tcp: {
    term: "TCP",
    definition: "Transmission Control Protocol — un protocole de transport orienté connexion, avec livraison garantie et ordonnée.",
    href: "/en/networking/tcp",
  },
  udp: {
    term: "UDP",
    definition: "User Datagram Protocol — un protocole de transport sans connexion, sans garantie de livraison ni d'ordre, en échange de la rapidité.",
    href: "/en/networking/udp",
  },
  dns: {
    term: "DNS",
    definition: "Domain Name System — traduit les noms de domaine lisibles par un humain en adresses IP réellement utilisées pour le routage.",
    href: "/fr/web-fundamentals/dns",
  },
  tls: {
    term: "TLS",
    definition: "Transport Layer Security — chiffre une connexion et vérifie l'identité du serveur via un certificat.",
    href: "/fr/web-fundamentals/tls",
  },
  http: {
    term: "HTTP",
    definition: "Hypertext Transfer Protocol — le protocole de requête/réponse utilisé par les navigateurs et les API pour communiquer.",
    href: "/fr/web-fundamentals/http",
  },
  jwt: {
    term: "JWT",
    definition: "JSON Web Token — un jeton signé et autonome portant l'identité et des revendications, sans recherche de session côté serveur.",
    href: "/en/security/jwt",
  },
  oauth: {
    term: "OAuth 2.0",
    definition: "Un protocole permettant à un service d'accorder à un autre un accès limité et révocable aux données d'un utilisateur, sans partager de mot de passe.",
    href: "/en/security/oauth-2-0",
  },
  sql: {
    term: "SQL",
    definition: "Structured Query Language — le langage déclaratif utilisé par presque toutes les bases de données relationnelles pour interroger et modifier des données.",
    href: "/en/databases/sql",
  },
  cors: {
    term: "CORS",
    definition: "Cross-Origin Resource Sharing — le mécanisme, appliqué par le navigateur, qui permet à un serveur d'autoriser explicitement une autre origine à lire ses réponses.",
    href: "/en/security/cors",
  },
  api: {
    term: "API",
    definition: "Application Programming Interface — une manière définie pour un logiciel de demander une fonctionnalité ou des données à un autre.",
  },
};
