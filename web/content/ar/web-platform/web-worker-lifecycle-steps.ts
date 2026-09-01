import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A web worker's spawn -> postMessage exchange -> terminate lifecycle —
 *  colocated per the interactive system's authoring convention. */
export const webWorkerLifecycleSteps: StepFlowStep[] = [
  {
    actor: "الخيط الرئيسي",
    title: "إنشاء العامل",
    description:
      "ينشئ الخيط الرئيسي Worker، موجّهاً إياه إلى ملف JavaScript منفصل. يبدأ المتصفح تشغيل ذلك الملف على خيط نظام تشغيل خاص به، بالتوازي مع الخيط الرئيسي — لا في طابور عليه.",
    detail: 'const worker = new Worker("crunch-numbers.js");',
  },
  {
    actor: "الخيط الرئيسي",
    title: "إرسال البيانات",
    description:
      "الطريقة الوحيدة للتواصل مع عامل هي postMessage — لا توجد ذاكرة مشتركة ولا استدعاءات دوال مباشرة. البيانات المُمرَّرة بهذه الطريقة تُنسَخ (باستنساخ مهيكل) بشكل افتراضي، لا تُشارَك، لذا تعديلها على أحد الجانبين لا يؤثر أبداً على الآخر.",
    detail: 'worker.postMessage({ numbers: [1, 2, 3, /* ...100000 more */] });',
  },
  {
    actor: "العامل",
    title: "الاستقبال والحساب",
    description:
      "يستمع نص العامل نفسه لحدث message ويقوم بالعمل الفعلي — مهما استغرق من وقت، تبقى واجهة مستخدم الخيط الرئيسي مستجيبة طوال الوقت، بما أن هذا يعمل على خيط مختلف تماماً.",
    detail: 'self.onmessage = (e) => {\n  const result = e.data.numbers.reduce((a, b) => a + b);\n  self.postMessage({ result });\n};',
  },
  {
    actor: "الخيط الرئيسي",
    title: "استقبال النتيجة",
    description:
      "يُطلَق حدث message الخاص بالخيط الرئيسي نفسه مع أياً كان ما أرسله العامل مرة أخرى — هذه هي الرحلة ذهاباً وإياباً بأكملها: لا حالة مشتركة، فقط رسائل تُنسَخ عبر حد فاصل في كلا الاتجاهين.",
    detail: 'worker.onmessage = (e) => console.log(e.data.result);',
  },
  {
    actor: "الخيط الرئيسي",
    title: "الإنهاء عند الانتهاء",
    description:
      "يستمر العامل بالعمل (واستهلاك خيط) حتى يُوقَف صراحة — إما يستدعي العامل self.close()، أو يستدعي الخيط الرئيسي worker.terminate(). نسيان هذا تسريب حقيقي للموارد في تطبيقات طويلة الأمد تنشئ عمّالاً بشكل متكرر.",
    detail: "worker.terminate();",
  },
];
