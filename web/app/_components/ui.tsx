import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary:
      "bg-electric-blue text-white shadow-[0_4px_0_0_rgba(23,23,26,0.15)] hover:translate-y-[-1px] hover:shadow-[0_6px_0_0_rgba(23,23,26,0.15)] active:translate-y-[1px] active:shadow-[0_2px_0_0_rgba(23,23,26,0.15)] focus-visible:ring-2 focus-visible:ring-electric-blue/40",
    secondary:
      "border border-border bg-surface text-text-primary shadow-[0_4px_0_0_rgba(23,23,26,0.08)] hover:translate-y-[-1px] hover:shadow-[0_6px_0_0_rgba(23,23,26,0.08)] active:translate-y-[1px] active:shadow-[0_2px_0_0_rgba(23,23,26,0.08)] hover:bg-border focus-visible:ring-2 focus-visible:ring-electric-blue/40",
    ghost:
      "text-text-secondary hover:bg-surface/80 hover:text-text-primary",
  };
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all duration-150 disabled:opacity-60 disabled:shadow-none",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export type BadgeColor =
  | "default"
  | "blue"
  | "green"
  | "red"
  | "orange"
  | "purple";

export function Badge({
  children,
  className,
  color = "default",
}: {
  children: ReactNode;
  className?: string;
  color?: BadgeColor;
}) {
  const styles: Record<BadgeColor, string> = {
    default: "bg-surface/70 text-text-secondary",
    blue: "bg-electric-blue/12 text-electric-blue",
    green: "bg-success/15 text-success",
    red: "bg-danger/15 text-danger",
    orange: "bg-tangerine/15 text-tangerine",
    purple: "bg-violet/15 text-violet",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
        styles[color],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-surface p-5 shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}