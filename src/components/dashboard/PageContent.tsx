import { cn } from "@/lib/utils";
import React from "react";

interface PageContentProps {
    children: React.ReactNode;
    className?: string;
}

export default function PageContent({ children, className }: PageContentProps) {
    return (
        <div className={cn(
            "bg-[var(--background)]",
            "scrollbar-container will-change-scroll",
            "flex-[8] h-full overflow-y-auto relative",
            className
        )}>
            {children}
        </div>
    );
} 