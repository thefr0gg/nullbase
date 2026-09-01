import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** The JS event loop, following one script's execution through the call
 *  stack, microtask queue, and macrotask queue — colocated per the
 *  interactive system's authoring convention. */
export const eventLoopSteps: StepFlowStep[] = [
  {
    actor: "مكدس الاستدعاء (Call stack)",
    title: "الكود المتزامن يعمل أولاً",
    description:
      "يشغّل المحرك النص الحالي من الأعلى إلى الأسفل على مكدس الاستدعاء. لا شيء آخر — لا مؤقت، ولا دالة رد نداء لـPromise، ولا دالة رد نداء لإدخال/إخراج — يعمل حتى يفرغ هذا المكدس تماماً.",
    detail: 'console.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");\n\n// logs: 1, 4, 3, 2',
  },
  {
    actor: "Web API",
    title: "يُسلَّم العمل غير المتزامن",
    description:
      "setTimeout، وfetch، وأحداث DOM، والواجهات البرمجية غير المتزامنة المشابهة ليست جزءاً من محرك JS نفسه — استدعاؤها يسلّم العمل إلى المتصفح (أو ربطات C++ في Node)، والذي يقوم بالانتظار الفعلي خارج مكدس الاستدعاء.",
  },
  {
    actor: "طابور المهام الصغرى (Microtask queue)",
    title: "دوال رد نداء الـPromise تُضاف كمهام صغرى",
    description:
      "عندما تُسوَّى Promise، لا تعمل دوال رد نداء .then/.catch/.finally الخاصة بها فوراً — بل تُضاف إلى الطابور كمهام صغرى. async/await مبنية على الـPromises، لذا استمرارية await هي أيضاً مهمة صغرى.",
  },
  {
    actor: "طابور دوال رد النداء (Callback queue)",
    title: "المؤقتات والإدخال/الإخراج تُضاف كمهام كبرى",
    description:
      "عندما ينقضي تأخير setTimeout، أو يكتمل إدخال/إخراج، تُضاف دالة رد نداءه إلى الطابور كمهمة كبرى (تُسمى أيضاً \"task\") — طابور منفصل، أقل أولوية من المهام الصغرى.",
  },
  {
    actor: "حلقة الأحداث",
    title: "أفرغ كل المهام الصغرى، ثم مهمة كبرى واحدة",
    description:
      "بمجرد أن يفرغ مكدس الاستدعاء، تشغّل حلقة الأحداث *كل* مهمة صغرى في الطابور — بما في ذلك مهام جديدة تضيفها مهمة صغرى نفسها — حتى يفرغ ذلك الطابور تماماً. عندها فقط تأخذ مهمة كبرى واحدة من طابور دوال رد النداء وتشغّلها.",
  },
  {
    actor: "حلقة الأحداث",
    title: "كرّر",
    description:
      "بعد انتهاء تلك المهمة الكبرى الواحدة، تفرّغ الحلقة طابور المهام الصغرى مجدداً (فارغ الآن، ما لم تكن تلك المهمة الكبرى قد أضافت مهاماً صغرى جديدة)، ثم تأخذ المهمة الكبرى التالية — إلى الأبد، طوال عمر الصفحة. هذا ما يفسر أن دالة رد نداء Promise تمت تسويته تعمل دائماً قبل setTimeout بتأخير 0 مللي ثانية، رغم أن كليهما كان \"جاهزاً\" في نفس اللحظة.",
  },
];
