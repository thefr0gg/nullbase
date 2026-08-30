import type { ItemExplorerItem } from "@/components/interactive/ItemExplorer";

export const commonPortItems: ItemExplorerItem[] = [
  { id: "20-21", label: "20/21", color: "blue", detail: "FTP — transfert de fichiers. Le port 21 est la connexion de contrôle, le 20 la connexion de données." },
  { id: "22", label: "22", color: "green", detail: "SSH — accès shell distant chiffré, et transport pour SFTP et git via SSH." },
  { id: "25", label: "25", color: "orange", detail: "SMTP — relais de courrier entre serveurs de messagerie." },
  { id: "53", label: "53", color: "purple", detail: "DNS — résolution de noms de domaine, à la fois via UDP (requêtes habituelles) et TCP (grosses réponses, transferts de zone)." },
  { id: "80", label: "80", color: "blue", detail: "HTTP — trafic web non chiffré. Le port par défaut lorsqu'une URL en omet un." },
  { id: "443", label: "443", color: "green", detail: "HTTPS — HTTP sur TLS. Le défaut pour les URL https://." },
  { id: "3306", label: "3306", color: "orange", detail: "MySQL / MariaDB — le port de connexion par défaut à la base de données." },
  { id: "5432", label: "5432", color: "orange", detail: "PostgreSQL — le port de connexion par défaut à la base de données." },
  { id: "6379", label: "6379", color: "red", detail: "Redis — le port par défaut du magasin de données en mémoire." },
];
