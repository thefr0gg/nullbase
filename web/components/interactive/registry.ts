import StepFlow from "./StepFlow";
import RequestPlayground from "./RequestPlayground";
import ItemExplorer from "./ItemExplorer";
import MermaidDiagram from "./MermaidDiagram";
import UrlAnatomy from "./UrlAnatomy";
import { LegacyHttpRequest, LegacyStatusCodeExplorer } from "./legacy";

/**
 * The single place every interactive primitive is registered for MDX.
 * `web/mdx-components.tsx` imports only this object — adding a new TOPIC
 * page never touches this file (it composes an existing primitive with
 * data); only adding a genuinely new PRIMITIVE type does, which should stay
 * rare (single digits over the site's life, not one per topic).
 *
 * `HttpRequest`/`StatusCodeExplorer` are kept as legacy MDX tag names so the
 * existing HTTP content files work unedited after RequestPlayground/
 * ItemExplorer replaced their bespoke originals.
 */
export const interactiveComponents = {
  StepFlow,
  RequestPlayground,
  ItemExplorer,
  MermaidDiagram,
  UrlAnatomy,

  // Legacy aliases — do not remove without migrating web/content/http/**.
  HttpRequest: LegacyHttpRequest,
  StatusCodeExplorer: LegacyStatusCodeExplorer,
};
