import type { StateMachineState, StateMachineTransition } from "@/components/interactive/StateMachine";

export const httpLifecycleStates: StateMachineState[] = [
  { id: "idle", label: "Idle", color: "default", detail: "No request in flight. This is where a client starts and ends up again after a full cycle." },
  { id: "sending", label: "Sending", color: "blue", detail: "The client has written the request line and headers and is sending them over an open connection." },
  { id: "awaiting", label: "Awaiting response", color: "orange", detail: "The request has been fully sent; the client is now waiting for the server's status line, headers, and body." },
  { id: "receiving", label: "Receiving", color: "purple", detail: "The response has started arriving — for a chunked or streamed body, this state can last a while." },
  { id: "done", label: "Done", color: "green", detail: "The full response has been received and handed to application code." },
];

export const httpLifecycleTransitions: StateMachineTransition[] = [
  { from: "idle", to: "sending", label: "client.send()", detail: "Application code initiates a request." },
  { from: "sending", to: "awaiting", label: "request fully written", detail: "Every header and body byte has left the client." },
  { from: "awaiting", to: "receiving", label: "status line received", detail: "The server's first response bytes arrive." },
  { from: "receiving", to: "done", label: "body complete", detail: "The full response body (or a defined Content-Length) has arrived." },
  { from: "done", to: "idle", label: "reset", detail: "The client is ready to send another request, possibly reusing the same connection." },
  { from: "awaiting", to: "idle", label: "timeout / abort", detail: "A client can give up while still waiting, without ever reaching \"receiving\"." },
];
