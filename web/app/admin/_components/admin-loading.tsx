import { Loader2 } from "lucide-react";

/** Shared loading indicator for the admin panels — used while the initial
 *  fetch for a tab is in flight. */
export function AdminLoading() {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-secondary">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading…
    </div>
  );
}
