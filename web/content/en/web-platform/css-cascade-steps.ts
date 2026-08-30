import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** How a browser resolves two conflicting rules targeting the same element
 *  and property — colocated per the interactive system's authoring
 *  convention. */
export const cascadeResolutionSteps: StepFlowStep[] = [
  {
    title: "Collect every matching rule",
    description:
      "The browser finds every CSS rule anywhere (stylesheet, <style> tag, inline style attribute) whose selector matches this element, for the property in question.",
    detail: "p { color: blue; }\n.notice { color: orange; }\n#alert { color: red; }",
  },
  {
    title: "Check importance and origin",
    description:
      "A declaration marked !important beats a normal one from the same origin. Beyond that, origin order matters: user-agent (browser default) styles lose to author (your CSS) styles, which lose to author !important, which loses to user !important styles.",
    detail: "p { color: blue !important; } /* wins over any non-!important rule below */",
  },
  {
    title: "Compare specificity",
    description:
      "Among rules of the same importance/origin, the browser scores each selector's specificity: inline styles beat IDs, IDs beat classes/attributes/pseudo-classes, classes beat element selectors. The highest-specificity rule wins.",
    detail: "#alert          -> 1 ID               (highest)\n.notice          -> 1 class\np                -> 1 element         (lowest)",
  },
  {
    title: "Break ties by source order",
    description:
      "If two rules have identical specificity, the one that appears later in the source (or later in a later-loaded stylesheet) wins — this is the actual \"cascade\" the name refers to.",
    detail: ".notice { color: orange; }\n.notice { color: green; } /* wins — same specificity, comes later */",
  },
  {
    title: "Apply the winning value",
    description:
      "Whichever single declaration survives all four steps is what the element actually renders with — every other matching rule for that property is simply discarded, not blended or averaged.",
  },
];
