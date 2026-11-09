"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./types";

/**
 * `<StepFlow>`, `<RequestPlayground>`, and `<SimulatedTag>` all render
 * inside MDX body content (via the interactive-component registry), which
 * has no access to the page's `Dictionary` — MDX files aren't passed props
 * by the server component that renders them (see `ContentRenderer` in
 * `app/[locale]/[...slug]/page.tsx`). A context provider set once around
 * `<MDX />` is the standard Next.js App Router pattern for handing a Client
 * Component tree data computed on the server without threading it through
 * every MDX invocation by hand.
 */
export interface InteractiveDict {
  stepFlow: Dictionary["stepFlow"];
  requestPlayground: Dictionary["requestPlayground"];
  simulated: string;
  diagramExplorer: Dictionary["diagramExplorer"];
  stateMachine: Dictionary["stateMachine"];
  codePlayground: Dictionary["codePlayground"];
  exercise: Dictionary["exercise"];
  predictOutput: Dictionary["predictOutput"];
  terminal: Dictionary["terminal"];
  underTheHood: Dictionary["underTheHood"];
  glossary: Dictionary["glossary"];
}

const DEFAULT_DICT: InteractiveDict = {
  stepFlow: {
    previous: "Previous",
    next: "Next",
    play: "Play",
    pause: "Pause",
    stepOf: "Step {current} of {total}",
    defaultTitle: "Step-by-step",
    stepsAriaLabel: "Steps",
    stepAriaLabel: "Step {n}: {title}",
  },
  requestPlayground: {
    targetLabelEndpoint: "Endpoint",
    targetLabelWebhook: "Webhook URL",
    targetLabelDefault: "Target",
    targetLabelRpc: "Method",
    defaultTitleHttp: "Request line",
    defaultTitleProtocol: "{protocol} request",
    send: "Send request",
    sending: "Sending…",
    headersLabel: "Headers",
    headersPlaceholder: "Headers — one per line as `Name: value`",
    queryLabel: "Query",
    bodyLabel: "Body",
    bodyPlaceholderGraphql: "GraphQL query",
    bodyPlaceholderRpc: "Params (JSON)",
    bodyPlaceholderDefault: "Request body",
    variablesLabel: "Variables (JSON)",
    paramsLabel: "Params (JSON)",
    responseLabel: "Response",
    tabBody: "Body",
    tabHeaders: "Headers ({count})",
    copy: "Copy",
    copied: "Copied",
    copyCurl: "Copy as cURL",
    emptyBody: "(empty body)",
    noHeaders: "No headers.",
    wsDefaultTitle: "WebSocket connection",
    wsConnecting: "Connecting…",
    wsReconnect: "Reconnect",
    wsConnect: "Connect",
    sent: "Sent",
    received: "Received",
    sseDefaultTitle: "Event stream",
    sseConnecting: "Connecting…",
    sseReconnect: "Reconnect",
    sseConnect: "Connect",
    sseWaiting: "Waiting for events…",
  },
  simulated: "Simulated",
  diagramExplorer: {
    defaultTitle: "Diagram",
    closeDetail: "Close",
  },
  stateMachine: {
    defaultTitle: "State machine",
    currentStateLabel: "Current state",
    reset: "Reset",
    step: "Step",
    transitionAriaLabel: "Transition from {from} to {to}",
  },
  codePlayground: {
    run: "Run",
    running: "Running…",
    reset: "Reset",
    copy: "Copy",
    copied: "Copied",
    outputLabel: "Output",
    errorLabel: "Error",
    languageLabel: "Language",
    comingSoon: "Coming soon",
    loadingSandbox: "Starting sandbox…",
    timeoutError: "Execution took too long and was stopped.",
    emptyOutput: "(no output)",
  },
  exercise: {
    submit: "Check answer",
    retry: "Try again",
    showAnswer: "Show answer",
    correct: "Correct!",
    incorrect: "Not quite.",
    yourOrderLabel: "Your answer",
    correctOrderLabel: "Correct order",
    bankLabel: "Available pieces",
    emptyAnswer: "Tap or drag pieces below to build the code.",
  },
  predictOutput: {
    defaultTitle: "Predict the output",
    submit: "Check answer",
    retry: "Try again",
    correct: "Correct!",
    incorrect: "Not quite.",
    actualOutputLabel: "Actual output",
    explanationLabel: "Why",
  },
  terminal: {
    inputAriaLabel: "Terminal input",
    reset: "Reset",
    hint: "Hint",
    commandNotFound: "command not found",
    exerciseComplete: "Done — you ran the expected command.",
  },
  underTheHood: {
    showMore: "Show me what actually happens",
    showLess: "Hide the details",
  },
  glossary: {
    learnMore: "Learn more",
    closeDefinition: "Close",
  },
};

const InteractiveDictContext = createContext<InteractiveDict>(DEFAULT_DICT);

export const InteractiveDictProvider = InteractiveDictContext.Provider;

export function useInteractiveDict(): InteractiveDict {
  return useContext(InteractiveDictContext);
}
