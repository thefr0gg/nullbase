import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const handshakeSteps: StepFlowStep[] = [
  {
    actor: "Cliente",
    title: "Client Hello",
    description:
      "El navegador abre una conexión TCP, y luego envía inmediatamente un ClientHello: qué versiones de TLS y suites de cifrado soporta, un número aleatorio, y un key share para el intercambio de claves.",
    detail: "ClientHello\n  supported_versions: TLS 1.3\n  cipher_suites: [...]\n  key_share: <clave pública del cliente>",
  },
  {
    actor: "Servidor",
    title: "Server Hello + certificado",
    description:
      "El servidor elige una suite de cifrado que ambos lados soportan, envía de vuelta su propio key share, y presenta su certificado — la prueba (firmada por una autoridad de certificación de confianza) de que realmente es quien dice ser.",
    detail: "ServerHello\n  cipher_suite: TLS_AES_128_GCM_SHA256\n  key_share: <clave pública del servidor>\nCertificate: example.com (emitido por Let's Encrypt)",
  },
  {
    actor: "Cliente",
    title: "Verificación del certificado",
    description:
      "El cliente verifica la cadena de certificados hasta una CA raíz en la que ya confía, confirma que el nombre de host coincide, y comprueba que no ha expirado ni ha sido revocado. Si algo de esto falla, la conexión se aborta — esta es la comprobación que representa el icono del candado del navegador.",
  },
  {
    actor: "Cliente y servidor",
    title: "Derivación de la clave de sesión",
    description:
      "Usando el intercambio de claves Diffie-Hellman (de curva elíptica), ambos lados calculan de forma independiente la misma clave de sesión simétrica a partir de los key shares intercambiados anteriormente — la clave en sí nunca se transmite, solo el material público necesario para derivarla.",
  },
  {
    actor: "Cliente y servidor",
    title: "Finished",
    description:
      "Ambos lados envían un mensaje «Finished», cifrado con la nueva clave de sesión, que resume todo lo intercambiado hasta ahora. Si cada lado puede descifrar y verificar el mensaje Finished del otro, ambos saben ahora que el Handshake tuvo éxito y que nada fue manipulado en tránsito.",
  },
  {
    actor: "Ambos",
    title: "Datos de aplicación cifrados",
    description:
      "El Handshake ha terminado. A partir de aquí, cada byte — la solicitud HTTP, los encabezados, el cuerpo de la respuesta — viaja cifrado bajo la clave de sesión. Este es el momento en que HTTP se convierte efectivamente en HTTPS.",
  },
];
