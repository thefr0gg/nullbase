import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** OAuth 2.0 authorization code flow — colocated per the interactive
 *  system's authoring convention. */
export const oauthAuthCodeSteps: StepFlowStep[] = [
  {
    actor: "Votre app",
    title: "Redirection vers le serveur d'autorisation",
    description:
      "Votre app envoie le navigateur de l'utilisateur vers la page de connexion du serveur d'autorisation, avec l'ID client de votre app, les permissions (scopes) demandées, et une URL de redirection.",
    detail: "GET https://auth.example.com/authorize?\n  client_id=abc123&\n  redirect_uri=https://your-app.example/callback&\n  scope=read:profile&\n  response_type=code",
  },
  {
    actor: "Utilisateur",
    title: "Se connecter et approuver",
    description:
      "L'utilisateur s'authentifie directement auprès du serveur d'autorisation — votre app ne voit jamais son mot de passe — et approuve (ou refuse) les scopes demandés par votre app.",
  },
  {
    actor: "Serveur d'autorisation",
    title: "Redirection avec un code",
    description:
      "Le serveur d'autorisation redirige le navigateur vers l'URL de callback de votre app avec un code d'autorisation à usage unique et de courte durée dans la query string.",
    detail: "GET https://your-app.example/callback?code=SplxlOBeZQQYbYS6WxSbIA",
  },
  {
    actor: "Votre app",
    title: "Échanger le code contre un token",
    description:
      "Le backend de votre app — pas le navigateur — envoie ce code, avec le secret client de votre app, directement à l'endpoint de token du serveur d'autorisation. C'est un appel serveur-à-serveur, donc le secret client ne touche jamais le navigateur.",
    detail: "POST https://auth.example.com/token\n{ \"grant_type\": \"authorization_code\",\n  \"code\": \"SplxlOBeZQQYbYS6WxSbIA\",\n  \"client_id\": \"abc123\",\n  \"client_secret\": \"...\" }",
  },
  {
    actor: "Serveur d'autorisation",
    title: "Retourner un access token",
    description:
      "Le serveur d'autorisation vérifie le code et le secret, puis retourne un access token (et souvent un refresh token) — c'est ce que votre app utilise désormais pour appeler l'API.",
    detail: "{ \"access_token\": \"eyJhbGciOi...\",\n  \"token_type\": \"Bearer\",\n  \"expires_in\": 3600,\n  \"refresh_token\": \"8xLOxBtZp8\" }",
  },
  {
    actor: "Votre app",
    title: "Appeler l'API",
    description:
      "À partir de là, votre app envoie l'access token à chaque requête dans un header Authorization: Bearer. Quand il expire, le refresh token en obtient un nouveau sans que l'utilisateur ait à se reconnecter.",
    detail: "GET /api/profile\nAuthorization: Bearer eyJhbGciOi...",
  },
];
