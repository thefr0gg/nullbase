import type { StepFlowStep } from "@/components/interactive/StepFlow";

/**
 * The resolver walk for looking up `www.example.com` the first time (no
 * caches warm anywhere) — colocated next to index.mdx per the interactive
 * system's authoring convention (nested step data lives in a sibling .ts
 * file, imported into the .mdx, rather than as an inline JSX prop).
 */
export const resolutionSteps: StepFlowStep[] = [
  {
    actor: "Browser",
    title: "Check the local cache",
    description:
      "Before asking anyone else, the browser checks its own DNS cache (and the OS cache below it). Nothing is cached yet for a first visit, so the lookup has to go out to the network.",
  },
  {
    actor: "Recursive resolver",
    title: "Ask the recursive resolver",
    description:
      "The OS hands the question to a recursive resolver — usually your ISP's or a public one like 1.1.1.1 or 8.8.8.8. This resolver's job is to do all the remaining legwork and hand back one final answer.",
    detail: "Query: www.example.com A?\nTo: 1.1.1.1 (recursive resolver)",
  },
  {
    actor: "Root server",
    title: "Query a root nameserver",
    description:
      "The resolver doesn't know where example.com lives yet, so it asks one of the 13 root server clusters. The root server doesn't know the answer either — but it knows who handles .com.",
    detail: "Query: www.example.com A?\nRoot replies: \"ask a .com TLD server\"",
  },
  {
    actor: "TLD server",
    title: "Query the .com TLD nameserver",
    description:
      "The resolver follows the referral to a Top-Level Domain server responsible for .com. It still doesn't have the IP address — but it knows which nameservers are authoritative for example.com specifically.",
    detail: "Query: www.example.com A?\nTLD replies: \"ask ns1.example.com\"",
  },
  {
    actor: "Authoritative server",
    title: "Query the authoritative nameserver",
    description:
      "This is the server example.com's own DNS provider runs — the actual source of truth for its records. It has the real answer.",
    detail: "Query: www.example.com A?\nAnswer: 93.184.216.34",
  },
  {
    actor: "Recursive resolver",
    title: "Cache and return the answer",
    description:
      "The recursive resolver caches the result for the record's TTL (so the next lookup skips straight to this step) and finally hands the IP address back to the browser, which can now open a connection.",
    detail: "www.example.com -> 93.184.216.34 (cached)",
  },
];
