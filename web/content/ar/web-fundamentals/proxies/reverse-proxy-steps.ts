import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const reverseProxySteps: StepFlowStep[] = [
  {
    actor: "العميل",
    title: "الطلب يصل إلى الـ Proxy",
    description:
      "يرسل المتصفح طلباً إلى example.com. لا يعلم شيئاً عن وجود أكثر من خادم واحد في الطرف الآخر — فقد حلّ DNS ببساطة example.com إلى عنوان IP الخاص بالـ Proxy.",
    detail: "GET /api/users HTTP/1.1\nHost: example.com",
  },
  {
    actor: "Reverse Proxy",
    title: "تحديد الوجهة",
    description:
      "يفحص الـ Proxy الطلب — عادةً المسار أو ترويسة Host فقط — ويقرر أي خادم خلفي يجب أن يتولاه فعلياً. هذه هي الطريقة التي يمكن بها لاسم مضيف عام واحد أن يوجَّه إلى خدمات خلفية عديدة مختلفة.",
    detail: "القاعدة: /api/* -> backend-api:8080\nالقاعدة: /*     -> backend-web:3000",
  },
  {
    actor: "Reverse Proxy",
    title: "التمرير إلى الخلفية",
    description:
      "يفتح الـ Proxy اتصاله الخاص بالخلفية المختارة ويمرر الطلب، مضيفاً غالباً ترويسات مثل X-Forwarded-For حتى تتمكن الخلفية من رؤية عنوان IP الأصلي للعميل.",
    detail: "GET /api/users HTTP/1.1\nHost: backend-api:8080\nX-Forwarded-For: 203.0.113.42",
  },
  {
    actor: "الخلفية",
    title: "الخلفية تستجيب",
    description:
      "يقوم الخادم الخلفي بالعمل الفعلي ويرسل استجابته — إلى الـ Proxy، وليس مباشرة إلى العميل.",
  },
  {
    actor: "Reverse Proxy",
    title: "ترحيل الاستجابة",
    description:
      "يمرر الـ Proxy الاستجابة إلى العميل. لا يُكشف أبداً عنوان IP الحقيقي للخلفية، ولا منفذها، بل حتى وجودها ذاته — بقدر ما يستطيع العميل معرفته، أجاب example.com مباشرة.",
  },
];
