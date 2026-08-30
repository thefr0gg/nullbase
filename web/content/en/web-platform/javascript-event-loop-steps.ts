import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** The JS event loop, following one script's execution through the call
 *  stack, microtask queue, and macrotask queue — colocated per the
 *  interactive system's authoring convention. */
export const eventLoopSteps: StepFlowStep[] = [
  {
    actor: "Call stack",
    title: "Synchronous code runs first",
    description:
      "The engine runs the current script top to bottom on the call stack. Nothing else — no timer, no promise callback, no I/O callback — runs until this stack is completely empty.",
    detail: 'console.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");\n\n// logs: 1, 4, 3, 2',
  },
  {
    actor: "Web API",
    title: "Async work is handed off",
    description:
      "setTimeout, fetch, DOM events, and similar async APIs aren't part of the JS engine itself — calling them hands the work off to the browser (or Node's C++ bindings), which does the actual waiting outside the call stack.",
  },
  {
    actor: "Microtask queue",
    title: "Promise callbacks queue as microtasks",
    description:
      "When a Promise resolves, its .then/.catch/.finally callbacks don't run immediately — they're queued as microtasks. async/await is built on Promises, so an await continuation is a microtask too.",
  },
  {
    actor: "Callback queue",
    title: "Timers and I/O queue as macrotasks",
    description:
      "When a setTimeout's delay elapses, or I/O completes, its callback is queued as a macrotask (also called a \"task\") — a separate, lower-priority queue from microtasks.",
  },
  {
    actor: "Event loop",
    title: "Drain all microtasks, then one macrotask",
    description:
      "Once the call stack is empty, the event loop runs *every* microtask in the queue — including new ones a microtask itself queues — until that queue is completely empty. Only then does it take a single macrotask off the callback queue and run it.",
  },
  {
    actor: "Event loop",
    title: "Repeat",
    description:
      "After that one macrotask finishes, the loop drains the microtask queue again (empty by now, unless that macrotask queued new microtasks), then takes the next macrotask — forever, for the life of the page. This is why a resolved Promise's callback always runs before a 0ms setTimeout's, even though both were \"ready\" at the same moment.",
  },
];
