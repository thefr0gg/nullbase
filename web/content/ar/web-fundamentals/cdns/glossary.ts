import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const cdnGlossaryItems: ItemExplorerItem[] = [
  { id: "origin", label: "Origin Server", color: "blue", detail: "خادمك الخلفي الفعلي — مصدر الحقيقة الذي تلجأ إليه شبكة CDN عند حدوث Cache Miss." },
  { id: "edge", label: "Edge Server", color: "green", detail: "خادم CDN قريب فيزيائياً من المستخدمين النهائيين، يحفظ في الـ Cache ويقدّم المحتوى نيابة عن الـ Origin." },
  { id: "pop", label: "نقطة حضور (PoP)", color: "green", detail: "موقع مركز بيانات فيزيائي يضم Edge Server واحداً أو أكثر." },
  { id: "ttl", label: "مدة البقاء (TTL)", color: "purple", detail: "مدة احتفاظ خادم الـ Edge بنسخة في الـ Cache قبل اعتبارها قديمة وإعادة جلبها من الـ Origin." },
  { id: "purge", label: "التطهير / الإبطال (Purge)", color: "orange", detail: "إخبار كل خادم Edge يدوياً بإسقاط نسخة الـ Cache فوراً، بدلاً من انتظار انتهاء صلاحية TTL — يُستخدم عند تغيّر محتوى الـ Origin بشكل غير متوقع." },
  { id: "origin-shield", label: "Origin Shield", color: "red", detail: "طبقة Cache إضافية بين خوادم الـ Edge والـ Origin، حتى لا يتحول Cache Miss في 50 نقطة Edge مختلفة إلى 50 طلباً متزامناً يصل الـ Origin دفعة واحدة." },
];
