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
    <div className="flex items-center justify-between gap-3">
      <Button
        variant="secondary"
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
        className="text-sm"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        Previous
      </Button>
      <span className="text-xs tabular-nums text-text-secondary">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={disabled || page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="text-sm"
      >
        Next
        <ChevronRight className="h-4 w-4 rtl:rotate-180" />
      </Button>
    </div>
  );
}
