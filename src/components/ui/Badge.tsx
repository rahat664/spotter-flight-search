import { cn } from "../../utils/cn";

type Props = {
    children: React.ReactNode;
    className?: string;
    tone?: "solid" | "soft";
} & React.HTMLAttributes<HTMLSpanElement>;

export function Badge({ children, className, tone = "solid", ...props }: Props) {
    const styles =
        tone === "solid"
            ? "border border-[var(--neon-cyan)] text-[var(--text)] shadow-[0_0_12px_rgba(34,211,238,0.4)]"
            : "border border-white/30 text-[var(--text)] bg-white/5";
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur",
                styles,
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
