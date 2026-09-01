import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A web worker's spawn -> postMessage exchange -> terminate lifecycle —
 *  colocated per the interactive system's authoring convention. */
export const webWorkerLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Main thread",
    title: "Créer le worker",
    description:
      "Le thread principal crée un Worker, en le pointant vers un fichier JavaScript séparé. Le navigateur démarre l'exécution de ce fichier sur son propre thread au niveau du système d'exploitation, en parallèle du thread principal — pas mis en file sur celui-ci.",
    detail: 'const worker = new Worker("crunch-numbers.js");',
  },
  {
    actor: "Main thread",
    title: "Envoyer des données",
    description:
      "Le seul moyen de communiquer avec un worker est postMessage — il n'y a ni mémoire partagée ni appels de fonction directs. Les données transmises ainsi sont copiées (clonage structuré) par défaut, pas partagées, donc les modifier d'un côté n'affecte jamais l'autre.",
    detail: 'worker.postMessage({ numbers: [1, 2, 3, /* ...100000 more */] });',
  },
  {
    actor: "Worker",
    title: "Recevoir et calculer",
    description:
      "Le propre script du worker écoute l'événement message et effectue le travail réel — quel que soit le temps que cela prend, l'interface utilisateur du thread principal reste réactive pendant tout ce temps, puisque cela s'exécute sur un thread entièrement différent.",
    detail: 'self.onmessage = (e) => {\n  const result = e.data.numbers.reduce((a, b) => a + b);\n  self.postMessage({ result });\n};',
  },
  {
    actor: "Main thread",
    title: "Recevoir le résultat",
    description:
      "L'événement message propre au thread principal se déclenche avec ce que le worker a renvoyé — c'est tout l'aller-retour : aucun état partagé, juste des messages copiés à travers une frontière dans les deux sens.",
    detail: 'worker.onmessage = (e) => console.log(e.data.result);',
  },
  {
    actor: "Main thread",
    title: "Terminer une fois fini",
    description:
      "Un worker continue de s'exécuter (et de consommer un thread) jusqu'à un arrêt explicite — soit le worker appelle self.close(), soit le thread principal appelle worker.terminate(). Oublier cela est une véritable fuite de ressources dans les applications de longue durée qui créent des workers de façon répétée.",
    detail: "worker.terminate();",
  },
];
