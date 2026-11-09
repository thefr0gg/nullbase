import dynamic from "next/dynamic";
import { LegacyHttpRequest, LegacyStatusCodeExplorer } from "./legacy";
import { PlaygroundShell } from "./_shared";

/**
 * The single place every interactive primitive is registered for MDX.
 * `web/mdx-components.tsx` imports only this object — adding a new TOPIC
 * page never touches this file (it composes an existing primitive with
 * data); only adding a genuinely new PRIMITIVE type does, which should stay
 * rare (single digits over the site's life, not one per topic).
 *
 * Every primitive is wrapped in `next/dynamic` so a content page that never
 * uses, say, `InteractiveTerminal` or `CodePlayground` never ships that
 * component's JS — each becomes its own chunk, fetched only on pages that
 * actually render the tag. A `dynamic()` result is still a valid JSX tag,
 * so this changes nothing about how `.mdx` files author these components.
 *
 * `HttpRequest`/`StatusCodeExplorer` are kept as legacy MDX tag names so the
 * existing HTTP content files work unedited after RequestPlayground/
 * ItemExplorer replaced their bespoke originals.
 */

function loading() {
  return <PlaygroundShell className="h-40 animate-pulse" />;
}

function lazy<T>(load: () => Promise<{ default: T }>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- next/dynamic's generic can't express "any component shape" more precisely than this
  return dynamic(load as any, { loading }) as T;
}

export const interactiveComponents = {
  StepFlow: lazy(() => import("./StepFlow")),
  RequestPlayground: lazy(() => import("./RequestPlayground")),
  ItemExplorer: lazy(() => import("./ItemExplorer")),
  MermaidDiagram: lazy(() => import("./MermaidDiagram")),
  UrlAnatomy: lazy(() => import("./UrlAnatomy")),
  Codec: lazy(() => import("./Codec")),
  SqlPlayground: lazy(() => import("./SqlPlayground")),
  DiagramExplorer: lazy(() => import("./DiagramExplorer")),
  StateMachine: lazy(() => import("./StateMachine")),
  CodePlayground: lazy(() => import("./CodePlayground")),
  ExerciseTabs: lazy(() => import("./ExerciseTabs")),
  OrderingExercise: lazy(() => import("./OrderingExercise")),
  PredictOutput: lazy(() => import("./PredictOutput")),
  InteractiveTerminal: lazy(() => import("./InteractiveTerminal")),
  UnderTheHood: lazy(() => import("./UnderTheHood")),
  InteractiveSlider: lazy(() => import("./InteractiveSlider")),
  GlossaryTerm: lazy(() => import("./GlossaryTerm")),
  GrowthComparison: lazy(() => import("./GrowthComparison")),
  DiffViewer: lazy(() => import("./DiffViewer")),

  // Legacy aliases — do not remove without migrating web/content/http/**.
  HttpRequest: LegacyHttpRequest,
  StatusCodeExplorer: LegacyStatusCodeExplorer,
};
