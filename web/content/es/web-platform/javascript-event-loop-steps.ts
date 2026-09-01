import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** The JS event loop, following one script's execution through the call
 *  stack, microtask queue, and macrotask queue — colocated per the
 *  interactive system's authoring convention. */
export const eventLoopSteps: StepFlowStep[] = [
  {
    actor: "Pila de llamadas",
    title: "El código síncrono se ejecuta primero",
    description:
      "El motor ejecuta el script actual de arriba a abajo en la pila de llamadas. Nada más — ningún temporizador, callback de promesa, o callback de E/S — se ejecuta hasta que esta pila esté completamente vacía.",
    detail: 'console.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");\n\n// logs: 1, 4, 3, 2',
  },
  {
    actor: "Web API",
    title: "El trabajo asíncrono se delega",
    description:
      "setTimeout, fetch, los eventos del DOM y APIs asíncronas similares no forman parte del propio motor de JS — llamarlas delega el trabajo al navegador (o a los bindings en C++ de Node), que hace la espera real fuera de la pila de llamadas.",
  },
  {
    actor: "Cola de microtareas",
    title: "Los callbacks de las Promises se encolan como microtareas",
    description:
      "Cuando una Promise se resuelve, sus callbacks .then/.catch/.finally no se ejecutan de inmediato — se encolan como microtareas. async/await está construido sobre Promises, así que la continuación de un await también es una microtarea.",
  },
  {
    actor: "Cola de callbacks",
    title: "Los temporizadores y la E/S se encolan como macrotareas",
    description:
      "Cuando transcurre el retraso de un setTimeout, o se completa una operación de E/S, su callback se encola como una macrotarea (también llamada «task») — una cola separada y de menor prioridad que las microtareas.",
  },
  {
    actor: "Bucle de eventos",
    title: "Vaciar todas las microtareas, luego una macrotarea",
    description:
      "Una vez que la pila de llamadas está vacía, el bucle de eventos ejecuta *cada* microtarea de la cola — incluidas las nuevas que una propia microtarea encole — hasta que esa cola quede completamente vacía. Solo entonces toma una única macrotarea de la cola de callbacks y la ejecuta.",
  },
  {
    actor: "Bucle de eventos",
    title: "Repetir",
    description:
      "Después de que esa macrotarea termina, el bucle vacía de nuevo la cola de microtareas (vacía ya, a menos que esa macrotarea haya encolado nuevas microtareas), y luego toma la siguiente macrotarea — para siempre, durante toda la vida de la página. Por eso el callback de una Promise resuelta siempre se ejecuta antes que el de un setTimeout de 0ms, aunque ambos estuvieran «listos» en el mismo instante.",
  },
];
