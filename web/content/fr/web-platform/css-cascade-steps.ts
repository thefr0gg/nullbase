import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** How a browser resolves two conflicting rules targeting the same element
 *  and property — colocated per the interactive system's authoring
 *  convention. */
export const cascadeResolutionSteps: StepFlowStep[] = [
  {
    title: "Rassembler toutes les règles correspondantes",
    description:
      "Le navigateur trouve chaque règle CSS où qu'elle soit (feuille de style, balise <style>, attribut style en ligne) dont le sélecteur correspond à cet élément, pour la propriété en question.",
    detail: "p { color: blue; }\n.notice { color: orange; }\n#alert { color: red; }",
  },
  {
    title: "Vérifier l'importance et l'origine",
    description:
      "Une déclaration marquée !important bat une déclaration normale de la même origine. Au-delà de cela, l'ordre des origines compte : les styles user-agent (par défaut du navigateur) perdent face aux styles author (votre CSS), qui perdent face à author !important, qui perd face aux styles user !important.",
    detail: "p { color: blue !important; } /* wins over any non-!important rule below */",
  },
  {
    title: "Comparer la spécificité",
    description:
      "Parmi les règles de même importance/origine, le navigateur calcule le score de spécificité de chaque sélecteur : les styles en ligne battent les ID, les ID battent les classes/attributs/pseudo-classes, les classes battent les sélecteurs d'élément. La règle avec la spécificité la plus élevée l'emporte.",
    detail: "#alert          -> 1 ID               (highest)\n.notice          -> 1 class\np                -> 1 element         (lowest)",
  },
  {
    title: "Départager par ordre dans le code source",
    description:
      "Si deux règles ont une spécificité identique, celle qui apparaît plus tard dans le code source (ou dans une feuille de style chargée plus tard) l'emporte — c'est la véritable « cascade » évoquée par le nom.",
    detail: ".notice { color: orange; }\n.notice { color: green; } /* wins — same specificity, comes later */",
  },
  {
    title: "Appliquer la valeur gagnante",
    description:
      "Quelle que soit la déclaration unique qui survit à ces quatre étapes, c'est elle que l'élément affiche réellement — toute autre règle correspondante pour cette propriété est simplement écartée, jamais mélangée ni moyennée.",
  },
];
