import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** How a browser resolves two conflicting rules targeting the same element
 *  and property — colocated per the interactive system's authoring
 *  convention. */
export const cascadeResolutionSteps: StepFlowStep[] = [
  {
    title: "اجمع كل قاعدة مطابقة",
    description:
      "يجد المتصفح كل قاعدة CSS في أي مكان (ورقة أنماط، وسم <style>، سمة style مضمّنة) يطابق محددها هذا العنصر، بالنسبة للخاصية المعنية.",
    detail: "p { color: blue; }\n.notice { color: orange; }\n#alert { color: red; }",
  },
  {
    title: "تحقق من الأهمية والأصل",
    description:
      "التصريح المعلَّم بـ!important يتفوق على تصريح عادي من نفس الأصل. وبعد ذلك، يهم ترتيب الأصل: أنماط وكيل المستخدم (user-agent، افتراضيات المتصفح) تخسر أمام أنماط المؤلف (CSS الخاص بك)، التي تخسر أمام !important الخاص بالمؤلف، الذي يخسر أمام !important الخاص بالمستخدم.",
    detail: "p { color: blue !important; } /* wins over any non-!important rule below */",
  },
  {
    title: "قارن الخصوصية",
    description:
      "بين القواعد ذات الأهمية/الأصل نفسه، يحسب المتصفح خصوصية كل محدد: الأنماط المضمّنة تتفوق على المعرّفات، والمعرّفات تتفوق على الأصناف/السمات/الأصناف الزائفة، والأصناف تتفوق على محددات العناصر. القاعدة ذات الخصوصية الأعلى تفوز.",
    detail: "#alert          -> 1 ID               (highest)\n.notice          -> 1 class\np                -> 1 element         (lowest)",
  },
  {
    title: "افصل التعادل بترتيب المصدر",
    description:
      "إن كان لقاعدتين نفس الخصوصية تماماً، تفوز القاعدة التي تظهر لاحقاً في المصدر (أو لاحقاً في ورقة أنماط محمَّلة لاحقاً) — هذا هو \"التتالي\" الفعلي الذي يشير إليه الاسم.",
    detail: ".notice { color: orange; }\n.notice { color: green; } /* wins — same specificity, comes later */",
  },
  {
    title: "طبّق القيمة الفائزة",
    description:
      "أياً كان التصريح الوحيد الذي ينجو من كل الخطوات الأربع فهو ما يُعرَض به العنصر فعلياً — تُهمَل ببساطة كل قاعدة أخرى مطابقة لتلك الخاصية، لا تُمزَج ولا يُحسَب متوسطها.",
  },
];
