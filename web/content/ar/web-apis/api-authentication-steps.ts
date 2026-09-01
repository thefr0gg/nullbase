import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** OAuth 2.0 authorization code flow — colocated per the interactive
 *  system's authoring convention. */
export const oauthAuthCodeSteps: StepFlowStep[] = [
  {
    actor: "تطبيقك",
    title: "أعِد التوجيه إلى خادم التفويض",
    description:
      "يرسل تطبيقك متصفح المستخدم إلى صفحة تسجيل الدخول الخاصة بخادم التفويض، مع معرّف عميل تطبيقك، والصلاحيات (scopes) التي تطلبها، ورابط لإعادة التوجيه إليه.",
    detail: "GET https://auth.example.com/authorize?\n  client_id=abc123&\n  redirect_uri=https://your-app.example/callback&\n  scope=read:profile&\n  response_type=code",
  },
  {
    actor: "المستخدم",
    title: "سجّل الدخول ووافق",
    description:
      "يصادق المستخدم مباشرة مع خادم التفويض — لا يرى تطبيقك كلمة مروره أبداً — ويوافق (أو يرفض) الصلاحيات التي يطلبها تطبيقك.",
  },
  {
    actor: "خادم التفويض",
    title: "أعِد التوجيه مع رمز",
    description:
      "يعيد خادم التفويض توجيه المتصفح إلى رابط رد نداء تطبيقك مع رمز تفويض قصير الأمد وأحادي الاستخدام في سلسلة الاستعلام.",
    detail: "GET https://your-app.example/callback?code=SplxlOBeZQQYbYS6WxSbIA",
  },
  {
    actor: "تطبيقك",
    title: "استبدل الرمز برمز مميز",
    description:
      "يرسل الجزء الخلفي من تطبيقك — لا المتصفح — ذلك الرمز، مع سرّ عميل تطبيقك، مباشرة إلى نقطة نهاية الرمز المميز لدى خادم التفويض. هذا استدعاء خادم إلى خادم، لذا لا يلمس سرّ العميل المتصفح أبداً.",
    detail: "POST https://auth.example.com/token\n{ \"grant_type\": \"authorization_code\",\n  \"code\": \"SplxlOBeZQQYbYS6WxSbIA\",\n  \"client_id\": \"abc123\",\n  \"client_secret\": \"...\" }",
  },
  {
    actor: "خادم التفويض",
    title: "أعِد رمز وصول",
    description:
      "يتحقق خادم التفويض من الرمز والسرّ، ثم يعيد رمز وصول (وغالباً رمز تحديث) — هذا ما يستخدمه تطبيقك فعلياً لاستدعاء الواجهة من الآن فصاعداً.",
    detail: "{ \"access_token\": \"eyJhbGciOi...\",\n  \"token_type\": \"Bearer\",\n  \"expires_in\": 3600,\n  \"refresh_token\": \"8xLOxBtZp8\" }",
  },
  {
    actor: "تطبيقك",
    title: "استدعِ الواجهة",
    description:
      "من هنا فصاعداً، يرسل تطبيقك رمز الوصول في كل طلب كترويسة Authorization: Bearer. وعند انتهاء صلاحيته، يحصل رمز التحديث على رمز جديد دون أن يضطر المستخدم لتسجيل الدخول مجدداً.",
    detail: "GET /api/profile\nAuthorization: Bearer eyJhbGciOi...",
  },
];
