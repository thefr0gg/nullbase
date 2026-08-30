import type { StepFlowStep } from "@/components/interactive/StepFlow";

export const resolutionSteps: StepFlowStep[] = [
  {
    actor: "Navegador",
    title: "Comprobación de la Cache local",
    description:
      "Antes de preguntar a nadie más, el navegador comprueba su propia Cache DNS (y la Cache del sistema operativo por debajo). Nada está aún en Cache en una primera visita, así que la búsqueda debe salir a la red.",
  },
  {
    actor: "Recursive Resolver",
    title: "Consulta al Recursive Resolver",
    description:
      "El sistema operativo entrega la pregunta a un Recursive Resolver — normalmente el de tu proveedor de Internet o uno público como 1.1.1.1 u 8.8.8.8. El trabajo de este Resolver es hacer todo el trabajo restante y devolver una única respuesta final.",
    detail: "Consulta: www.example.com A?\nA: 1.1.1.1 (Recursive Resolver)",
  },
  {
    actor: "Root Server",
    title: "Consulta a un Root Server",
    description:
      "El Resolver aún no sabe dónde reside example.com, así que pregunta a uno de los trece grupos de Root Servers. El Root Server tampoco sabe la respuesta — pero sabe quién gestiona .com.",
    detail: "Consulta: www.example.com A?\nEl Root responde: «pregunta a un servidor TLD de .com»",
  },
  {
    actor: "Servidor TLD",
    title: "Consulta al servidor TLD de .com",
    description:
      "El Resolver sigue la remisión a un servidor de dominio de nivel superior (TLD) responsable de .com. Todavía no tiene la dirección IP — pero sabe qué servidores de nombres son autoritativos para example.com específicamente.",
    detail: "Consulta: www.example.com A?\nEl TLD responde: «pregunta a ns1.example.com»",
  },
  {
    actor: "Servidor autoritativo",
    title: "Consulta al servidor autoritativo",
    description:
      "Este es el servidor que el propio proveedor DNS de example.com ejecuta — la fuente de verdad real para sus registros. Tiene la respuesta real.",
    detail: "Consulta: www.example.com A?\nRespuesta: 93.184.216.34",
  },
  {
    actor: "Recursive Resolver",
    title: "Almacenamiento en Cache y devolución de la respuesta",
    description:
      "El Recursive Resolver cachea el resultado durante el TTL del registro (para que la siguiente búsqueda salte directamente a este paso) y finalmente entrega la dirección IP al navegador, que ahora puede abrir una conexión.",
    detail: "www.example.com -> 93.184.216.34 (en Cache)",
  },
];
