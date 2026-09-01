import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** How a single click event travels through the DOM tree — colocated per
 *  the interactive system's authoring convention. */
export const eventPropagationSteps: StepFlowStep[] = [
  {
    actor: "المتصفح",
    title: "المستخدم ينقر",
    description:
      "ينزل النقر على العنصر الأعمق تحت المؤشر — لنقل <button> متداخل داخل <form> متداخل داخل <div>. يصبح هذا العنصر هدف الحدث، ويبقى الهدف طوال الرحلة أدناه.",
    detail: "<div id=\"outer\">\n  <form id=\"form\">\n    <button id=\"btn\">Submit</button>\n  </form>\n</div>",
  },
  {
    actor: "مرحلة الالتقاط (Capturing)",
    title: "من الأعلى إلى الأسفل، من الجذر إلى الهدف",
    description:
      "ينتقل الحدث أولاً إلى الأسفل من جذر المستند عبر كل سلف للهدف — div -> form -> button — مستدعياً أي مستمع مسجَّل بـ{ capture: true } على طول الطريق. لا يكاد شيء يستخدم هذه المرحلة عملياً؛ توجد أساساً لتتيح لعنصر أب اعتراض حدث قبل أن تحصل عليه عنصر فرعي.",
    detail: "window -> document -> div#outer -> form#form -> button#btn",
  },
  {
    actor: "مرحلة الهدف",
    title: "الحدث يصل إلى الهدف",
    description:
      "المستمعون المسجَّلون مباشرة على button#btn نفسه يعملون الآن — هذه هي المرحلة التي يستمع إليها فعلياً كل استدعاء addEventListener تقريباً في الكود العادي.",
  },
  {
    actor: "مرحلة الفقاعة (Bubbling)",
    title: "من الأسفل إلى الأعلى، عائداً إلى الجذر",
    description:
      "ثم ينتقل الحدث إلى الأعلى عبر نفس الأسلاف بترتيب معكوس — button -> form -> div — مستدعياً أي مستمع مسجَّل بدون { capture: true } (الافتراضي). هذا ما يجعل تفويض الأحداث ممكناً: مستمع واحد على div#outer يمكنه التعامل مع نقرات على أي زر بداخله، موجود الآن أو يُضاف لاحقاً، بالتحقق من event.target.",
    detail: "button#btn -> form#form -> div#outer -> document -> window",
  },
  {
    actor: "أي مستمع",
    title: "إيقافه مبكراً",
    description:
      "يمكن لأي مستمع في أي نقطة استدعاء event.stopPropagation() لمنع الحدث من الاستمرار إلى السلف التالي — أو event.preventDefault() لإلغاء الإجراء الافتراضي للمتصفح للحدث (مثل إرسال نموذج فعلياً)، وهذا شيء منفصل تماماً عن إيقاف الانتشار.",
  },
];
