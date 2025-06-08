import React, { useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent, DragOverEvent } from "@dnd-kit/core";
import RoutineKanbanColumn from "./RoutineKanbanColumn";
import RoutineCard, { type Routine } from "./RoutineCard";

interface RoutineKanbanViewProps {
    routines: Routine[];
    onRoutineMove: (routineId: number, newStatus: string, newIndex?: number) => void;
    onAddRoutine: (title: string, status: string) => void;
}

export default function RoutineKanbanView({
    routines,
    onRoutineMove,
    onAddRoutine,
}: RoutineKanbanViewProps) {
    const [activeId, setActiveId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

    const columns = [
        { id: "todo", title: "할 일", status: "todo" },
        { id: "in-progress", title: "진행 중", status: "in-progress" },
        { id: "review", title: "검토", status: "review" },
        { id: "done", title: "완료", status: "done" },
    ];

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(Number(event.active.id));
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = Number(active.id);
        const overId = over.id;

        // 같은 아이템이면 무시
        if (activeId === overId) return;

        const activeRoutine = routines.find((r) => r.id === activeId);
        const overRoutine = routines.find((r) => r.id === Number(overId));

        if (!activeRoutine) return;

        // 컬럼 간/내 이동 (카드 위에 드롭)
        if (overRoutine) {
            const overStatusRoutines = routines
                .filter((routine) => routine.status === overRoutine.status)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            const overIndex = overStatusRoutines.findIndex((r) => r.id === Number(overId));
            
            // 다른 컬럼으로 이동하는 경우 해당 카드 위치에 정확히 삽입
            if (activeRoutine.status !== overRoutine.status) {
                onRoutineMove(activeId, overRoutine.status, overIndex);
            }
            // 같은 컬럼 내에서 순서 변경
            else {
                const activeIndex = overStatusRoutines.findIndex((r) => r.id === activeId);
                if (activeIndex !== overIndex) {
                    onRoutineMove(activeId, overRoutine.status, overIndex);
                }
            }
        }
        // 컬럼으로 직접 드롭 (빈 컬럼 또는 컬럼 끝)
        else if (["todo", "in-progress", "review", "done"].includes(overId as string)) {
            const newStatus = columns.find((col) => col.id === overId)?.status;
            if (newStatus && activeRoutine.status !== newStatus) {
                const targetColumnRoutines = routines.filter((r) => r.status === newStatus);
                onRoutineMove(activeId, newStatus, targetColumnRoutines.length);
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        // 모든 드래그 로직은 handleDragOver에서 처리됩니다
    };

    // handleAddRoutine은 props에서 전달받은 함수를 사용합니다

    const activeRoutine = routines.find((routine) => routine.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-2 h-full overflow-x-auto p-2">
                {columns.map((column) => (
                    <RoutineKanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        routines={routines
                            .filter((routine) => routine.status === column.status)
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                        }
                        status={column.status}
                        onAddRoutine={onAddRoutine}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeRoutine ? <RoutineCard routine={activeRoutine} /> : null}
            </DragOverlay>
        </DndContext>
    );
} 