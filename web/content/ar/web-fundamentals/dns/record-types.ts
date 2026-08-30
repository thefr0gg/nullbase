import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const dnsRecordItems: ItemExplorerItem[] = [
  {
    id: "a",
    label: "A",
    color: "blue",
    detail: "يربط اسم مضيف بعنوان IPv4. أكثر أنواع السجلات شيوعاً — example.com -> 93.184.216.34.",
  },
  {
    id: "aaaa",
    label: "AAAA",
    color: "blue",
    detail: "مثل A، لكن لعنوان IPv6 — example.com -> 2606:2800:220:1:248:1893:25c8:1946.",
  },
  {
    id: "cname",
    label: "CNAME",
    color: "purple",
    detail: "اسم بديل — يوجّه اسم مضيف إلى اسم مضيف آخر بدلاً من عنوان IP مباشرة. www.example.com -> example.com.",
  },
  {
    id: "mx",
    label: "MX",
    color: "orange",
    detail: "أين يجب تسليم بريد هذا النطاق، مع رقم أولوية. تُجرَّب الأولوية الأدنى أولاً.",
  },
  {
    id: "txt",
    label: "TXT",
    color: "default",
    detail: "نص عشوائي — يُستخدم عادةً للتحقق من ملكية النطاق (مثل Google Search Console) وسجلات مكافحة البريد المزعج للبريد الإلكتروني (SPF وDKIM وDMARC).",
  },
  {
    id: "ns",
    label: "NS",
    color: "green",
    detail: "يفوّض نطاقاً (أو نطاقاً فرعياً) إلى مجموعة من الخوادم المرجعية — وهذا ما يعيده خادم نطاق من المستوى الأعلى أثناء الحل.",
  },
];
