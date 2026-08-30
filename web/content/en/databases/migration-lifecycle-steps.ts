import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** A schema migration's life from a local change to a production database
 *  in sync with it — colocated per the interactive system's authoring
 *  convention. */
export const migrationLifecycleSteps: StepFlowStep[] = [
  {
    actor: "Developer",
    title: "Change the schema locally",
    description:
      "A new feature needs a new column, table, or index. Instead of editing the local database by hand, the change is written as a migration file — a small script describing exactly what to change.",
    detail: "0007_add_users_last_login.sql\n\nALTER TABLE users ADD COLUMN last_login_at TEXT;",
  },
  {
    actor: "Migration tool",
    title: "Track which migrations have run",
    description:
      "The migration tool keeps its own table in the database (commonly named something like schema_migrations) recording which migration files have already been applied — this is what lets it figure out exactly which NEW migrations need to run, on any database, without re-running ones already applied.",
    detail: "schema_migrations\nversion\n0005_create_orders\n0006_add_orders_index",
  },
  {
    actor: "Migration tool",
    title: "Apply new migrations, in order",
    description:
      "Running the tool locally applies every migration file newer than the last recorded version, in filename/version order — 0007 runs, and the tracking table gets a new row for it.",
  },
  {
    actor: "Team",
    title: "Commit the migration file with the code that needs it",
    description:
      "The migration file is committed to version control alongside the application code that depends on the new column — this is what keeps schema and code changes reviewed and deployed together, instead of a schema change happening out-of-band and surprising whoever deploys next.",
  },
  {
    actor: "CI / deploy process",
    title: "Apply the same migration to staging, then production",
    description:
      "The exact same migration file — not a hand-typed equivalent — runs against staging, then production, usually as an automated step before or during deployment. Every environment converges on the identical schema, in the identical order, because they all ran the identical files.",
  },
  {
    actor: "Developer",
    title: "Write a down migration too, if the tool supports it",
    description:
      "Many migration tools pair each \"up\" migration with a \"down\" one that reverses it — not because rollbacks are common, but because a deploy that has to be reverted needs the schema to be revertible too, and writing the down migration when the change is fresh is far easier than reconstructing it under pressure later.",
    detail: "-- up:   ALTER TABLE users ADD COLUMN last_login_at TEXT;\n-- down: ALTER TABLE users DROP COLUMN last_login_at;",
  },
];
