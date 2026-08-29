import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const reverseProxySteps: StepFlowStep[] = [
  {
    actor: "Client",
    title: "Request hits the proxy",
    description:
      "The browser sends a request to example.com. It has no idea there's anything other than a single server on the other end — DNS just resolved example.com to the proxy's IP address.",
    detail: "GET /api/users HTTP/1.1\nHost: example.com",
  },
  {
    actor: "Reverse proxy",
    title: "Decide where it goes",
    description:
      "The proxy inspects the request — usually just the path or Host header — and decides which backend server should actually handle it. This is how one public hostname can route to many different backend services.",
    detail: "Rule: /api/* -> backend-api:8080\nRule: /*     -> backend-web:3000",
  },
  {
    actor: "Reverse proxy",
    title: "Forward to the backend",
    description:
      "The proxy opens its own connection to the chosen backend and forwards the request, often adding headers like X-Forwarded-For so the backend can still see the original client's IP.",
    detail: "GET /api/users HTTP/1.1\nHost: backend-api:8080\nX-Forwarded-For: 203.0.113.42",
  },
  {
    actor: "Backend",
    title: "Backend responds",
    description:
      "The backend server does the actual work and sends its response back — to the proxy, not directly to the client.",
  },
  {
    actor: "Reverse proxy",
    title: "Relay the response",
    description:
      "The proxy passes the response back to the client. The backend's real IP, port, and even its existence are never exposed — as far as the client can tell, example.com answered directly.",
  },
];
