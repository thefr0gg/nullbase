import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** La vida de una migración de esquema desde un cambio local hasta una base
 *  de datos de producción sincronizada con él — colocalizado según la
 *  convención de autoría del sistema interactivo. */
export const migrationLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Desarrollador",
    title: "Cambiar el esquema localmente",
    description:
      "Una nueva funcionalidad necesita una columna, tabla, o índice nuevo. En lugar de editar la base de datos local a mano, el cambio se escribe como un archivo de migración — un script pequeño que describe exactamente qué cambiar.",
    detail: "0007_add_users_last_login.sql\n\nALTER TABLE users ADD COLUMN last_login_at TEXT;",
  },
  {
    actor: "Herramienta de migración",
    title: "Registrar qué migraciones se han ejecutado",
    description:
      "La herramienta de migración mantiene su propia tabla en la base de datos (comúnmente llamada algo como schema_migrations) registrando qué archivos de migración ya se han aplicado — esto es lo que le permite averiguar exactamente qué migraciones NUEVAS necesitan ejecutarse, en cualquier base de datos, sin volver a ejecutar las ya aplicadas.",
    detail: "schema_migrations\nversion\n0005_create_orders\n0006_add_orders_index",
  },
  {
    actor: "Herramienta de migración",
    title: "Aplicar migraciones nuevas, en orden",
    description:
      "Ejecutar la herramienta localmente aplica cada archivo de migración más reciente que la última versión registrada, en orden de nombre de archivo/versión — 0007 se ejecuta, y la tabla de seguimiento recibe una fila nueva para ella.",
  },
  {
    actor: "Equipo",
    title: "Confirmar el archivo de migración junto con el código que lo necesita",
    description:
      "El archivo de migración se confirma en el control de versiones junto con el código de la aplicación que depende de la columna nueva — esto es lo que mantiene revisados y desplegados juntos los cambios de esquema y de código, en lugar de que un cambio de esquema ocurra fuera de banda y sorprenda a quien despliegue después.",
  },
  {
    actor: "CI / proceso de despliegue",
    title: "Aplicar la misma migración a staging, y luego a producción",
    description:
      "Exactamente el mismo archivo de migración — no un equivalente escrito a mano — se ejecuta contra staging, y luego producción, normalmente como un paso automatizado antes o durante el despliegue. Cada entorno converge en el esquema idéntico, en el orden idéntico, porque todos ejecutaron los archivos idénticos.",
  },
  {
    actor: "Desarrollador",
    title: "Escribir también una migración down, si la herramienta lo soporta",
    description:
      "Muchas herramientas de migración emparejan cada migración \"up\" con una \"down\" que la revierte — no porque los rollbacks sean comunes, sino porque un despliegue que tiene que revertirse necesita que el esquema también sea reversible, y escribir la migración down cuando el cambio está fresco es mucho más fácil que reconstruirla bajo presión más tarde.",
    detail: "-- up:   ALTER TABLE users ADD COLUMN last_login_at TEXT;\n-- down: ALTER TABLE users DROP COLUMN last_login_at;",
  },
];
