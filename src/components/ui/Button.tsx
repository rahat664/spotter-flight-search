import { cn } from "../../utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
};

const base =
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--neon-cyan)] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.985] motion-reduce:transition-none";

const variantStyles: Record<Variant, string> = {
    primary:
        "bg-gradient-to-r from-[var(--hero-from)] to-[var(--hero-to)] text-white shadow-[0_0_12px_rgba(34,211,238,0.25)] hover:shadow-[0_0_18px_rgba(34,211,238,0.28)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[0_0_10px_rgba(34,211,238,0.18)] motion-reduce:hover:shadow-none motion-reduce:active:translate-y-0",
    secondary:
        "border border-white/12 bg-white/6 text-[var(--text)] backdrop-blur hover:border-white/20 hover:bg-white/10 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:translate-y-[0.5px] motion-reduce:hover:shadow-none",
    ghost: "text-[var(--text)] hover:bg-white/5 active:translate-y-[0.5px] motion-reduce:active:translate-y-0",
};

const sizeStyles: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
};

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: Props) {
    return <button type={type} className={cn(base, variantStyles[variant], sizeStyles[size], className)} {...props} />;
}
