import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const cacheFlowSteps: StepFlowStep[] = [
  {
    actor: "العميل",
    title: "الطلب يصل إلى أقرب Edge",
    description:
      "يترجم DNS اسم مضيف شبكة CDN إلى أي خادم Edge هو الأقرب جغرافياً (أو من ناحية طوبولوجيا الشبكة) إلى العميل — وليس إلى الـ Origin Server، الذي قد يكون في الجهة الأخرى من الكوكب.",
  },
  {
    actor: "خادم Edge",
    title: "Cache Miss",
    description:
      "أول طلب لهذا الأصل في موقع الـ Edge هذا: لا شيء موجود في الـ Cache بعد. يجب على خادم الـ Edge أن يذهب لجلبه من مكان يملكه فعلياً.",
    detail: "Cache-Status: MISS",
  },
  {
    actor: "خادم Edge",
    title: "الجلب من الـ Origin",
    description:
      "يطلب خادم الـ Edge الأصل من الـ Origin Server (خادمك الخلفي الفعلي)، تماماً كما يفعل عميل عادي.",
  },
  {
    actor: "خادم Edge",
    title: "الحفظ في الـ Cache والتقديم",
    description:
      "يخزّن خادم الـ Edge نسخة محلياً — ومدة الحفظ يتحكم بها Cache-Control/TTL — ثم يعيدها إلى العميل. هذا الطلب الأول تحمّل التكلفة الكاملة للرحلة ذهاباً وإياباً إلى الـ Origin.",
    detail: "Cache-Control: max-age=3600",
  },
  {
    actor: "خادم Edge",
    title: "Cache Hit (كل طلب بعد ذلك)",
    description:
      "كل طلب لاحق لنفس الأصل في موقع الـ Edge هذا، سواء من هذا العميل أو أي عميل آخر، يُخدَّم مباشرة من الـ Cache — بلا أي رحلة إلى الـ Origin، إلى أن تنتهي صلاحية TTL.",
    detail: "Cache-Status: HIT",
  },
];
