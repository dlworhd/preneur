import { cn } from "@/lib/utils";
import { Timer } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusIcon, type StatusType } from "@/components/dashboard/common/StatusIcon";
import { type PriorityType } from "@/components/dashboard/common/PriorityIcon";

export interface Routine {
    id: number;
    title: string;
    description: string;
    status: StatusType;
    priority: PriorityType;
    assignee: string;
    dueDate: string;
    progress?: number;
    target?: number;
    unit?: string;
    order?: number;
    time?: string; // HH:MM 형식
}

export default function RoutineCard({ routine }: { routine: Routine }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: routine.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
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
                    {routine.title}
                </h4>
                <div className="flex items-center gap-2">
                    <StatusIcon status={routine.status} />
                </div>
            </div>
            <p className="text-xs text-[var(--secondary)] opacity-60 mb-3 line-clamp-2">
                {routine.description}
            </p>
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--blue-100)] text-[var(--blue-800)]">
                        routine
                    </span>
                    {routine.time && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--green-100)] text-[var(--green-800)]">
                            <Timer
                                width={10}
                                height={10}
                                className="inline mr-1"
                            />
                            {routine.time}
                        </span>
                    )}
                </div>
                <div className="text-xs text-[var(--secondary)] opacity-60">
                    {new Date(routine.dueDate).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            </div>
            {routine.progress && routine.target && (
                <div className="mt-2 text-xs text-[var(--secondary)]">
                    {routine.progress}/{routine.target} {routine.unit}
                </div>
            )}
        </div>
    );
} 