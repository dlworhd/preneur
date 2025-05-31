import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps {
    className?: string;
    children: React.ReactNode;
    onClick: () => void;
}

export default function Button({ className, children, onClick }: ButtonProps) {
    return (
        <div
            className={cn(
                "bg-var(--btn-background) text-[var(--btn-primary)] cursor-pointer hover:opacity-80",
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
