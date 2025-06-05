import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function Container({ className, ...props }: ContainerProps) {
    return (
        <div
            className={cn(
                "relative top-0 left-sidebar w-container h-container border border-container",
                className
            )}
            {...props}
        />
    );
}
