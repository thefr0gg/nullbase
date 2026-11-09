import { PlaygroundShell, PlaygroundSection, EyebrowLabel } from "@/components/interactive/_shared";
import { Badge } from "./ui";

interface Props {
  dict: {
    eyebrow: string;
    live: string;
    name: string;
    description: string;
  };
}

/**
 * Static, illustrative "try it" panel for the homepage hero — looks like a
 * live HTTP-status-code widget but has no interactivity. Deliberately
 * scoped this way (see the retheme plan): a real interactive version is a
 * follow-up, and this component is the seam to swap it in later without
 * touching the rest of the hero.
 */
export function HeroDemoPanel({ dict }: Props) {
  return (
    <PlaygroundShell className="my-0 w-full max-w-md">
      <PlaygroundSection divider="bottom" className="flex items-center justify-between">
        <EyebrowLabel as="span">{dict.eyebrow}</EyebrowLabel>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-electric-blue">
          <span className="h-1.5 w-1.5 rounded-full bg-electric-blue" aria-hidden="true" />
          {dict.live}
        </span>
      </PlaygroundSection>
      <PlaygroundSection className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <span className="font-heading text-6xl font-extrabold tracking-[-0.04em] text-text-primary">
            429
          </span>
          <div className="flex flex-1 flex-wrap gap-1.5">
            {["200", "301", "404", "429", "500"].map((code) => (
              <span
                key={code}
                className={`rounded-full border border-border-strong px-2.5 py-1 font-mono text-xs ${
                  code === "429" ? "bg-electric-blue text-[#0a0a0c]" : "text-text-secondary"
                }`}
              >
                {code}
              </span>
            ))}
          </div>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-border bg-background/60 p-3.5 font-mono text-[13px] leading-6 text-text-primary">
          <span className="text-violet">HTTP/1.1 429 Too Many Requests{"\n"}</span>
          <span>Retry-After: 30</span>
        </pre>
        <div className="flex flex-col gap-1.5">
          <Badge color="blue" className="w-fit">
            4xx · Client error
          </Badge>
          <p className="text-sm leading-relaxed text-text-secondary">{dict.description}</p>
        </div>
      </PlaygroundSection>
    </PlaygroundShell>
  );
}
