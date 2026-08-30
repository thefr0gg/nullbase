"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/_components/ui";

/**
 * Shared page-number pagination for the admin list panels (Feedback,
 * Likes) — replaces the earlier "Load more" accumulate-everything pattern
 * so each page fetch loads and renders only its own chunk, not the whole
 * table so far.
 */
export function AdminPagination({
  page,
  totalPages,
  onChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="secondary"
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
        className="shrink-0 text-sm"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      <span className="shrink-0 text-xs tabular-nums text-text-secondary">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={disabled || page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
        className="shrink-0 text-sm"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </Button>
    </div>
  );
}
