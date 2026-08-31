import type { GlossaryMap } from "./types";

/**
 * See `en.ts` for the rationale behind a centralized, cross-cutting term
 * map. `href` points to `/ar/...` for sections that are actually
 * translated (web-fundamentals) and falls back to `/en/...` for sections
 * that only exist in English so far (networking, security, databases).
 */
export const ar: GlossaryMap = {
  tcp: {
    term: "TCP",
    definition: "بروتوكول التحكم في الإرسال — بروتوكول نقل قائم على الاتصال، يضمن التسليم بالترتيب الصحيح.",
    href: "/en/networking/tcp",
  },
  udp: {
    term: "UDP",
    definition: "بروتوكول مخطط بيانات المستخدم — بروتوكول نقل بلا اتصال، دون ضمان للتسليم أو الترتيب، مقابل سرعة أعلى.",
    href: "/en/networking/udp",
  },
  dns: {
    term: "DNS",
    definition: "نظام أسماء النطاقات — يترجم أسماء النطاقات المقروءة للبشر إلى عناوين IP التي توجّه إليها الأجهزة فعليًا.",
    href: "/ar/web-fundamentals/dns",
  },
  tls: {
    term: "TLS",
    definition: "أمان طبقة النقل — يشفّر الاتصال ويتحقق من هوية الخادم عبر شهادة رقمية.",
    href: "/ar/web-fundamentals/tls",
  },
  http: {
    term: "HTTP",
    definition: "بروتوكول نقل النص التشعبي — بروتوكول الطلب/الاستجابة الذي تستخدمه المتصفحات وواجهات البرمجة للتواصل.",
    href: "/ar/web-fundamentals/http",
  },
  jwt: {
    term: "JWT",
    definition: "رمز JSON للويب — رمز موقّع ومكتفٍ ذاتيًا يحمل الهوية والادعاءات دون الحاجة إلى البحث عن جلسة على الخادم.",
    href: "/en/security/jwt",
  },
  oauth: {
    term: "OAuth 2.0",
    definition: "بروتوكول يمنح خدمة ما وصولًا محدودًا وقابلًا للإلغاء إلى بيانات مستخدم في خدمة أخرى، دون مشاركة كلمة المرور.",
    href: "/en/security/oauth-2-0",
  },
  sql: {
    term: "SQL",
    definition: "لغة الاستعلام البنيوية — اللغة التصريحية التي تستخدمها كل قاعدة بيانات علائقية تقريبًا للاستعلام عن البيانات وتعديلها.",
    href: "/en/databases/sql",
  },
  cors: {
    term: "CORS",
    definition: "مشاركة الموارد عبر الأصول — الآلية التي يفرضها المتصفح والتي تتيح لخادم ما السماح صراحةً لأصل آخر بقراءة استجاباته.",
    href: "/en/security/cors",
  },
  api: {
    term: "API",
    definition: "واجهة برمجة التطبيقات — طريقة محددة تطلب بها قطعة برمجية وظيفة أو بيانات من قطعة برمجية أخرى.",
  },
};
