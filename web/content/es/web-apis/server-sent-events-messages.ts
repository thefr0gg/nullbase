import type { SimulatedEvent } from "@/components/interactive/RequestPlayground";

/** A short stock-ticker-style event stream — colocated per the interactive
 *  system's authoring convention. */
export const tickerEvents: SimulatedEvent[] = [
  { event: "price", data: '{"symbol":"NB","price":128.42}', delayMs: 400 },
  { event: "price", data: '{"symbol":"NB","price":128.55}', delayMs: 800 },
  { event: "price", data: '{"symbol":"NB","price":128.40}', delayMs: 700 },
  { event: "ping", data: "keep-alive", delayMs: 600 },
  { event: "price", data: '{"symbol":"NB","price":129.10}', delayMs: 900 },
];
