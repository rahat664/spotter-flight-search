import React from "react";
import { cn } from "../../utils/cn";

type CardProps = {
    children: React.ReactNode;
    className?: string;
};

export function Card({ children, className }: CardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-white/8 backdrop-blur-xl shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                className
            )}
        >
            <div className="pointer-events-none absolute inset-px rounded-[calc(2rem/1.25)] border border-white/5 opacity-70" />
            <div className="pointer-events-none absolute inset-0 before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/10 before:to-transparent" />
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: CardProps) {
    return <div className={cn("flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4", className)}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
    return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
