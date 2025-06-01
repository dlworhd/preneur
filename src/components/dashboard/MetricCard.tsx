import { cn } from "@/lib/utils";
import React from "react";

interface MetricCardProps {
    label: string | React.ReactNode;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    className?: string;
}

export default function MetricCard({
    label,
    value,
    icon,
    trend,
    onClick,
    onMouseEnter,
    onMouseLeave,
    className,
}: MetricCardProps) {
    return (
        <div
            className={cn(
                "border border-[var(--container-border)]",
                "rounded-lg p-4",
                "bg-[var(--background)]",
                "hover:shadow-md transition-shadow",
                onClick && "cursor-pointer hover:opacity-80",
                className
            )}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-[var(--secondary)]">
                    {label}
                </div>
                {icon}
            </div>
            <div className="text-2xl font-bold text-[var(--primary)]">
                {value}
            </div>
            {trend && (
                <div className="text-xs text-[var(--secondary)] opacity-60">
                    {trend}
                </div>
            )}
        </div>
    );
}
