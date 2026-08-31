import type { DiagramRow } from "@/components/interactive/DiagramExplorer";

export const urlLifecycleRows: DiagramRow[] = [
  {
    nodes: [{ id: "url", label: "URL introducida", color: "default", detail: "El navegador tiene una cadena de texto sin procesar — nada se ha interpretado todavía." }],
  },
  {
    connectorLabel: "analizar",
    nodes: [{ id: "parsing", label: "Análisis de la URL", color: "blue", detail: "El navegador divide la cadena en esquema, host, puerto, ruta y consulta — ver el desglose de arriba para saber exactamente qué caracteres marcan cada límite." }],
  },
  {
    connectorLabel: "resolver el host",
    nodes: [{ id: "dns", label: "DNS", color: "green", detail: "El segmento host (p. ej. example.com) se resuelve a una dirección IP — comprobando primero la caché del sistema, luego un resolvedor, antes de siquiera llegar a la red." }],
  },
  {
    connectorLabel: "conectar",
    nodes: [{ id: "tcp", label: "TCP", color: "purple", detail: "Un saludo de tres vías establece una conexión fiable y ordenada hacia esa dirección IP, en el puerto de la URL (443 para https, 80 para http)." }],
  },
  {
    connectorLabel: "solo https",
    nodes: [{ id: "tls", label: "TLS", color: "orange", detail: "Para https, un saludo negocia el cifrado y verifica el certificado del servidor antes de enviar cualquier dato HTTP." }],
  },
  {
    connectorLabel: "solicitud",
    nodes: [{ id: "http", label: "HTTP", color: "blue", detail: "El navegador envía una línea de solicitud y cabeceras construidas a partir de la ruta y la consulta de la URL, sobre la conexión ya segura." }],
  },
  {
    connectorLabel: "procesar",
    nodes: [{ id: "server", label: "Servidor", color: "green", detail: "El servidor enruta la solicitud según la ruta, ejecuta la lógica de la aplicación y produce una respuesta." }],
  },
  {
    connectorLabel: "respuesta",
    nodes: [{ id: "browser", label: "El navegador renderiza", color: "purple", detail: "El navegador recibe la respuesta y la renderiza — la conexión puede mantenerse abierta y reutilizarse para más solicitudes al mismo origen." }],
  },
];
