import type { GlossaryMap } from "./types";

/**
 * See `en.ts` for the rationale behind a centralized, cross-cutting term
 * map. `href` points to `/es/...` for sections that are actually
 * translated (web-fundamentals) and falls back to `/en/...` for sections
 * that only exist in English so far (networking, security, databases).
 */
export const es: GlossaryMap = {
  tcp: {
    term: "TCP",
    definition: "Transmission Control Protocol — un protocolo de transporte orientado a conexión, con entrega garantizada y ordenada.",
    href: "/en/networking/tcp",
  },
  udp: {
    term: "UDP",
    definition: "User Datagram Protocol — un protocolo de transporte sin conexión, sin garantías de entrega ni de orden, a cambio de velocidad.",
    href: "/en/networking/udp",
  },
  dns: {
    term: "DNS",
    definition: "Domain Name System — traduce nombres de dominio legibles por humanos en las direcciones IP que realmente enrutan las computadoras.",
    href: "/es/web-fundamentals/dns",
  },
  tls: {
    term: "TLS",
    definition: "Transport Layer Security — cifra una conexión y verifica la identidad del servidor mediante un certificado.",
    href: "/es/web-fundamentals/tls",
  },
  http: {
    term: "HTTP",
    definition: "Hypertext Transfer Protocol — el protocolo de solicitud/respuesta que usan los navegadores y las API para comunicarse.",
    href: "/es/web-fundamentals/http",
  },
  jwt: {
    term: "JWT",
    definition: "JSON Web Token — un token firmado y autocontenido que lleva identidad y reclamaciones sin necesidad de consultar una sesión en el servidor.",
    href: "/en/security/jwt",
  },
  oauth: {
    term: "OAuth 2.0",
    definition: "Un protocolo para otorgar a un servicio acceso limitado y revocable a los datos de un usuario en otro servicio, sin compartir una contraseña.",
    href: "/en/security/oauth-2-0",
  },
  sql: {
    term: "SQL",
    definition: "Structured Query Language — el lenguaje declarativo que casi toda base de datos relacional usa para consultar y modificar datos.",
    href: "/en/databases/sql",
  },
  cors: {
    term: "CORS",
    definition: "Cross-Origin Resource Sharing — el mecanismo, aplicado por el navegador, que permite a un servidor autorizar explícitamente que otro origen lea sus respuestas.",
    href: "/en/security/cors",
  },
  api: {
    term: "API",
    definition: "Application Programming Interface — una forma definida en la que un software puede solicitar funcionalidad o datos de otro.",
  },
};
