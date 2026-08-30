import type { StepFlowStep } from "@/components/interactive/StepFlow";

/** What durability actually guarantees when a database crashes mid-write —
 *  colocated per the interactive system's authoring convention. */
export const crashRecoverySteps: StepFlowStep[] = [
  {
    actor: "Client",
    title: "COMMIT is requested",
    description:
      "A transaction has made its changes in memory and now asks the database to make them permanent.",
  },
  {
    actor: "Database",
    title: "Write to the write-ahead log first",
    description:
      "Before touching the actual data files, the engine appends a record of the change to a write-ahead log (WAL) on disk — a simple, sequential, append-only file, much faster to write to reliably than scattering changes across the real data structures.",
    detail: "WAL entry: UPDATE accounts SET balance=900 WHERE id=1 (was 1000)",
  },
  {
    actor: "Database",
    title: "Flush the log to durable storage",
    description:
      "The engine calls fsync (or equivalent) to force the operating system to actually write the log entry to physical disk — not just hand it to a buffer that could still be lost on power loss. Only once this succeeds does the engine consider the transaction durable.",
  },
  {
    actor: "Database",
    title: "Acknowledge the commit",
    description:
      "Only now does the database tell the client the COMMIT succeeded. If a crash happens at any point before this step, the client never received confirmation — from its perspective, the transaction is still in doubt, which is the correct, safe outcome.",
  },
  {
    actor: "Database",
    title: "Apply changes to the real data files (later)",
    description:
      "The actual table/index data files get updated from the WAL at the engine's own pace — this can happen well after the commit was acknowledged, because the WAL entry alone is enough to reconstruct the change if needed.",
  },
  {
    actor: "Database",
    title: "Crash — and recovery",
    description:
      "If the process crashes before the data files catch up, the next startup replays the WAL from the last confirmed point — reapplying any committed change that hadn't made it to the data files yet, and discarding anything that was never fully written to the log. This is exactly how a committed transaction survives a crash, even one a split second after COMMIT returned.",
  },
];
