import { CircleDashedIcon, CheckCircle, Circle } from "lucide-react";

export type StatusType = "todo" | "in-progress" | "review" | "done";

interface StatusIconProps {
    status: StatusType;
    size?: number;
}

export function StatusIcon({ status, size = 16 }: StatusIconProps) {
    switch (status) {
        case "done":
            return (
                <CheckCircle
                    width={size}
                    height={size}
                    className="text-[var(--icon-success)]"
                />
            );
        case "in-progress":
        case "review":
            return (
                <Circle
                    width={size}
                    height={size}
                    className="text-[var(--icon-info)]"
                />
            );
        case "todo":
            return (
                <CircleDashedIcon
                    width={size}
                    height={size}
                    className="text-[var(--icon-muted)]"
                />
            );
        default:
            return (
                <CircleDashedIcon
                    width={size}
                    height={size}
                    className="text-[var(--icon-muted)]"
                />
            );
    }
}

export function getStatusText(status: StatusType): string {
    switch (status) {
        case "todo":
            return "할 일";
        case "in-progress":
            return "진행 중";
        case "review":
            return "검토";
        case "done":
            return "완료";
        default:
            return status;
    }
} 