import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const commonPortItems: ItemExplorerItem[] = [
  { id: "20-21", label: "20/21", color: "blue", detail: "FTP — transferencia de archivos. El puerto 21 es la conexión de control, el 20 la de datos." },
  { id: "22", label: "22", color: "green", detail: "SSH — acceso de shell remoto cifrado, y transporte para SFTP y git sobre SSH." },
  { id: "25", label: "25", color: "orange", detail: "SMTP — retransmisión de correo entre servidores de correo." },
  { id: "53", label: "53", color: "purple", detail: "DNS — resolución de nombres de dominio, tanto por UDP (consultas habituales) como por TCP (respuestas grandes, transferencias de zona)." },
  { id: "80", label: "80", color: "blue", detail: "HTTP — tráfico web sin cifrar. El puerto predeterminado cuando una URL omite uno." },
  { id: "443", label: "443", color: "green", detail: "HTTPS — HTTP sobre TLS. El predeterminado para las URL https://." },
  { id: "3306", label: "3306", color: "orange", detail: "MySQL / MariaDB — el puerto de conexión predeterminado a la base de datos." },
  { id: "5432", label: "5432", color: "orange", detail: "PostgreSQL — el puerto de conexión predeterminado a la base de datos." },
  { id: "6379", label: "6379", color: "red", detail: "Redis — el puerto predeterminado del almacén de datos en memoria." },
];
