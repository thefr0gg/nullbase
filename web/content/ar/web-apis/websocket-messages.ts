import type { SimulatedMessage } from "@/components/interactive/RequestPlayground";

/** A short chat-room exchange over an open WebSocket connection —
 *  colocated per the interactive system's authoring convention. */
export const chatSocketMessages: SimulatedMessage[] = [
  { direction: "received", body: '{"type":"joined","room":"general","userCount":3}', delayMs: 300 },
  { direction: "sent", body: '{"type":"message","text":"hey, anyone around?"}', delayMs: 700 },
  { direction: "received", body: '{"type":"message","from":"ada","text":"yep, here"}', delayMs: 900 },
  { direction: "sent", body: '{"type":"typing"}', delayMs: 600 },
  { direction: "received", body: '{"type":"message","from":"ada","text":"what\'s up?"}', delayMs: 800 },
  { direction: "received", body: '{"type":"presence","userCount":4}', delayMs: 500 },
];
