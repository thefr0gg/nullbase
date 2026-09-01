import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** Lo que la durabilidad realmente garantiza cuando una base de datos falla
 *  a mitad de una escritura — colocalizado según la convención de autoría
 *  del sistema interactivo. */
export const crashRecoverySteps: StepFlowStep[] = [
  {
    actor: "Cliente",
    title: "Se solicita el COMMIT",
    description:
      "Una transacción ha hecho sus cambios en memoria y ahora le pide a la base de datos que los haga permanentes.",
  },
  {
    actor: "Base de datos",
    title: "Escribir primero en el write-ahead log",
    description:
      "Antes de tocar los archivos de datos reales, el motor añade un registro del cambio a un write-ahead log (WAL) en disco — un archivo simple, secuencial y de solo anexado, mucho más rápido de escribir de forma confiable que dispersar cambios por las estructuras de datos reales.",
    detail: "Entrada del WAL: UPDATE accounts SET balance=900 WHERE id=1 (was 1000)",
  },
  {
    actor: "Base de datos",
    title: "Volcar el log a almacenamiento duradero",
    description:
      "El motor llama a fsync (o equivalente) para forzar al sistema operativo a escribir realmente la entrada del log en disco físico — no solo entregarla a un búfer que aún podría perderse por un corte de energía. Solo una vez que esto tiene éxito el motor considera la transacción duradera.",
  },
  {
    actor: "Base de datos",
    title: "Confirmar el commit",
    description:
      "Solo ahora le dice la base de datos al cliente que el COMMIT tuvo éxito. Si ocurre un fallo en cualquier punto antes de este paso, el cliente nunca recibió confirmación — desde su perspectiva, la transacción sigue en duda, lo cual es el resultado correcto y seguro.",
  },
  {
    actor: "Base de datos",
    title: "Aplicar los cambios a los archivos de datos reales (después)",
    description:
      "Los archivos de datos de tablas/índices reales se actualizan a partir del WAL al propio ritmo del motor — esto puede ocurrir bastante después de que el commit fue confirmado, porque la entrada del WAL por sí sola es suficiente para reconstruir el cambio si es necesario.",
  },
  {
    actor: "Base de datos",
    title: "Fallo — y recuperación",
    description:
      "Si el proceso falla antes de que los archivos de datos se pongan al día, el siguiente arranque reproduce el WAL desde el último punto confirmado — reaplicando cualquier cambio confirmado que no hubiera llegado aún a los archivos de datos, y descartando cualquier cosa que nunca se escribiera completamente en el log. Así es exactamente como una transacción confirmada sobrevive a un fallo, incluso uno una fracción de segundo después de que COMMIT retornara.",
  },
];
