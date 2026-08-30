import type { Dictionary } from "../types";

export const fr: Dictionary = {
  nav: {
    tagline: "référence pour développeurs",
    openNavigation: "Ouvrir la navigation",
    closeNavigation: "Fermer la navigation",
  },
  search: {
    placeholderTopic: "Rechercher dans {topic}…",
    placeholderGeneric: "Rechercher un sujet…",
    placeholderDisabled: "Recherche indisponible sur cette page",
    noResults: 'Aucun résultat pour "{query}".',
  },
  theme: {
    enableDark: "Activer le mode sombre",
    enableLight: "Activer le mode clair",
  },
  language: {
    switchLanguage: "Changer de langue",
    notTranslatedYet: "Pas encore traduit",
  },
  footer: {
    tagline: "nullbase — la référence pour développeurs, une page à la fois.",
    privacy: "Confidentialité",
  },
  pageFooter: {
    next: "Suivant",
  },
  stepFlow: {
    previous: "Précédent",
    next: "Suivant",
  },
  notFound: {
    badge: "Erreur 4xx côté client",
    heading: "Page introuvable",
    description:
      "Le serveur n'a trouvé aucune représentation actuelle pour la ressource demandée — la page que vous cherchez n'existe pas ici.",
    responseLabel: "Réponse",
    backToHome: "Retour à l'accueil",
  },
  home: {
    heroLead: "Cherchez-le. Voyez-le",
    heroCode: "fonctionner()",
    heroSubtext:
      "Chaque entrée associe une explication en langage simple à quelque chose que vous pouvez vraiment manipuler — une requête à envoyer, une négociation à suivre étape par étape, un en-tête à construire. Sans compte, sans suivi, sans superflu.",
    startWith: "Commencer par {topic}",
    pagesAndCounting: {
      one: "{count} page et ça continue",
      other: "{count} pages et ça continue",
    },
    browseByTopic: "Parcourir par sujet",
    explore: "Explorer {topic}",
    comingSoon: "Bientôt disponible",
    pageCount: {
      one: "{count} page",
      other: "{count} pages",
    },
  },
};
