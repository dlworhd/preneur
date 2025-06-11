import { cn } from "@/lib/utils";
import React from "react";

interface PageHeaderProps {
    title: string;
    children?: React.ReactNode;
    className?: string;
}

export default function PageHeader({ title, children, className }: PageHeaderProps) {
    return (
        <div className={cn(
            "border-b border-[var(--container-border)]",
            "flex items-center justify-between",
            "h-12 px-4",
            className
        )}>
            <span className="m font-medium">
                {title}
            </span>
            {children}
        </div>
    );
} 