import React, { useState } from "react";
import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import TaskKanbanColumn from "./TaskKanbanColumn";
import TaskCard, { type Task, type TaskTag } from "./TaskCard";

export default function TaskKanbanView({
    tasks,
    onTaskMove,
    onAddTask,
    activeTag,
}: {
    tasks: Task[];
    onTaskMove: (taskId: number, newStatus: string, newIndex?: number) => void;
    onAddTask: (title: string, status: string) => void;
    activeTag: TaskTag;
}) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const filteredTasks = tasks.filter((task) =>
        activeTag === "all" ? true : task.tags.includes(activeTag)
    );

    const todoTasks = filteredTasks.filter((task) => task.status === "todo");
    const inProgressTasks = filteredTasks.filter(
        (task) => task.status === "in-progress"
    );
    const reviewTasks = filteredTasks.filter(
        (task) => task.status === "review"
    );
    const doneTasks = filteredTasks.filter((task) => task.status === "done");

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find((t) => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeTask = tasks.find((t) => t.id === activeId);
        const overTask = tasks.find((t) => t.id === overId);

        if (!activeTask) return;

        const isActiveATask = activeTask !== undefined;
        const isOverATask = overTask !== undefined;

        if (!isActiveATask) return;

        // Task over task
        if (isActiveATask && isOverATask) {
            if (activeTask.status !== overTask.status) {
                onTaskMove(Number(activeId), overTask.status);
            }
        }

        const isOverAColumn = [
            "todo",
            "in-progress", 
            "review",
            "done",
        ].includes(String(overId));

        // Task over column
        if (isActiveATask && isOverAColumn) {
            onTaskMove(Number(activeId), String(overId));
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeTask = tasks.find((t) => t.id === activeId);
        const overTask = tasks.find((t) => t.id === overId);

        if (!activeTask) return;

        const isActiveATask = activeTask !== undefined;
        const isOverATask = overTask !== undefined;

        if (!isActiveATask) return;

        // Task over task - 같은 컬럼 내에서 순서 변경
        if (isActiveATask && isOverATask && activeTask.status === overTask.status) {
            const activeIndex = tasks
                .filter((t) => t.status === activeTask.status)
                .findIndex((t) => t.id === activeId);
            const overIndex = tasks
                .filter((t) => t.status === overTask.status)
                .findIndex((t) => t.id === overId);

            if (activeIndex !== overIndex) {
                onTaskMove(Number(activeId), activeTask.status, overIndex);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 h-full overflow-x-auto pb-4">
                <TaskKanbanColumn
                    id="todo"
                    title="할 일"
                    tasks={todoTasks}
                    status="todo"
                    onAddTask={onAddTask}
                />
                <TaskKanbanColumn
                    id="in-progress"
                    title="진행 중"
                    tasks={inProgressTasks}
                    status="in-progress"
                    onAddTask={onAddTask}
                />
                <TaskKanbanColumn
                    id="review"
                    title="리뷰"
                    tasks={reviewTasks}
                    status="review"
                    onAddTask={onAddTask}
                />
                <TaskKanbanColumn
                    id="done"
                    title="완료"
                    tasks={doneTasks}
                    status="done"
                    onAddTask={onAddTask}
                />
            </div>
            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
} 