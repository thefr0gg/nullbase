import type { Dictionary } from "../types";

export const es: Dictionary = {
  nav: {
    tagline: "referencia para desarrolladores",
    openNavigation: "Abrir navegación",
    closeNavigation: "Cerrar navegación",
  },
  search: {
    placeholderTopic: "Buscar en {topic}…",
    placeholderGeneric: "Buscar temas…",
    placeholderDisabled: "Búsqueda no disponible en esta página",
    noResults: 'Sin resultados para "{query}".',
  },
  theme: {
    enableDark: "Activar modo oscuro",
    enableLight: "Activar modo claro",
  },
  language: {
    switchLanguage: "Cambiar idioma",
    notTranslatedYet: "Aún no traducido",
  },
  footer: {
    tagline: "nullbase — construyendo la referencia para desarrolladores, una página a la vez.",
    privacy: "Privacidad",
  },
  pageFooter: {
    next: "Siguiente",
  },
  stepFlow: {
    previous: "Anterior",
    next: "Siguiente",
  },
  notFound: {
    badge: "Error 4xx del cliente",
    heading: "No encontrado",
    description:
      "El servidor no encontró una representación actual para el recurso solicitado — la página que buscas no existe aquí.",
    responseLabel: "Respuesta",
    backToHome: "Volver al inicio",
  },
  home: {
    heroLead: "Búscalo. Míralo",
    heroCode: "funcionar()",
    heroSubtext:
      "Cada entrada combina una explicación en lenguaje sencillo con algo que realmente puedes probar — una solicitud que puedes enviar, un intercambio que puedes seguir paso a paso, un encabezado que puedes construir. Sin cuenta, sin rastreo, sin relleno.",
    startWith: "Empieza con {topic}",
    pagesAndCounting: {
      one: "{count} página y contando",
      other: "{count} páginas y contando",
    },
    browseByTopic: "Explorar por tema",
    explore: "Explorar {topic}",
    comingSoon: "Próximamente",
    pageCount: {
      one: "{count} página",
      other: "{count} páginas",
    },
  },
};
