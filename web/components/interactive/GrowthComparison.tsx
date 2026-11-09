"use client";

import { useSliderValue } from "./InteractiveSlider";

/**
 * A two-row bar chart comparing a linear-time cost against a logarithmic
 * one as `n` grows — e.g. "linear scan" vs "binary search". Reads the
 * current value from the nearest <InteractiveSlider> via its exported
 * context hook, following that component's own documented pattern for
 * slider children (a small colocated "use client" component that calls
 * `useSliderValue()`), just made reusable since this chart isn't specific
 * to any one page's content.
 *
 * Usage in MDX:
 *   <InteractiveSlider label="Array size" min={1} max={9} step={0.05} defaultValue={6}>
 *     <GrowthComparison linearLabel="Linear scan" logLabel="Binary search" />
 *   </InteractiveSlider>
 */

export interface GrowthComparisonProps {
  linearLabel?: string;
  logLabel?: string;
  ratioCaption?: string;
}

function formatCount(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export default function GrowthComparison({
  linearLabel = "Linear scan",
  logLabel = "Binary search",
  ratioCaption = "fewer comparisons, worst case.",
}: GrowthComparisonProps) {
  const exp = useSliderValue();
  const n = Math.max(1, Math.round(10 ** exp));
  const log = Math.max(1, Math.floor(Math.log2(n)) + 1);

  // Log-scale bar widths (both costs span many orders of magnitude) —
  // 9 is the slider's own max exponent (10^9), matching the mockup.
  const linW = Math.max(1.5, (Math.log10(n) / 9) * 100);
  const logW = Math.max(1.5, (Math.log10(log) / 9) * 100);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 rounded-xl border border-border bg-black/35 p-5">
        <span className="text-sm text-text-secondary">{linearLabel}</span>
        <div className="h-3 rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-text-secondary" style={{ width: `${linW}%` }} />
        </div>
        <span className="font-mono text-[12.5px] text-text-secondary">{formatCount(n)}</span>

        <span className="text-sm font-semibold text-text-primary">{logLabel}</span>
        <div className="h-3 rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-electric-blue shadow-[0_0_16px_rgba(212,255,58,0.5)]"
            style={{ width: `${logW}%` }}
          />
        </div>
        <span className="font-mono text-[12.5px] text-text-secondary">{formatCount(log)}</span>
      </div>

      <div className="flex flex-wrap items-baseline gap-4">
        <span className="font-heading text-6xl font-extrabold tracking-[-0.05em] text-electric-blue">
          {formatCount(n / log)}×
        </span>
        <span className="text-lg italic text-text-secondary">{ratioCaption}</span>
      </div>
      <span className="font-mono text-[10.5px] text-text-secondary">
        bars on a log scale · one comparison per nanosecond
      </span>
    </div>
  );
}
