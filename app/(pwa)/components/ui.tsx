import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const Card = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div
    className={cn(
      "rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm",
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("mb-4 space-y-2", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: ComponentPropsWithoutRef<"h3">) => (
  <h3 className={cn("text-xl font-semibold tracking-tight", className)} {...props} />
);

export const CardContent = ({ className, ...props }: ComponentPropsWithoutRef<"div">) => (
  <div className={cn("space-y-4 text-sm text-zinc-700", className)} {...props} />
);

export const Button = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button">>(
  ({ className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      disabled={disabled}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-10 w-full rounded-full border border-zinc-200 bg-white px-4 text-sm shadow-sm transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<"textarea">>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export const Label = ({ className, ...props }: ComponentPropsWithoutRef<"label">) => (
  <label className={cn("text-sm font-medium text-zinc-800", className)} {...props} />
);

export const Badge = ({ className, ...props }: ComponentPropsWithoutRef<"span">) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700",
      className,
    )}
    {...props}
  />
);
