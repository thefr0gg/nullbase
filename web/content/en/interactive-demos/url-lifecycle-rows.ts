import type { DiagramRow } from "@/components/interactive/DiagramExplorer";

export const urlLifecycleRows: DiagramRow[] = [
  {
    nodes: [{ id: "url", label: "URL entered", color: "default", detail: "The browser has a raw string — nothing has been interpreted yet." }],
  },
  {
    connectorLabel: "parse",
    nodes: [{ id: "parsing", label: "URL parsing", color: "blue", detail: "The browser splits the string into scheme, host, port, path, and query — see the anatomy breakdown above for exactly which characters mark each boundary." }],
  },
  {
    connectorLabel: "resolve host",
    nodes: [{ id: "dns", label: "DNS", color: "green", detail: "The host segment (e.g. example.com) is resolved to an IP address — checking the OS cache, then a resolver, before ever reaching the network." }],
  },
  {
    connectorLabel: "connect",
    nodes: [{ id: "tcp", label: "TCP", color: "purple", detail: "A three-way handshake establishes a reliable, ordered connection to that IP address on the URL's port (443 for https, 80 for http)." }],
  },
  {
    connectorLabel: "https only",
    nodes: [{ id: "tls", label: "TLS", color: "orange", detail: "For https, a handshake negotiates encryption and verifies the server's certificate before any HTTP data is sent." }],
  },
  {
    connectorLabel: "request",
    nodes: [{ id: "http", label: "HTTP", color: "blue", detail: "The browser sends a request line and headers built from the URL's path and query, over the now-secure connection." }],
  },
  {
    connectorLabel: "process",
    nodes: [{ id: "server", label: "Server", color: "green", detail: "The server routes the request by path, runs application logic, and produces a response." }],
  },
  {
    connectorLabel: "response",
    nodes: [{ id: "browser", label: "Browser renders", color: "purple", detail: "The browser receives the response and renders it — the connection may be kept open and reused for further requests to the same origin." }],
  },
];
