import { cn } from "@/lib/utils";
import { CircleDashedIcon, CheckCircle, Circle } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type TaskTag = "task" | "all";

export interface Task {
    id: number;
    title: string;
    description: string;
    status: "todo" | "in-progress" | "review" | "done";
    priority: "high" | "medium" | "low";
    assignee: string;
    dueDate: string;
    tags: TaskTag[];
    progress?: number;
    target?: number;
    unit?: string;
    order?: number;
}

export default function TaskCard({ task }: { task: Task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "done":
                return (
                    <CheckCircle
                        width={16}
                        height={16}
                        className="text-[var(--icon-success)]"
                    />
                );
            case "in-progress":
            case "review":
                return (
                    <Circle
                        width={16}
                        height={16}
                        className="text-[var(--icon-info)]"
                    />
                );
            case "todo":
                return (
                    <CircleDashedIcon
                        width={16}
                        height={16}
                        className="text-[var(--icon-muted)]"
                    />
                );
            default:
                return (
                    <CircleDashedIcon
                        width={16}
                        height={16}
                        className="text-[var(--icon-muted)]"
                    />
                );
        }
    };

    const getTagColor = (tag: TaskTag) => {
        switch (tag) {
            case "task":
                return "bg-[var(--red-100)] text-[var(--red-800)]";
            default:
                return "bg-[var(--gray-100)] text-[var(--gray-800)]";
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "p-3 rounded-lg border border-[var(--container-border)]",
                "bg-[var(--background)] hover:bg-amber-100/10",
                "cursor-grab active:cursor-grabbing transition-colors relative",
                isDragging && "opacity-50 z-40"
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-[var(--secondary)] truncate pr-2">
                    {task.title}
                </h4>
                <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                </div>
            </div>
            <p className="text-xs text-[var(--secondary)] opacity-60 mb-3 line-clamp-2">
                {task.description}
            </p>
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    {task.tags.map((tag, index) => (
                        <span
                            key={index}
                            className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                getTagColor(tag)
                            )}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="text-xs text-[var(--secondary)] opacity-60">
                    {new Date(task.dueDate).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            </div>
            {task.progress && task.target && (
                <div className="mt-2 text-xs text-[var(--secondary)]">
                    {task.progress}/{task.target} {task.unit}
                </div>
            )}
        </div>
    );
} 