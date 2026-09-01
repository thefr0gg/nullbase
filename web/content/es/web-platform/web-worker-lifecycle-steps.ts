import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A web worker's spawn -> postMessage exchange -> terminate lifecycle —
 *  colocated per the interactive system's authoring convention. */
export const webWorkerLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Hilo principal",
    title: "Crear el worker",
    description:
      "El hilo principal crea un Worker, apuntándolo a un archivo JavaScript separado. El navegador comienza a ejecutar ese archivo en su propio hilo a nivel de sistema operativo, en paralelo con el hilo principal — no encolado en él.",
    detail: 'const worker = new Worker("crunch-numbers.js");',
  },
  {
    actor: "Hilo principal",
    title: "Enviar datos",
    description:
      "La única forma de comunicarse con un worker es postMessage — no hay memoria compartida ni llamadas directas a funciones. Los datos pasados de esta forma se copian (clonación estructurada) por defecto, no se comparten, así que modificarlos en un lado nunca afecta al otro.",
    detail: 'worker.postMessage({ numbers: [1, 2, 3, /* ...100000 more */] });',
  },
  {
    actor: "Worker",
    title: "Recibir y calcular",
    description:
      "El propio script del worker escucha el evento message y hace el trabajo real — por mucho que tarde, la interfaz del hilo principal permanece responsiva todo el tiempo, ya que esto se ejecuta en un hilo completamente distinto.",
    detail: 'self.onmessage = (e) => {\n  const result = e.data.numbers.reduce((a, b) => a + b);\n  self.postMessage({ result });\n};',
  },
  {
    actor: "Hilo principal",
    title: "Recibir el resultado",
    description:
      "El propio evento message del hilo principal se dispara con lo que el worker haya devuelto — este es el viaje de ida y vuelta completo: sin estado compartido, solo mensajes copiados a través de un límite en ambas direcciones.",
    detail: 'worker.onmessage = (e) => console.log(e.data.result);',
  },
  {
    actor: "Hilo principal",
    title: "Terminar cuando ya no se necesite",
    description:
      "Un worker sigue en ejecución (y consumiendo un hilo) hasta que se detiene explícitamente — o bien el worker llama a self.close(), o el hilo principal llama a worker.terminate(). Olvidar esto es una fuga de recursos real en apps de larga duración que crean workers repetidamente.",
    detail: "worker.terminate();",
  },
];
