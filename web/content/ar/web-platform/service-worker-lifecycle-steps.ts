import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A service worker's install -> activate -> fetch -> update lifecycle —
 *  colocated per the interactive system's authoring convention. */
export const serviceWorkerLifecycleSteps: StepFlowStep[] = [
  {
    actor: "الصفحة",
    title: "التسجيل",
    description:
      "تسجّل JavaScript الخاصة بالصفحة نصاً منفصلاً كعامل خدمتها. يحمّله المتصفح ويبدأ بتثبيته في الخلفية — الصفحة التي سجّلته تستمر بالعمل دون تأثر.",
    detail: "navigator.serviceWorker.register(\"/sw.js\");",
  },
  {
    actor: "عامل الخدمة",
    title: "التثبيت",
    description:
      "يُطلَق حدث install مرة واحدة. هذا عادة حيث يخزّن عامل الخدمة مؤقتاً مسبقاً الأصول التي يريدها متاحة دون اتصال، باستخدام واجهة Cache API.",
    detail: 'self.addEventListener("install", (e) => {\n  e.waitUntil(caches.open("v1").then((c) => c.addAll(["/", "/app.js", "/app.css"])));\n});',
  },
  {
    actor: "عامل الخدمة",
    title: "الانتظار",
    description:
      "إذا كان إصدار أقدم من عامل الخدمة يتحكم بالفعل في صفحات مفتوحة، ينتظر الإصدار الجديد هنا بدلاً من التولي فوراً — بشكل افتراضي، لا يُفعَّل إلا بعد إغلاق كل صفحة يتحكم بها الإصدار القديم، بحيث لا يشغّل المستخدم أبداً إصدارين غير متوافقين ضد نفس التبويب المفتوح.",
  },
  {
    actor: "عامل الخدمة",
    title: "التفعيل",
    description:
      "بمجرد ألا يستخدم شيء الإصدار القديم، يُطلَق activate — مكان جيد لتنظيف ذواكر التخزين المؤقت من إصدار سابق لم تعد هناك حاجة إليها.",
    detail: 'self.addEventListener("activate", (e) => {\n  e.waitUntil(caches.delete("v0")); // drop the old cache\n});',
  },
  {
    actor: "عامل الخدمة",
    title: "اعتراض الطلبات",
    description:
      "من الآن فصاعداً، يتوسط عامل الخدمة بين الصفحة والشبكة — كل طلب تجريه الصفحة يطلق حدث fetch يمكن للعامل اعتراضه، والرد عليه من ذاكرة التخزين المؤقت، أو من الشبكة، أو مزيج من الاثنين (مثل الأولوية للتخزين المؤقت، مع الرجوع إلى الشبكة).",
    detail: 'self.addEventListener("fetch", (e) => {\n  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));\n});',
  },
  {
    actor: "المتصفح",
    title: "التحقق من التحديثات",
    description:
      "يعيد المتصفح جلب نص عامل الخدمة دورياً ويقارنه بالإصدار المثبَّت بايتاً ببايت. تُعامَل أي بايت واحد متغيّر كإصدار جديد، مما يعيد تشغيل دورة الحياة هذه بأكملها للنص الجديد — وهذا ما يفسر أن إصداراً قديماً مخزَّناً مؤقتاً قد يبدو \"عالقاً\" حتى تُغلَق كل تبويبة قديمة.",
  },
];
