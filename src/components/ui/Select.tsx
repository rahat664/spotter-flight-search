import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, Props>(function SelectComponent(
    { className, children, ...props },
    ref
) {
    return (
        <select
            ref={ref}
            className={cn(
                "w-full rounded-[var(--radius-sm)] border border-white/20 bg-white/5 px-3 py-2 text-sm text-[var(--text)] shadow-[var(--shadow-soft)] shadow-inner/30 backdrop-blur transition focus:border-[var(--neon-cyan)] focus:bg-white/8 focus:outline-none focus:ring-2 focus:ring-[var(--neon-cyan)]/40 disabled:cursor-not-allowed disabled:opacity-60",
                className
            )}
            {...props}
        >
            {children}
        </select>
    );
});
