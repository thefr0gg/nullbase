import type { DiagramRow } from "@/components/interactive/DiagramExplorer";

export const urlLifecycleRows: DiagramRow[] = [
  {
    nodes: [{ id: "url", label: "إدخال الرابط", color: "default", detail: "المتصفح لديه سلسلة نصية خام — لم يُفسَّر منها شيء بعد." }],
  },
  {
    connectorLabel: "تحليل",
    nodes: [{ id: "parsing", label: "تحليل الرابط", color: "blue", detail: "يقسّم المتصفح السلسلة إلى المخطط والمضيف والمنفذ والمسار والاستعلام — انظر التفصيل أعلاه لمعرفة الأحرف التي تحدّد كل جزء بالضبط." }],
  },
  {
    connectorLabel: "تحليل المضيف",
    nodes: [{ id: "dns", label: "DNS", color: "green", detail: "يُحلَّل جزء المضيف (مثل example.com) إلى عنوان IP — بالتحقق أولًا من ذاكرة التخزين المؤقت لنظام التشغيل، ثم مُحلِّل DNS، قبل الوصول إلى الشبكة أصلًا." }],
  },
  {
    connectorLabel: "الاتصال",
    nodes: [{ id: "tcp", label: "TCP", color: "purple", detail: "تُنشئ مصافحة ثلاثية اتصالًا موثوقًا ومرتبًا مع ذلك العنوان، على المنفذ المحدد في الرابط (443 لـ https، و80 لـ http)." }],
  },
  {
    connectorLabel: "https فقط",
    nodes: [{ id: "tls", label: "TLS", color: "orange", detail: "بالنسبة لـ https، تتفاوض مصافحة على التشفير وتتحقق من شهادة الخادم قبل إرسال أي بيانات HTTP." }],
  },
  {
    connectorLabel: "الطلب",
    nodes: [{ id: "http", label: "HTTP", color: "blue", detail: "يرسل المتصفح سطر طلب وترويسات مبنية من مسار الرابط واستعلامه، عبر الاتصال الآمن الآن." }],
  },
  {
    connectorLabel: "المعالجة",
    nodes: [{ id: "server", label: "الخادم", color: "green", detail: "يوجّه الخادم الطلب حسب المسار، وينفّذ منطق التطبيق، وينتج استجابة." }],
  },
  {
    connectorLabel: "الاستجابة",
    nodes: [{ id: "browser", label: "المتصفح يعرض الصفحة", color: "purple", detail: "يستلم المتصفح الاستجابة ويعرضها — قد يبقى الاتصال مفتوحًا ويُعاد استخدامه لطلبات أخرى إلى نفس المصدر." }],
  },
];
