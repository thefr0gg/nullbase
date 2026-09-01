import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** How a single click event travels through the DOM tree — colocated per
 *  the interactive system's authoring convention. */
export const eventPropagationSteps: StepFlowStep[] = [
  {
    actor: "Navegador",
    title: "El usuario hace clic",
    description:
      "Un clic aterriza en el elemento más interno bajo el cursor — digamos, un <button> anidado dentro de un <form> anidado dentro de un <div>. Este elemento se convierte en el target del evento, y sigue siendo el target durante todo el recorrido siguiente.",
    detail: "<div id=\"outer\">\n  <form id=\"form\">\n    <button id=\"btn\">Submit</button>\n  </form>\n</div>",
  },
  {
    actor: "Fase de captura",
    title: "De arriba hacia abajo, desde la raíz hasta el target",
    description:
      "El evento primero viaja HACIA ABAJO desde la raíz del documento a través de cada ancestro del target — div -> form -> button — llamando a cualquier listener registrado con { capture: true } en el camino. En la práctica casi nada usa esta fase; existe principalmente para que un padre pueda interceptar un evento antes de que un hijo tenga la oportunidad de hacerlo.",
    detail: "window -> document -> div#outer -> form#form -> button#btn",
  },
  {
    actor: "Fase de target",
    title: "El evento llega al target",
    description:
      "Los listeners registrados directamente en button#btn se ejecutan ahora — esta es la fase que casi todas las llamadas a addEventListener en código ordinario están escuchando realmente.",
  },
  {
    actor: "Fase de burbujeo",
    title: "De abajo hacia arriba, de vuelta hasta la raíz",
    description:
      "El evento luego viaja de vuelta HACIA ARRIBA por los mismos ancestros en orden inverso — button -> form -> div — llamando a cualquier listener registrado sin { capture: true } (el valor por defecto). Esto es lo que hace posible la delegación de eventos: un único listener en div#outer puede manejar clics en cualquier botón dentro de él, presente ahora o añadido después, comprobando event.target.",
    detail: "button#btn -> form#form -> div#outer -> document -> window",
  },
  {
    actor: "Cualquier listener",
    title: "Detenerlo antes de tiempo",
    description:
      "Cualquier listener en cualquier punto puede llamar a event.stopPropagation() para evitar que el evento continúe hacia el siguiente ancestro — o a event.preventDefault() para cancelar la acción por defecto del navegador para el evento (como que un formulario realmente se envíe), lo cual es algo distinto a detener la propagación por completo.",
  },
];
