import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** How a single click event travels through the DOM tree — colocated per
 *  the interactive system's authoring convention. */
export const eventPropagationSteps: StepFlowStep[] = [
  {
    actor: "Navigateur",
    title: "L'utilisateur clique",
    description:
      "Un clic atterrit sur l'élément le plus intérieur sous le curseur — disons, un <button> imbriqué dans un <form> lui-même imbriqué dans un <div>. Cet élément devient la cible de l'événement, et le reste pendant tout le trajet ci-dessous.",
    detail: "<div id=\"outer\">\n  <form id=\"form\">\n    <button id=\"btn\">Submit</button>\n  </form>\n</div>",
  },
  {
    actor: "Phase de capture",
    title: "De haut en bas, de la racine vers la cible",
    description:
      "L'événement voyage d'abord VERS LE BAS depuis la racine du document à travers chaque ancêtre de la cible — div -> form -> button — en appelant tout écouteur enregistré avec { capture: true } au passage. Presque rien n'utilise cette phase en pratique ; elle existe surtout pour qu'un parent puisse intercepter un événement avant qu'un enfant n'en ait la chance.",
    detail: "window -> document -> div#outer -> form#form -> button#btn",
  },
  {
    actor: "Phase de cible",
    title: "L'événement atteint la cible",
    description:
      "Les écouteurs enregistrés directement sur button#btn lui-même s'exécutent maintenant — c'est la phase que presque tout appel addEventListener du code ordinaire attend réellement.",
  },
  {
    actor: "Phase de propagation ascendante",
    title: "De bas en haut, retour vers la racine",
    description:
      "L'événement voyage ensuite VERS LE HAUT à travers les mêmes ancêtres en sens inverse — button -> form -> div — en appelant tout écouteur enregistré sans { capture: true } (le comportement par défaut). C'est ce qui rend possible la délégation d'événements : un seul écouteur sur div#outer peut gérer les clics sur n'importe quel bouton à l'intérieur, présent maintenant ou ajouté plus tard, en vérifiant event.target.",
    detail: "button#btn -> form#form -> div#outer -> document -> window",
  },
  {
    actor: "N'importe quel écouteur",
    title: "L'arrêter tôt",
    description:
      "N'importe quel écouteur, à n'importe quel moment, peut appeler event.stopPropagation() pour empêcher l'événement de continuer vers l'ancêtre suivant — ou event.preventDefault() pour annuler l'action par défaut du navigateur pour cet événement (comme un formulaire qui se soumet réellement), ce qui est distinct de l'arrêt complet de la propagation.",
  },
];
