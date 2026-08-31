import type { StateMachineState, StateMachineTransition } from "@/components/interactive/StateMachine";

export const httpLifecycleStates: StateMachineState[] = [
  { id: "idle", label: "خامل", color: "default", detail: "لا يوجد طلب قيد التنفيذ. هذه نقطة بداية العميل، وإليها يعود بعد دورة كاملة." },
  { id: "sending", label: "الإرسال", color: "blue", detail: "كتب العميل سطر الطلب والترويسات، وهو الآن يرسلها عبر اتصال مفتوح." },
  { id: "awaiting", label: "انتظار الاستجابة", color: "orange", detail: "أُرسل الطلب بالكامل؛ ينتظر العميل الآن سطر الحالة والترويسات والنص الأساسي من الخادم." },
  { id: "receiving", label: "الاستقبال", color: "purple", detail: "بدأت الاستجابة بالوصول — بالنسبة لنص مُجزَّأ أو متدفّق، يمكن أن تستمر هذه الحالة لفترة." },
  { id: "done", label: "منتهٍ", color: "green", detail: "استُلمت الاستجابة الكاملة وسُلِّمت إلى كود التطبيق." },
];

export const httpLifecycleTransitions: StateMachineTransition[] = [
  { from: "idle", to: "sending", label: "client.send()", detail: "يبدأ كود التطبيق طلبًا." },
  { from: "sending", to: "awaiting", label: "اكتمل كتابة الطلب", detail: "غادر العميل كل بايت من الترويسات والنص الأساسي." },
  { from: "awaiting", to: "receiving", label: "استُلم سطر الحالة", detail: "وصلت أولى بايتات استجابة الخادم." },
  { from: "receiving", to: "done", label: "اكتمل النص الأساسي", detail: "وصل نص الاستجابة الكامل (أو قيمة Content-Length المحددة)." },
  { from: "done", to: "idle", label: "إعادة تعيين", detail: "أصبح العميل جاهزًا لإرسال طلب آخر، ربما بإعادة استخدام نفس الاتصال." },
  { from: "awaiting", to: "idle", label: "انتهاء المهلة / إلغاء", detail: "يمكن للعميل التخلي عن الانتظار دون الوصول أبدًا إلى حالة \"الاستقبال\"." },
];
