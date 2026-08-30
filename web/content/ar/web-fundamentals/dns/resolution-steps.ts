import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const resolutionSteps: StepFlowStep[] = [
  {
    actor: "المتصفح",
    title: "التحقق من الـ Cache المحلي",
    description:
      "قبل سؤال أي جهة أخرى، يتحقق المتصفح من الـ Cache الخاص به لـ DNS (وCache نظام التشغيل تحته). لا شيء موجود في الـ Cache بعد في زيارة أولى، لذا يجب أن يخرج البحث إلى الشبكة.",
  },
  {
    actor: "Recursive Resolver",
    title: "سؤال الـ Recursive Resolver",
    description:
      "يسلّم نظام التشغيل السؤال إلى Recursive Resolver — عادةً resolver مزوّد خدمة الإنترنت أو resolver عام مثل 1.1.1.1 أو 8.8.8.8. مهمة هذا الـ Resolver هي القيام بكل العمل المتبقي وإعادة إجابة نهائية واحدة.",
    detail: "الاستعلام: www.example.com A?\nإلى: 1.1.1.1 (Recursive Resolver)",
  },
  {
    actor: "Root Server",
    title: "استعلام Root Server",
    description:
      "لا يعرف الـ Resolver بعد أين يقيم example.com، لذا يسأل واحداً من عناقيد الـ Root Servers الثلاثة عشر. لا يعرف الـ Root Server الإجابة أيضاً — لكنه يعرف من يتولى نطاق .com.",
    detail: "الاستعلام: www.example.com A?\nيرد الـ Root: \"اسأل TLD Server لـ .com\"",
  },
  {
    actor: "TLD Server",
    title: "استعلام TLD Server لنطاق .com",
    description:
      "يتبع الـ Resolver الإحالة إلى TLD Server مسؤول عن .com. لا يزال لا يملك عنوان IP — لكنه يعرف الخوادم المرجعية (Authoritative) لنطاق example.com تحديداً.",
    detail: "الاستعلام: www.example.com A?\nيرد الـ TLD Server: \"اسأل ns1.example.com\"",
  },
  {
    actor: "Authoritative Server",
    title: "استعلام الـ Authoritative Server",
    description:
      "هذا هو الخادم الذي يشغّله مزوّد DNS الخاص بـ example.com نفسه — مصدر الحقيقة الفعلي لسجلاته. لديه الإجابة الحقيقية.",
    detail: "الاستعلام: www.example.com A?\nالإجابة: 93.184.216.34",
  },
  {
    actor: "Recursive Resolver",
    title: "حفظ الإجابة في الـ Cache وإعادتها",
    description:
      "يحفظ الـ Recursive Resolver النتيجة في الـ Cache لمدة TTL الخاصة بالسجل (بحيث يتخطى البحث التالي مباشرة إلى هذه الخطوة) ويسلّم أخيراً عنوان IP إلى المتصفح، الذي يمكنه الآن فتح اتصال.",
    detail: "www.example.com -> 93.184.216.34 (في الـ Cache)",
  },
];
