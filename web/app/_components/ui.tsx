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
    // Lime fill needs dark ink text, not white — white-on-lime fails contrast.
    primary:
      "bg-electric-blue text-[#0a0a0c] border-[1.5px] border-text-primary shadow-[4px_4px_0_0_var(--shadow-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--shadow-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:ring-2 focus-visible:ring-electric-blue/40",
    secondary:
      "border-[1.5px] border-border-strong bg-surface text-text-primary shadow-[4px_4px_0_0_var(--shadow-ink-soft)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--shadow-ink-soft)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:border-electric-blue focus-visible:ring-2 focus-visible:ring-electric-blue/40",
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
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
  variant = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "default" | "feature" }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border bg-surface p-5",
        variant === "feature"
          ? "border-[1.5px] border-text-primary shadow-[8px_8px_0_0_var(--color-electric-blue)]"
          : "border-border shadow-card",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}