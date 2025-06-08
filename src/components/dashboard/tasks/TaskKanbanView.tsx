import React, { useState } from "react";
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import TaskCard, { type Task, type TaskTag } from "./TaskCard";
import TaskKanbanColumn from "./TaskKanbanColumn";

interface TaskKanbanViewProps {
    tasks: Task[];
    onTaskMove: (taskId: number, newStatus: string, newIndex?: number) => void;
    onAddTask: (title: string, status: string) => void;
    activeTag: TaskTag;
}

export default function TaskKanbanView({
    tasks,
    onTaskMove,
    onAddTask,
    activeTag,
}: TaskKanbanViewProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

    const filteredTasks = tasks.filter(
        (task) => activeTag === "all" || task.tags.includes(activeTag)
    );

    const todoTasks = filteredTasks
        .filter((task) => task.status === "todo")
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    const inProgressTasks = filteredTasks
        .filter((task) => task.status === "in-progress")
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    const reviewTasks = filteredTasks
        .filter((task) => task.status === "review")
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    const doneTasks = filteredTasks
        .filter((task) => task.status === "done")
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = filteredTasks.find((t) => t.id === active.id);
        setActiveTask(task || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // 같은 아이템이면 무시
        if (activeId === overId) return;

        // 활성 작업과 오버 작업 찾기
        const activeTask = filteredTasks.find((task) => task.id === activeId);
        const overTask = filteredTasks.find((task) => task.id === overId);

        if (!activeTask) return;

        // 컬럼 간/내 이동 (카드 위에 드롭)
        if (overTask) {
            const overStatusTasks = filteredTasks
                .filter((task) => task.status === overTask.status)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            const overIndex = overStatusTasks.findIndex((task) => task.id === overId);
            
            // 다른 컬럼으로 이동하는 경우 해당 카드 위치에 정확히 삽입
            if (activeTask.status !== overTask.status) {
                onTaskMove(Number(activeId), overTask.status, overIndex);
            }
            // 같은 컬럼 내에서 순서 변경
            else {
                const activeIndex = overStatusTasks.findIndex((task) => task.id === activeId);
                if (activeIndex !== overIndex) {
                    onTaskMove(Number(activeId), overTask.status, overIndex);
                }
            }
        }
        // 컬럼으로 직접 드롭 (빈 컬럼 또는 컬럼 끝)
        else if (["todo", "in-progress", "review", "done"].includes(overId as string)) {
            if (activeTask.status !== overId) {
                // 다른 컬럼으로 이동 시 맨 마지막에 추가
                const targetColumnTasks = filteredTasks.filter(
                    (task) => task.status === overId
                );
                onTaskMove(Number(activeId), overId as string, targetColumnTasks.length);
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        // 모든 드래그 로직은 handleDragOver에서 처리됩니다
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-2 h-full overflow-x-auto p-2">
                <TaskKanbanColumn
                    id="todo"
                    title="To Do"
                    tasks={todoTasks}
                    status="todo"
                    onAddTask={onAddTask}
                />
                <TaskKanbanColumn
                    id="in-progress"
                    title="In Progress"
                    tasks={inProgressTasks}
                    status="in-progress"
                    onAddTask={onAddTask}
                />
                <TaskKanbanColumn
                    id="review"
                    title="Review"
                    tasks={reviewTasks}
                    status="review"
                    onAddTask={onAddTask}
                />
                <TaskKanbanColumn
                    id="done"
                    title="Done"
                    tasks={doneTasks}
                    status="done"
                    onAddTask={onAddTask}
                />
            </div>
            <DragOverlay>
                {activeTask ? (
                    <div
                        className={cn(
                            "p-3 rounded-lg border border-[var(--container-border)]",
                            "bg-[var(--background)] shadow-lg rotate-3",
                            "z-50 relative"
                        )}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium text-[var(--secondary)] truncate pr-2">
                                {activeTask.title}
                            </h4>
                        </div>
                        <p className="text-xs text-[var(--secondary)] opacity-60 line-clamp-2">
                            {activeTask.description}
                        </p>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
} 