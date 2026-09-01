import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** OAuth 2.0 authorization code flow — colocated per the interactive
 *  system's authoring convention. */
export const oauthAuthCodeSteps: StepFlowStep[] = [
  {
    actor: "Tu aplicación",
    title: "Redirigir al servidor de autorización",
    description:
      "Tu aplicación envía el navegador del usuario a la página de inicio de sesión del servidor de autorización, con el client ID de tu aplicación, los permisos (scopes) que solicitas, y una URL a la que redirigir de vuelta.",
    detail: "GET https://auth.example.com/authorize?\n  client_id=abc123&\n  redirect_uri=https://your-app.example/callback&\n  scope=read:profile&\n  response_type=code",
  },
  {
    actor: "Usuario",
    title: "Iniciar sesión y aprobar",
    description:
      "El usuario se autentica directamente con el servidor de autorización — tu aplicación nunca ve su contraseña — y aprueba (o rechaza) los scopes que tu aplicación solicita.",
  },
  {
    actor: "Servidor de autorización",
    title: "Redirigir de vuelta con un código",
    description:
      "El servidor de autorización redirige el navegador de vuelta a la URL de callback de tu aplicación con un código de autorización de un solo uso y vida corta en la cadena de consulta.",
    detail: "GET https://your-app.example/callback?code=SplxlOBeZQQYbYS6WxSbIA",
  },
  {
    actor: "Tu aplicación",
    title: "Intercambiar el código por un token",
    description:
      "El backend de tu aplicación — no el navegador — envía ese código, junto con el client secret de tu aplicación, directamente al endpoint de tokens del servidor de autorización. Esta es una llamada servidor a servidor, así que el client secret nunca toca el navegador.",
    detail: "POST https://auth.example.com/token\n{ \"grant_type\": \"authorization_code\",\n  \"code\": \"SplxlOBeZQQYbYS6WxSbIA\",\n  \"client_id\": \"abc123\",\n  \"client_secret\": \"...\" }",
  },
  {
    actor: "Servidor de autorización",
    title: "Devolver un access token",
    description:
      "El servidor de autorización verifica el código y el secret, y luego devuelve un access token (y a menudo un refresh token) — esto es lo que tu aplicación realmente usa para llamar a la API de ahora en adelante.",
    detail: "{ \"access_token\": \"eyJhbGciOi...\",\n  \"token_type\": \"Bearer\",\n  \"expires_in\": 3600,\n  \"refresh_token\": \"8xLOxBtZp8\" }",
  },
  {
    actor: "Tu aplicación",
    title: "Llamar a la API",
    description:
      "A partir de aquí, tu aplicación envía el access token en cada solicitud como un header Authorization: Bearer. Cuando expira, el refresh token obtiene uno nuevo sin que el usuario tenga que iniciar sesión de nuevo.",
    detail: "GET /api/profile\nAuthorization: Bearer eyJhbGciOi...",
  },
];
