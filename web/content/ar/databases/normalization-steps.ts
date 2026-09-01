import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** تسوية جدول طلبات مسطّح غير مُسوّى واحد عبر 1NF و2NF و3NF —
 *  متعايشة وفق اتفاقية التأليف الخاصة بالنظام التفاعلي. */
export const normalizationSteps: StepFlowStep[] = [
  {
    title: "البداية: جدول واحد مسطّح وغير مُسوّى",
    description:
      "يكرر كل طلب التفاصيل الكاملة للعميل والتفاصيل الكاملة للمنتج في كل صف. عدّل بريد عميل إلكترونياً، والآن يجب أن يتغير في كل صف طلب لهذا العميل — تفوّت صفاً واحداً، وتبدأ البيانات بمناقضة نفسها بصمت.",
    detail:
      "orders\n" +
      "id | customer_name | customer_email      | product_name | product_price | quantity\n" +
      "1  | Ada Lovelace   | ada@example.com     | Widget       | 9.99          | 3\n" +
      "2  | Ada Lovelace   | ada@example.com     | Gadget       | 19.99         | 1\n" +
      "3  | Alan Turing    | alan@example.com    | Widget       | 9.99          | 2",
  },
  {
    actor: "1NF",
    title: "الصيغة الطبيعية الأولى: قيم ذرية، لا مجموعات متكررة",
    description:
      "تتطلب 1NF أن يحمل كل عمود قيمة واحدة غير قابلة للتجزئة — لا قائمة منتجات مفصولة بفواصل محشورة في خلية واحدة، ولا أعمدة product_1/product_2/product_3 متكررة. الجدول أعلاه يحقق هذا بالفعل (كل صف هو سطر طلب واحد، قيمة واحدة لكل خلية) — انتهاك شائع سيكون عمود \"products\" واحد يحمل \"Widget, Gadget\".",
  },
  {
    actor: "2NF",
    title: "الصيغة الطبيعية الثانية: لا اعتماد جزئي على جزء من المفتاح",
    description:
      "تنطبق 2NF عندما يكون للجدول مفتاح مركّب — يجب أن يعتمد كل عمود غير مفتاحي على المفتاح بأكمله، لا على جزء منه فقط. يعتمد product_price فقط على المنتج نفسه، وليس على سطر الطلب المحدد المرتبط به، لذا يُنقَل إلى جدول products خاص به، مفتاحه المنتج وحده.",
    detail:
      "products\n" +
      "id | name   | price\n" +
      "1  | Widget | 9.99\n" +
      "2  | Gadget | 19.99",
  },
  {
    actor: "3NF",
    title: "الصيغة الطبيعية الثالثة: لا اعتماد عابر",
    description:
      "تزيل 3NF الأعمدة التي تعتمد على عمود آخر غير مفتاحي بدلاً من المفتاح نفسه. يعتمد customer_email على هوية العميل، لا على الطلب — لذا يحصل العملاء أيضاً على جدول خاص بهم، يُشار إليه من orders بالمعرّف بدلاً من تكرار تفاصيلهم في كل صف.",
    detail:
      "customers\n" +
      "id | name         | email\n" +
      "1  | Ada Lovelace | ada@example.com\n" +
      "2  | Alan Turing  | alan@example.com",
  },
  {
    title: "النهاية: ثلاثة جداول مُسوّاة، تُربَط عند الحاجة",
    description:
      "الآن يشير orders فقط إلى customer_id وproduct_id. تحديث بريد عميل إلكتروني هو صف واحد في جدول واحد. العرض المسطّح الأصلي لا يُفقد أبداً — يُعاد بناؤه عند الطلب بواسطة JOIN، نفس JOIN المشروح في صفحة SQL — التسوية تستبدل قدراً من تعقيد الاستعلام بالقضاء على فئة كاملة من أخطاء اتساق التحديث.",
    detail:
      "orders\n" +
      "id | customer_id | product_id | quantity\n" +
      "1  | 1           | 1          | 3\n" +
      "2  | 1           | 2          | 1\n" +
      "3  | 2           | 1          | 2",
  },
];
