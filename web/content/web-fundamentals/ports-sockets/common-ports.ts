import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const commonPortItems: ItemExplorerItem[] = [
  { id: "20-21", label: "20/21", color: "blue", detail: "FTP — file transfer. Port 21 is the control connection, 20 the data connection." },
  { id: "22", label: "22", color: "green", detail: "SSH — encrypted remote shell access, and the transport for SFTP and git-over-SSH." },
  { id: "25", label: "25", color: "orange", detail: "SMTP — mail relaying between mail servers." },
  { id: "53", label: "53", color: "purple", detail: "DNS — domain name resolution, over both UDP (usual queries) and TCP (large responses, zone transfers)." },
  { id: "80", label: "80", color: "blue", detail: "HTTP — unencrypted web traffic. The default port when a URL omits one." },
  { id: "443", label: "443", color: "green", detail: "HTTPS — HTTP over TLS. The default for https:// URLs." },
  { id: "3306", label: "3306", color: "orange", detail: "MySQL / MariaDB — the default database connection port." },
  { id: "5432", label: "5432", color: "orange", detail: "PostgreSQL — the default database connection port." },
  { id: "6379", label: "6379", color: "red", detail: "Redis — the default port for the in-memory data store." },
];
