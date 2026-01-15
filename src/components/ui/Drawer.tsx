import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

type DrawerProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
};

export function Drawer({ open, onClose, title, children, footer }: DrawerProps) {
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCloseRef.current();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => {
            document.body.style.overflow = original;
            window.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur"
                onClick={onClose}
                aria-label="Close filters overlay"
            />
            <div
                className="relative w-full max-w-xl translate-y-0 animate-slide-up motion-reduce:animate-none"
                style={{
                    maxHeight: "calc(100dvh - 16px)",
                }}
            >
                <div className="flex items-center justify-between border-b border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
                    <div className="text-sm font-semibold text-[var(--text)]">{title ?? "Filters"}</div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
                <div
                    className="overflow-y-auto bg-white/10 px-4 py-3 backdrop-blur-xl"
                    style={{ maxHeight: "calc(100dvh - 16px)", WebkitOverflowScrolling: "touch" }}
                >
                    {children}
                </div>
                <div className="border-t border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                    {footer ?? (
                        <Button className="w-full" onClick={onClose}>
                            Apply
                        </Button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
