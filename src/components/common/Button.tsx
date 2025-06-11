import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps {
    className?: string;
    children: React.ReactNode;
    onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
    disabled?: boolean;
    title?: string;
    type?: string;
}

export default function Button({ className, children, onClick, disabled, title, type }: ButtonProps) {
    return (
        <div
            className={cn(
                "bg-var(--btn-background) text-[var(--btn-primary)] cursor-pointer hover:opacity-80 select-none text-center",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            onClick={disabled ? undefined : onClick}
            title={title}
        >
            {children}
        </div>
    );
}
