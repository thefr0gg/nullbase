import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** The JS event loop, following one script's execution through the call
 *  stack, microtask queue, and macrotask queue — colocated per the
 *  interactive system's authoring convention. */
export const eventLoopSteps: StepFlowStep[] = [
  {
    actor: "Call stack",
    title: "Le code synchrone s'exécute en premier",
    description:
      "Le moteur exécute le script courant de haut en bas sur la pile d'appels. Rien d'autre — pas de timer, pas de callback de promesse, pas de callback d'E/S — ne s'exécute tant que cette pile n'est pas complètement vide.",
    detail: 'console.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");\n\n// logs: 1, 4, 3, 2',
  },
  {
    actor: "Web API",
    title: "Le travail asynchrone est délégué",
    description:
      "setTimeout, fetch, les événements DOM et les API asynchrones similaires ne font pas partie du moteur JS lui-même — les appeler délègue le travail au navigateur (ou aux liaisons C++ de Node), qui effectue l'attente réelle en dehors de la pile d'appels.",
  },
  {
    actor: "Microtask queue",
    title: "Les callbacks de Promise se mettent en file comme microtâches",
    description:
      "Quand une Promise se résout, ses callbacks .then/.catch/.finally ne s'exécutent pas immédiatement — ils sont mis en file comme microtâches. async/await est construit sur les Promises, donc la continuation d'un await est aussi une microtâche.",
  },
  {
    actor: "Callback queue",
    title: "Timers et E/S se mettent en file comme macrotâches",
    description:
      "Quand le délai d'un setTimeout est écoulé, ou qu'une E/S se termine, son callback est mis en file comme macrotâche (aussi appelée « tâche ») — une file séparée, de priorité inférieure aux microtâches.",
  },
  {
    actor: "Event loop",
    title: "Vider toutes les microtâches, puis une macrotâche",
    description:
      "Une fois la pile d'appels vide, la boucle d'événements exécute *toutes* les microtâches de la file — y compris les nouvelles qu'une microtâche met elle-même en file — jusqu'à ce que cette file soit complètement vide. Ce n'est qu'alors qu'elle retire une seule macrotâche de la file de callbacks et l'exécute.",
  },
  {
    actor: "Event loop",
    title: "Recommencer",
    description:
      "Une fois cette macrotâche terminée, la boucle vide à nouveau la file de microtâches (vide à ce stade, sauf si cette macrotâche a mis en file de nouvelles microtâches), puis prend la macrotâche suivante — indéfiniment, pendant toute la vie de la page. C'est pourquoi le callback d'une Promise résolue s'exécute toujours avant celui d'un setTimeout de 0 ms, même si les deux étaient « prêts » au même instant.",
  },
];
