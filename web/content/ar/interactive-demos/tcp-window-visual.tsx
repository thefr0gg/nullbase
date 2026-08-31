"use client";

import { useSliderValue } from "@/components/interactive/InteractiveSlider";

/**
 * مرئية شريط التمرير لصفحة `tcp-vs-udp.mdx` — راجع النسخة الإنجليزية
 * لتبرير نمط «مكوّن عميل مخصّص يقرأ القيمة عبر السياق» بدلًا من تمرير
 * دالة كخاصية.
 */
export default function TcpWindowVisual() {
  const value = useSliderValue();

  return (
    <div>
      <div className="flex gap-0.5">
        {Array.from({ length: 64 }, (_, i) => (
          <span
            key={i}
            className={i < value ? "h-4 flex-1 rounded-sm bg-electric-blue" : "h-4 flex-1 rounded-sm bg-border"}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-text-secondary">
        يمكن أن يكون حتى <strong className="text-text-primary">{value} كيلوبايت</strong> قيد النقل، دون تأكيد
        استلام، قبل أن يضطر المرسل للتوقف. إذا كان صغيرًا جدًا فستبقى الروابط عالية زمن الاستجابة خاملة في انتظار
        التأكيدات؛ وإذا كان كبيرًا جدًا فإن رابطًا يعاني من فقدان الحزم سيهدر عرض النطاق الترددي بإعادة إرسال دفعات
        كبيرة.
      </p>
    </div>
  );
}
