import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const dnsRecordItems: ItemExplorerItem[] = [
  {
    id: "a",
    label: "A",
    color: "blue",
    detail: "Asocia un nombre de host a una dirección IPv4. El tipo de registro más común — example.com -> 93.184.216.34.",
  },
  {
    id: "aaaa",
    label: "AAAA",
    color: "blue",
    detail: "Igual que A, pero para IPv6 — example.com -> 2606:2800:220:1:248:1893:25c8:1946.",
  },
  {
    id: "cname",
    label: "CNAME",
    color: "purple",
    detail: "Un alias — apunta un nombre de host a otro nombre de host en lugar de directamente a una IP. www.example.com -> example.com.",
  },
  {
    id: "mx",
    label: "MX",
    color: "orange",
    detail: "Dónde debe entregarse el correo de este dominio, con un número de prioridad. Se prueba primero la prioridad más baja.",
  },
  {
    id: "txt",
    label: "TXT",
    color: "default",
    detail: "Texto arbitrario — comúnmente usado para la verificación de propiedad del dominio (por ejemplo, Google Search Console) y registros antispam de correo (SPF, DKIM, DMARC).",
  },
  {
    id: "ns",
    label: "NS",
    color: "green",
    detail: "Delega un dominio (o subdominio) a un conjunto de servidores de nombres autoritativos — esto es lo que devuelve un servidor TLD durante la resolución.",
  },
];
