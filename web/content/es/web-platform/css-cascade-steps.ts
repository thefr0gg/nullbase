import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** How a browser resolves two conflicting rules targeting the same element
 *  and property — colocated per the interactive system's authoring
 *  convention. */
export const cascadeResolutionSteps: StepFlowStep[] = [
  {
    title: "Recopilar cada regla coincidente",
    description:
      "El navegador encuentra cada regla CSS en cualquier lugar (hoja de estilos, etiqueta <style>, atributo style en línea) cuyo selector coincida con este elemento, para la propiedad en cuestión.",
    detail: "p { color: blue; }\n.notice { color: orange; }\n#alert { color: red; }",
  },
  {
    title: "Comprobar importancia y origen",
    description:
      "Una declaración marcada con !important gana a una normal del mismo origen. Más allá de eso, el orden de origen importa: los estilos de user-agent (por defecto del navegador) pierden frente a los estilos de autor (tu CSS), que pierden frente a !important de autor, que pierde frente a !important de usuario.",
    detail: "p { color: blue !important; } /* wins over any non-!important rule below */",
  },
  {
    title: "Comparar especificidad",
    description:
      "Entre reglas de la misma importancia/origen, el navegador puntúa la especificidad de cada selector: los estilos en línea ganan a los IDs, los IDs ganan a las clases/atributos/pseudoclases, las clases ganan a los selectores de elemento. Gana la regla de mayor especificidad.",
    detail: "#alert          -> 1 ID               (highest)\n.notice          -> 1 class\np                -> 1 element         (lowest)",
  },
  {
    title: "Desempatar por orden de origen",
    description:
      "Si dos reglas tienen especificidad idéntica, gana la que aparece más tarde en el origen (o en una hoja de estilos cargada más tarde) — esta es la verdadera «cascada» a la que se refiere el nombre.",
    detail: ".notice { color: orange; }\n.notice { color: green; } /* wins — same specificity, comes later */",
  },
  {
    title: "Aplicar el valor ganador",
    description:
      "Cualquiera que sea la única declaración que sobreviva a los cuatro pasos es con la que el elemento realmente se renderiza — cualquier otra regla coincidente para esa propiedad simplemente se descarta, no se mezcla ni se promedia.",
  },
];
