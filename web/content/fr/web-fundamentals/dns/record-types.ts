import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const dnsRecordItems: ItemExplorerItem[] = [
  {
    id: "a",
    label: "A",
    color: "blue",
    detail: "Associe un nom d'hôte à une adresse IPv4. Le type d'enregistrement le plus courant — example.com -> 93.184.216.34.",
  },
  {
    id: "aaaa",
    label: "AAAA",
    color: "blue",
    detail: "Identique à A, mais pour IPv6 — example.com -> 2606:2800:220:1:248:1893:25c8:1946.",
  },
  {
    id: "cname",
    label: "CNAME",
    color: "purple",
    detail: "Un alias — pointe un nom d'hôte vers un autre nom d'hôte plutôt que vers une IP directement. www.example.com -> example.com.",
  },
  {
    id: "mx",
    label: "MX",
    color: "orange",
    detail: "Où le courrier de ce domaine doit être livré, avec un numéro de priorité. La priorité la plus basse est essayée en premier.",
  },
  {
    id: "txt",
    label: "TXT",
    color: "default",
    detail: "Texte arbitraire — couramment utilisé pour la vérification de propriété de domaine (par ex. Google Search Console) et les enregistrements anti-spam pour le courrier électronique (SPF, DKIM, DMARC).",
  },
  {
    id: "ns",
    label: "NS",
    color: "green",
    detail: "Délègue un domaine (ou sous-domaine) à un ensemble de serveurs de noms faisant autorité — c'est ce qu'un serveur TLD renvoie pendant la résolution.",
  },
];
