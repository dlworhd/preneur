import { AlertCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type PriorityType = "high" | "medium" | "low";

interface PriorityIconProps {
    priority: PriorityType;
    size?: number;
}

export function PriorityIcon({ priority, size = 16 }: PriorityIconProps) {
    switch (priority) {
        case "high":
            return (
                <AlertCircle
                    width={size}
                    height={size}
                    className="text-[var(--icon-error)]"
                />
            );
        case "medium":
            return (
                <Circle
                    width={size}
                    height={size}
                    className="text-[var(--icon-warning)]"
                />
            );
        case "low":
            return (
                <Circle
                    width={size}
                    height={size}
                    className="text-[var(--icon-success)]"
                />
            );
        default:
            return (
                <Circle
                    width={size}
                    height={size}
                    className="text-[var(--icon-muted)]"
                />
            );
    }
}

export function getPriorityText(priority: PriorityType): string {
    switch (priority) {
        case "high":
            return "높음";
        case "medium":
            return "보통";
        case "low":
            return "낮음";
        default:
            return priority;
    }
}

export function getPriorityColor(priority: PriorityType): string {
    switch (priority) {
        case "high":
            return "bg-red-100 text-red-800";
        case "medium":
            return "bg-yellow-100 text-yellow-800";
        case "low":
            return "bg-green-100 text-green-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
} 