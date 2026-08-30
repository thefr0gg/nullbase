import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const commonPortItems: ItemExplorerItem[] = [
  { id: "20-21", label: "20/21", color: "blue", detail: "FTP — نقل الملفات. المنفذ 21 هو اتصال التحكم، و20 اتصال البيانات." },
  { id: "22", label: "22", color: "green", detail: "SSH — وصول شل بعيد مشفّر، ووسيلة النقل لـ SFTP وgit عبر SSH." },
  { id: "25", label: "25", color: "orange", detail: "SMTP — ترحيل البريد بين خوادم البريد." },
  { id: "53", label: "53", color: "purple", detail: "DNS — حل أسماء النطاقات، عبر UDP (الاستعلامات المعتادة) وTCP (الاستجابات الكبيرة، ونقل المناطق)." },
  { id: "80", label: "80", color: "blue", detail: "HTTP — حركة ويب غير مشفّرة. المنفذ الافتراضي عندما يحذف عنوان URL منفذاً." },
  { id: "443", label: "443", color: "green", detail: "HTTPS — HTTP عبر TLS. الافتراضي لعناوين https://." },
  { id: "3306", label: "3306", color: "orange", detail: "MySQL / MariaDB — منفذ اتصال قاعدة البيانات الافتراضي." },
  { id: "5432", label: "5432", color: "orange", detail: "PostgreSQL — منفذ اتصال قاعدة البيانات الافتراضي." },
  { id: "6379", label: "6379", color: "red", detail: "Redis — المنفذ الافتراضي لمخزن البيانات في الذاكرة." },
];
