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
  privacy: {
    badge: "Confidentialité",
    heading: "Comment nullbase traite vos données",
    intro:
      "En bref : pas de comptes, pas d'analytique, pas d'empreinte numérique. Cette page explique, en termes simples, le peu de choses que le site stocke et pourquoi — ainsi que ce que fait Google AdSense de son côté.",
    lastUpdatedLabel: "Dernière mise à jour :",
    terminalComment: "# pas de Set-Cookie, pas de connexion, pas de script traceur — juste la page.",
    neverDoes: {
      title: "Ce que nullbase ne fait jamais",
      items: [
        "Aucun compte utilisateur, inscription ou connexion pour les visiteurs.",
        "Aucun script d'analytique ou de télémétrie (pas de Google Analytics, pas de Meta Pixel, pas de session replay).",
        "Aucune empreinte numérique de l'appareil ou du navigateur.",
        "Aucune vente ni partage de données avec des courtiers en données.",
        "Aucun suivi des pages que vous consultez d'une visite à l'autre.",
      ],
    },
    stored: {
      title: "Ce qui est stocké, et pourquoi",
      intro:
        "Quelques fonctionnalités interactives (aimer une page, envoyer un avis) ont besoin d'un minimum d'état pour fonctionner et éviter les abus. Voici exactement ce que c'est :",
      browserTitle: "Dans votre navigateur",
      themeItem: "votre préférence clair/sombre, dans localStorage.",
      visitorIdItem:
        "un UUID aléatoire généré sur votre appareil, dans localStorage. Ce n'est pas une empreinte — il ne contient aucune information sur vous, et effacer les données du site en génère simplement un nouveau.",
      browserFooter: "Aucun des deux ne quitte jamais votre navigateur, sauf vers notre propre API — jamais vers un tiers.",
      serverTitle: "Sur notre serveur",
      likesItem: "Mentions « j'aime » — quelle page, et un compteur agrégé. Un like par visiteur et par page.",
      feedbackItem:
        "Avis — la page sur laquelle il a été laissé, une note et/ou un commentaire, et un e-mail seulement si vous choisissez d'en fournir un (pour pouvoir vous répondre).",
      serverFooter:
        "Pour éviter le spam, les deux sont associés à un hachage SHA-256 salé de votre adresse IP et de l'agent utilisateur de votre navigateur — jamais les valeurs brutes. Le hachage ne peut pas être inversé pour retrouver votre IP.",
      outro:
        "Rien de tout cela n'est utilisé pour la publicité, le profilage, ou quoi que ce soit au-delà du bon fonctionnement du bouton « j'aime » et du formulaire d'avis.",
    },
    hosting: {
      title: "Hébergement",
      before: "nullbase est hébergé sur Cloudflare, selon la",
      linkText: "propre politique de confidentialité de Cloudflare",
      after: ".",
    },
    advertising: {
      title: "Publicité (Google AdSense)",
      p1: "nullbase affiche des publicités fournies par Google AdSense pour aider à couvrir les frais d'hébergement. Google et ses partenaires publicitaires peuvent utiliser des cookies et des identifiants similaires pour diffuser des publicités — y compris des publicités basées sur vos visites sur ce site et d'autres — et pour mesurer leur performance. nullbase ne contrôle pas cela et ne reçoit aucune des données collectées par Google à cet effet.",
      p2Before: "Vous pouvez consulter et ajuster la personnalisation des annonces par Google sur",
      linkAdsSettings: "Google Ads Settings",
      p2Mid1: ", ou refuser la publicité personnalisée de manière générale sur",
      linkAboutAds: "aboutads.info",
      p2Mid2: ". Le détail complet de l'utilisation des données par Google pour les sites utilisant ses services se trouve dans la",
      linkAdPolicy: "politique publicitaire de Google",
      p2After: ".",
    },
    choices: {
      title: "Vos choix",
      items: [
        "Effacez le stockage local de votre navigateur à tout moment pour réinitialiser votre préférence de thème et votre identifiant visiteur — rien de notre côté n'est lié à vous par nom ou par compte.",
        "Demandez-nous de supprimer un avis que vous avez soumis avec une adresse e-mail en écrivant au contact ci-dessous.",
        "Utilisez à tout moment les contrôles de personnalisation des annonces indiqués ci-dessus.",
      ],
    },
    children: {
      title: "Confidentialité des enfants",
      text: "nullbase est une référence technique et ne s'adresse pas aux enfants. Nous ne collectons sciemment aucune donnée auprès de quiconque de moins de 13 ans.",
    },
    changes: {
      title: "Modifications de cette page",
      text: "Si ce que nullbase stocke ou la façon dont il utilise la publicité change, cette page sera mise à jour et la date en haut sera modifiée en conséquence.",
    },
    contact: {
      title: "Contact",
      before: "Questions sur cette page, ou demande de suppression de données :",
    },
  },
};
