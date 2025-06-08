import React from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Routine } from "./RoutineCard";
import { StatusIcon, getStatusText } from "@/components/dashboard/common/StatusIcon";
import { getPriorityColor } from "@/components/dashboard/common/PriorityIcon";

interface RoutineListViewProps {
    routines: Routine[];
}

export default function RoutineListView({ routines }: RoutineListViewProps) {


    return (
        <div className="space-y-2">
            {routines.map((routine) => (
                <div
                    key={routine.id}
                    className="p-4 border border-[var(--container-border)] rounded-lg bg-[var(--background)] hover:bg-amber-100/10 transition-colors"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <StatusIcon status={routine.status} />
                                <h3 className="text-sm font-medium text-[var(--secondary)] truncate">
                                    {routine.title}
                                </h3>
                                <span
                                    className={cn(
                                        "text-xs px-2 py-0.5 rounded-full",
                                        getPriorityColor(routine.priority)
                                    )}
                                >
                                    {routine.priority}
                                </span>
                            </div>
                            <p className="text-xs text-[var(--secondary)] opacity-60 mb-3 line-clamp-2">
                                {routine.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-[var(--secondary)] opacity-60">
                                <span>상태: {getStatusText(routine.status)}</span>
                                <span>담당자: {routine.assignee || "없음"}</span>
                                <span>
                                    마감일:{" "}
                                    {new Date(routine.dueDate).toLocaleDateString(
                                        "ko-KR"
                                    )}
                                </span>
                                {routine.time && (
                                    <span className="flex items-center gap-1">
                                        <Timer width={12} height={12} />
                                        {routine.time}
                                    </span>
                                )}
                            </div>
                            {routine.progress && routine.target && (
                                <div className="mt-2 text-xs text-[var(--secondary)]">
                                    진행률: {routine.progress}/{routine.target}{" "}
                                    {routine.unit}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-1 ml-4">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--blue-100)] text-[var(--blue-800)]">
                                routine
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            {routines.length === 0 && (
                <div className="text-center py-12 text-[var(--secondary)] opacity-40">
                    <p>등록된 루틴이 없습니다.</p>
                </div>
            )}
        </div>
    );
} 