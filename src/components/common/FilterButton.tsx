import { cn } from "@/lib/utils";
import React from "react";

interface FilterButtonProps {
    id: string;
    label: string;
    icon?: React.ReactNode;
    isActive: boolean;
    onClick: (id: string) => void;
    className?: string;
}

export default function FilterButton({
    id,
    label,
    icon,
    isActive,
    onClick,
    className,
}: FilterButtonProps) {
    return (
        <button
            onClick={() => onClick(id)}
            className={cn(
                "flex items-center gap-2",
                "text-sm font-medium px-3 py-1",
                "rounded-md transition-colors",
                isActive
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--secondary)] hover:bg-amber-100/10",
                className
            )}
        >
            {icon}
            {label}
        </button>
    );
}
