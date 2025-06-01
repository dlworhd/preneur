import { cn } from "@/lib/utils";
import React from "react";

interface NavHeaderProps {
    className?: string;
    children: React.ReactNode;
}

export default function NavHeader({ className, children }: NavHeaderProps) {
    return <div className={cn(className)}>{children}</div>;
}
