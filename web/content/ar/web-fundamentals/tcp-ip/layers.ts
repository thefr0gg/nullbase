import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const tcpIpLayerItems: ItemExplorerItem[] = [
  {
    id: "application",
    label: "التطبيق",
    color: "purple",
    detail: "حيث تقيم بروتوكولاتك: HTTP وDNS وSMTP. هذه هي الطبقة الوحيدة التي يتعامل معها كود التطبيق مباشرة عادةً.",
  },
  {
    id: "transport",
    label: "النقل",
    color: "blue",
    detail: "TCP أو UDP. تضيف المنافذ (بحيث يمكن لتطبيقات متعددة مشاركة عنوان IP واحد)، وبالنسبة لـ TCP، الموثوقية — الترتيب، وإعادة الإرسال، والتحكم في التدفق.",
  },
  {
    id: "internet",
    label: "الإنترنت",
    color: "green",
    detail: "IP. تضيف العنونة والتوجيه — نقل حزمة من شبكة إلى أخرى، دون أي ضمان للتسليم أو الترتيب من تلقاء نفسها.",
  },
  {
    id: "link",
    label: "الوصلة",
    color: "orange",
    detail: "Ethernet وWi-Fi. تنقل إطاراً عبر وصلة فيزيائية أو محلية واحدة — الطبقة من نقطة إلى نقطة، وليست من طرف إلى طرف.",
  },
];
