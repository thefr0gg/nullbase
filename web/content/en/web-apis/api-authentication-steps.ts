import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** OAuth 2.0 authorization code flow — colocated per the interactive
 *  system's authoring convention. */
export const oauthAuthCodeSteps: StepFlowStep[] = [
  {
    actor: "Your app",
    title: "Redirect to the authorization server",
    description:
      "Your app sends the user's browser to the authorization server's login page, with your app's client ID, the permissions (scopes) you're requesting, and a URL to redirect back to.",
    detail: "GET https://auth.example.com/authorize?\n  client_id=abc123&\n  redirect_uri=https://your-app.example/callback&\n  scope=read:profile&\n  response_type=code",
  },
  {
    actor: "User",
    title: "Log in and approve",
    description:
      "The user authenticates directly with the authorization server — your app never sees their password — and approves (or denies) the scopes your app is asking for.",
  },
  {
    actor: "Authorization server",
    title: "Redirect back with a code",
    description:
      "The authorization server redirects the browser back to your app's callback URL with a short-lived, single-use authorization code in the query string.",
    detail: "GET https://your-app.example/callback?code=SplxlOBeZQQYbYS6WxSbIA",
  },
  {
    actor: "Your app",
    title: "Exchange the code for a token",
    description:
      "Your app's backend — not the browser — sends that code, along with your app's client secret, directly to the authorization server's token endpoint. This is a server-to-server call, so the client secret never touches the browser.",
    detail: "POST https://auth.example.com/token\n{ \"grant_type\": \"authorization_code\",\n  \"code\": \"SplxlOBeZQQYbYS6WxSbIA\",\n  \"client_id\": \"abc123\",\n  \"client_secret\": \"...\" }",
  },
  {
    actor: "Authorization server",
    title: "Return an access token",
    description:
      "The authorization server verifies the code and secret, then returns an access token (and often a refresh token) — this is what your app actually uses to call the API from now on.",
    detail: "{ \"access_token\": \"eyJhbGciOi...\",\n  \"token_type\": \"Bearer\",\n  \"expires_in\": 3600,\n  \"refresh_token\": \"8xLOxBtZp8\" }",
  },
  {
    actor: "Your app",
    title: "Call the API",
    description:
      "From here on, your app sends the access token on every request as an Authorization: Bearer header. When it expires, the refresh token gets a new one without the user having to log in again.",
    detail: "GET /api/profile\nAuthorization: Bearer eyJhbGciOi...",
  },
];
