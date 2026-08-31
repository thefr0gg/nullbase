"use client";

import { useSliderValue } from "@/components/interactive/InteractiveSlider";

/**
 * Colocated slider visualization for `tcp-vs-udp.mdx` — a small "use
 * client" component reading the slider's current value via context, per
 * `InteractiveSlider`'s documented pattern (a plain function prop can't
 * cross the server/client boundary from statically-rendered MDX).
 */
export default function TcpWindowVisual() {
  const value = useSliderValue();

  return (
    <div>
      <div className="flex gap-0.5">
        {Array.from({ length: 64 }, (_, i) => (
          <span
            key={i}
            className={i < value ? "h-4 flex-1 rounded-sm bg-electric-blue" : "h-4 flex-1 rounded-sm bg-border"}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-text-secondary">
        Up to <strong className="text-text-primary">{value} KB</strong> can be in flight, unacknowledged, before the
        sender has to pause. Too small and high-latency links sit idle waiting for ACKs; too large and a lossy link
        wastes bandwidth resending large bursts.
      </p>
    </div>
  );
}
