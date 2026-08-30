import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A web worker's spawn -> postMessage exchange -> terminate lifecycle —
 *  colocated per the interactive system's authoring convention. */
export const webWorkerLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Main thread",
    title: "Spawn the worker",
    description:
      "The main thread creates a Worker, pointing it at a separate JavaScript file. The browser starts that file running on its own OS-level thread, in parallel with the main thread — not queued on it.",
    detail: 'const worker = new Worker("crunch-numbers.js");',
  },
  {
    actor: "Main thread",
    title: "Send data in",
    description:
      "The only way to communicate with a worker is postMessage — there's no shared memory or direct function calls. Data passed this way is copied (structured-cloned) by default, not shared, so mutating it on one side never affects the other.",
    detail: 'worker.postMessage({ numbers: [1, 2, 3, /* ...100000 more */] });',
  },
  {
    actor: "Worker",
    title: "Receive and compute",
    description:
      "The worker's own script listens for the message event and does the actual work — however long it takes, the main thread's UI stays responsive the whole time, since this is running on a different thread entirely.",
    detail: 'self.onmessage = (e) => {\n  const result = e.data.numbers.reduce((a, b) => a + b);\n  self.postMessage({ result });\n};',
  },
  {
    actor: "Main thread",
    title: "Receive the result",
    description:
      "The main thread's own message event fires with whatever the worker posted back — this is the entire round trip: no shared state, just messages copied across a boundary in both directions.",
    detail: 'worker.onmessage = (e) => console.log(e.data.result);',
  },
  {
    actor: "Main thread",
    title: "Terminate when done",
    description:
      "A worker keeps running (and consuming a thread) until explicitly stopped — either the worker calls self.close(), or the main thread calls worker.terminate(). Forgetting this is a real resource leak in long-running apps that spawn workers repeatedly.",
    detail: "worker.terminate();",
  },
];
