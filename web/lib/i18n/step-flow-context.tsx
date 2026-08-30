"use client";

import { createContext, useContext } from "react";

/**
 * `<StepFlow>` is invoked directly from `.mdx` body content (via the
 * interactive-component registry), which has no access to the page's
 * `Dictionary` — MDX files aren't passed props by the server component that
 * renders them (see `ContentRenderer` in `app/[locale]/[...slug]/page.tsx`).
 * A context provider set once around `<MDX />` is the standard Next.js App
 * Router pattern for handing a Client Component tree data computed on the
 * server without threading it through every MDX invocation by hand.
 */
export interface StepFlowLabels {
  previous: string;
  next: string;
}

const DEFAULT_LABELS: StepFlowLabels = { previous: "Previous", next: "Next" };

const StepFlowLabelsContext = createContext<StepFlowLabels>(DEFAULT_LABELS);

export const StepFlowLabelsProvider = StepFlowLabelsContext.Provider;

export function useStepFlowLabels(): StepFlowLabels {
  return useContext(StepFlowLabelsContext);
}
