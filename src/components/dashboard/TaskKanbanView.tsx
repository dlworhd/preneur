import React from "react";
import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
    const [activeId, setActiveId] = React.useState<number | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const filteredTasks = tasks.filter(
        (task) => activeTag === "all" || task.tags.includes(activeTag)
    );

    const columns = [
        {
            id: "todo",
            title: "To Do",
            status: "todo",
            tasks: filteredTasks.filter((task) => task.status === "todo"),
        },
        {
            id: "in-progress",
            title: "In Progress",
            status: "in-progress",
            tasks: filteredTasks.filter((task) => task.status === "in-progress"),
        },
        {
            id: "review",
            title: "Review",
            status: "review",
            tasks: filteredTasks.filter((task) => task.status === "review"),
        },
        {
            id: "done",
            title: "Done",
            status: "done",
            tasks: filteredTasks.filter((task) => task.status === "done"),
        },
    ];

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as number);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeId = active.id as number;
        const overId = over.id as string;

        // 컬럼으로 드롭된 경우
        if (overId.startsWith("column-")) {
            const newStatus = overId.replace("column-", "");
            onTaskMove(activeId, newStatus);
        }

        setActiveId(null);
    };

    const activeTask = activeId
        ? filteredTasks.find((task) => task.id === activeId)
        : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 h-full p-4 overflow-x-auto">
                {columns.map((column) => (
                    <div key={column.id} className="flex-1 min-w-[280px]">
                        <SortableContext
                            items={column.tasks.map((task) => task.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <TaskKanbanColumn
                                id={`column-${column.status}`}
                                title={column.title}
                                tasks={column.tasks}
                                status={column.status}
                                onAddTask={onAddTask}
                            />
                        </SortableContext>
                    </div>
                ))}
            </div>

            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
} 