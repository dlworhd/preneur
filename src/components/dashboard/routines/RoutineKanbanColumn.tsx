import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import RoutineCard, { type Routine } from "./RoutineCard";
import { StatusIcon, type StatusType } from "@/components/dashboard/common/StatusIcon";

interface RoutineKanbanColumnProps {
    id: string;
    title: string;
    routines: Routine[];
    status: string;
    onAddRoutine: (title: string, status: string) => void;
}

export default function RoutineKanbanColumn({
    id,
    title,
    routines,
    status,
    onAddRoutine,
}: RoutineKanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });
    const [isSticky, setIsSticky] = useState(false);
    const [showAddRoutine, setShowAddRoutine] = useState(false);
    const [newRoutineTitle, setNewRoutineTitle] = useState("");
    const headerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsSticky(!entry.isIntersecting);
            },
            { threshold: 1 }
        );

        if (headerRef.current) {
            observer.observe(headerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleAddRoutine = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRoutineTitle.trim()) {
            onAddRoutine(newRoutineTitle.trim(), status);
            setNewRoutineTitle("");
            setShowAddRoutine(false);
        }
    };



    return (
        <div className="flex-1 min-w-0 flex flex-col border border-[var(--container-border)] rounded-2xl h-full">
            <div className="bg-[var(--background)] p-3 flex-shrink-0 border-b border-[var(--container-border)] rounded-t-2xl">
                <h3 className="text-sm font-medium text-[var(--secondary)] flex items-center gap-2">
                    <StatusIcon status={status as StatusType} />
                    {title}
                    <span className="text-xs opacity-60">({routines.length})</span>
                </h3>
            </div>
            <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                <SortableContext
                    items={routines.map((routine) => routine.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {routines.map((routine) => (
                        <RoutineCard key={routine.id} routine={routine} />
                    ))}
                </SortableContext>
                {routines.length > 0 && <div ref={setNodeRef} />}

                {/* Add Routine Area */}
                <div className="relative">
                    {showAddRoutine ? (
                        <form
                            onSubmit={handleAddRoutine}
                            className="p-3 border-2 border-dashed border-[var(--primary)] rounded-lg bg-[var(--background)]"
                        >
                            <input
                                type="text"
                                value={newRoutineTitle}
                                onChange={(e) =>
                                    setNewRoutineTitle(e.target.value)
                                }
                                placeholder="새 루틴 제목을 입력하세요..."
                                className="w-full text-sm bg-transparent border-none outline-none text-[var(--secondary)] placeholder-[var(--secondary)] placeholder-opacity-60"
                                autoFocus
                                onBlur={() => {
                                    if (!newRoutineTitle) setShowAddRoutine(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        setNewRoutineTitle("");
                                        setShowAddRoutine(false);
                                    }
                                }}
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    type="submit"
                                    className="text-xs px-2 py-1 bg-[var(--primary)] text-white rounded hover:opacity-80"
                                >
                                    추가
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewRoutineTitle("");
                                        setShowAddRoutine(false);
                                    }}
                                    className="text-xs px-2 py-1 text-[var(--secondary)] opacity-60 hover:opacity-100"
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div
                            className="p-3 border-2 border-dashed border-transparent rounded-lg hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all cursor-pointer"
                            onClick={() => setShowAddRoutine(true)}
                        >
                            <div className="text-center text-xs text-[var(--secondary)] opacity-40 hover:opacity-60">
                                <PlusIcon
                                    width={16}
                                    height={16}
                                    className="mx-auto mb-1"
                                />
                                새 루틴 추가
                            </div>
                        </div>
                    )}
                </div>
                {routines.length === 0 && <div ref={setNodeRef} className="h-8" />}
            </div>
        </div>
    );
} 