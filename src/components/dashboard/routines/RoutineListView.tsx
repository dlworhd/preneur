import React from "react";
import { Timer, CircleDashedIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Routine } from "./RoutineCard";
import { StatusIcon, getStatusText } from "@/components/dashboard/common/StatusIcon";
import { getPriorityColor } from "@/components/dashboard/common/PriorityIcon";

interface RoutineListViewProps {
    routines: Routine[];
}

export default function RoutineListView({ routines }: RoutineListViewProps) {
    const getTagColor = (tag: string) => {
        switch (tag) {
            case "routine":
                return "bg-[var(--blue-100)] text-[var(--blue-800)]";
            default:
                return "bg-[var(--gray-100)] text-[var(--gray-800)]";
        }
    };

    const renderRoutineRow = (routine: Routine) => (
        <div
            key={routine.id}
            className={cn(
                "text-sm",
                "hover:bg-amber-100/10 text-[var(--secondary)]",
                "flex h-[40px] p-2 border-b border-[var(--container-border)]"
            )}
        >
            <div className="flex items-center flex-[0.5]">
                <StatusIcon status={routine.status} />
            </div>
            <div className="flex items-center flex-[4.5] cursor-pointer">
                <div className="w-full">
                    <div className="truncate font-medium text-sm">{routine.title}</div>
                    <div className="text-xs opacity-60 truncate">
                        {routine.description}
                    </div>
                </div>
            </div>
            <div className="flex items-center flex-[1.5] cursor-pointer">
                <div className="flex gap-1">
                    <span
                        className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            getTagColor("routine")
                        )}
                    >
                        routine
                    </span>
                    {routine.time && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--green-100)] text-[var(--green-800)]">
                            {routine.time}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex justify-center items-center flex-[1] cursor-pointer">
                {routine.progress && routine.target ? (
                    <span className="text-xs">
                        {routine.progress}/{routine.target} {routine.unit}
                    </span>
                ) : (
                    <span className="text-xs">{getStatusText(routine.status)}</span>
                )}
            </div>
            <div className="flex justify-center items-center flex-[1] cursor-pointer text-xs">
                {routine.assignee || "없음"}
            </div>
            <div className="flex justify-end items-center flex-[1] cursor-pointer text-xs opacity-60">
                {new Date(routine.dueDate).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* 시간이 있는 루틴들 */}
            {routines.filter((r) => r.time).length > 0 && (
                <div>
                    <div className="px-2 py-3 border-b border-[var(--container-border)] bg-[var(--background)] sticky top-0 z-10">
                        <h3 className="text-sm font-medium text-[var(--secondary)] flex items-center gap-2">
                            <Timer width={16} height={16} />
                            시간 예약 루틴
                            <span className="text-xs opacity-60">
                                ({routines.filter((r) => r.time).length}개)
                            </span>
                        </h3>
                    </div>
                    {routines
                        .filter((routine) => routine.time)
                        .sort((a, b) => {
                            if (!a.time || !b.time) return 0;
                            return a.time.localeCompare(b.time);
                        })
                        .map(renderRoutineRow)}
                </div>
            )}

            {/* 시간이 없는 루틴들 */}
            {routines.filter((r) => !r.time).length > 0 && (
                <div>
                    <div className="px-2 py-3 border-b border-[var(--container-border)] bg-[var(--background)] sticky top-0 z-10">
                        <h3 className="text-sm font-medium text-[var(--secondary)] flex items-center gap-2">
                            <CircleDashedIcon width={16} height={16} />
                            일반 루틴
                            <span className="text-xs opacity-60">
                                ({routines.filter((r) => !r.time).length}개)
                            </span>
                        </h3>
                    </div>
                    {routines
                        .filter((routine) => !routine.time)
                        .map(renderRoutineRow)}
                </div>
            )}

            {routines.length === 0 && (
                <div className="text-center py-12 text-[var(--secondary)] opacity-40">
                    <p>등록된 루틴이 없습니다.</p>
                </div>
            )}
        </div>
    );
} 