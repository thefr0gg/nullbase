import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** How a single click event travels through the DOM tree — colocated per
 *  the interactive system's authoring convention. */
export const eventPropagationSteps: StepFlowStep[] = [
  {
    actor: "Browser",
    title: "The user clicks",
    description:
      "A click lands on the innermost element under the cursor — say, a <button> nested inside a <form> nested inside a <div>. This element becomes the event's target, and stays the target for the whole journey below.",
    detail: "<div id=\"outer\">\n  <form id=\"form\">\n    <button id=\"btn\">Submit</button>\n  </form>\n</div>",
  },
  {
    actor: "Capturing phase",
    title: "Top-down, from the root to the target",
    description:
      "The event first travels DOWN from the document root through every ancestor of the target — div -> form -> button — calling any listener registered with { capture: true } along the way. Almost nothing uses this phase in practice; it exists mainly so a parent can intercept an event before a child gets a chance to.",
    detail: "window -> document -> div#outer -> form#form -> button#btn",
  },
  {
    actor: "Target phase",
    title: "The event reaches the target",
    description:
      "Listeners registered directly on button#btn itself run now — this is the phase almost every addEventListener call in ordinary code is actually listening for.",
  },
  {
    actor: "Bubbling phase",
    title: "Bottom-up, back out to the root",
    description:
      "The event then travels back UP through the same ancestors in reverse — button -> form -> div — calling any listener registered without { capture: true } (the default). This is what makes event delegation possible: a single listener on div#outer can handle clicks on any button inside it, present now or added later, by checking event.target.",
    detail: "button#btn -> form#form -> div#outer -> document -> window",
  },
  {
    actor: "Any listener",
    title: "Stopping it early",
    description:
      "Any listener at any point can call event.stopPropagation() to prevent the event from continuing to the next ancestor — or event.preventDefault() to cancel the browser's default action for the event (like a form actually submitting), which is a separate thing from stopping propagation entirely.",
  },
];
