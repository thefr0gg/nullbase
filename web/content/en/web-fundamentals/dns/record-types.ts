import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const dnsRecordItems: ItemExplorerItem[] = [
  {
    id: "a",
    label: "A",
    color: "blue",
    detail: "Maps a hostname to an IPv4 address. The most common record type — example.com -> 93.184.216.34.",
  },
  {
    id: "aaaa",
    label: "AAAA",
    color: "blue",
    detail: "Same as A, but for IPv6 — example.com -> 2606:2800:220:1:248:1893:25c8:1946.",
  },
  {
    id: "cname",
    label: "CNAME",
    color: "purple",
    detail: "An alias — points one hostname at another hostname instead of an IP directly. www.example.com -> example.com.",
  },
  {
    id: "mx",
    label: "MX",
    color: "orange",
    detail: "Where mail for this domain should be delivered, with a priority number. Lower priority is tried first.",
  },
  {
    id: "txt",
    label: "TXT",
    color: "default",
    detail: "Arbitrary text — commonly used for domain ownership verification (e.g. Google Search Console) and email anti-spam records (SPF, DKIM, DMARC).",
  },
  {
    id: "ns",
    label: "NS",
    color: "green",
    detail: "Delegates a domain (or subdomain) to a set of authoritative nameservers — this is what a TLD server hands back during resolution.",
  },
];
