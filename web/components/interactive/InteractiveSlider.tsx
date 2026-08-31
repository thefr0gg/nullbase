"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { EyebrowLabel, PlaygroundSection, PlaygroundShell } from "./_shared";

/**
 * A generic slider whose current value is handed to `children` through
 * context rather than a render-prop function — MDX content renders as a
 * Server Component, and a plain JS function (a render-prop, a `formatValue`
 * callback) can't cross the server/client boundary as a prop to a Client
 * Component like this one. A `<child />` element instance can, though, so
 * the pattern is: write one small `"use client"` component that calls
 * `useSliderValue()`, colocate it next to the `.mdx` page like any other
 * data file, and pass an instance of it as `children`:
 *
 *   // window-size-visual.tsx
 *   "use client";
 *   import { useSliderValue } from "@/components/interactive/InteractiveSlider";
 *   export default function WindowSizeVisual() {
 *     const value = useSliderValue();
 *     return <p>{value} KB in flight...</p>;
 *   }
 *
 *   // some-page.mdx
 *   import WindowSizeVisual from "./window-size-visual";
 *   <InteractiveSlider label="Window size" min={1} max={64} defaultValue={16}>
 *     <WindowSizeVisual />
 *   </InteractiveSlider>
 */
const SliderValueContext = createContext<number>(0);

export function useSliderValue(): number {
  return useContext(SliderValueContext);
}

export interface InteractiveSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  children: ReactNode;
}

export default function InteractiveSlider({ label, min, max, step = 1, defaultValue, children }: InteractiveSliderProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <PlaygroundShell>
      <PlaygroundSection tone="muted" divider="bottom" className="flex items-center justify-between gap-2">
        <EyebrowLabel as="span" className="mb-0">
          {label}
        </EyebrowLabel>
        <span className="font-mono text-sm font-semibold text-text-primary">{value}</span>
      </PlaygroundSection>
      <PlaygroundSection>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label={label}
          className="w-full accent-electric-blue"
        />
        <div className="mt-4">
          <SliderValueContext.Provider value={value}>{children}</SliderValueContext.Provider>
        </div>
      </PlaygroundSection>
    </PlaygroundShell>
  );
}
