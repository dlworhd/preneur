import { cn } from "@/lib/utils";
import { PlusIcon, CircleDashedIcon, CheckCircle, Circle } from "lucide-react";
import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard, { type Task } from "./TaskCard";

export default function TaskKanbanColumn({
    id,
    title,
    tasks,
    status,
    onAddTask,
}: {
    id: string;
    title: string;
    tasks: Task[];
    status: string;
    onAddTask: (title: string, status: string) => void;
}) {
    const { setNodeRef } = useDroppable({
        id: id,
    });
    const [isSticky, setIsSticky] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
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

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            onAddTask(newTaskTitle.trim(), status);
            setNewTaskTitle("");
            setShowAddTask(false);
        }
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

    return (
        <div className="flex flex-col h-full min-w-[280px]">
            <div
                ref={headerRef}
                className={cn(
                    "flex items-center justify-between p-3 border-b border-[var(--container-border)]",
                    "bg-[var(--background)] transition-all duration-200",
                    isSticky && "sticky top-0 z-30 shadow-sm"
                )}
            >
                <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <h3 className="font-medium text-[var(--secondary)]">
                        {title}
                    </h3>
                    <span className="text-xs bg-[var(--gray-100)] text-[var(--gray-600)] px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <button
                    onClick={() => setShowAddTask(true)}
                    className="p-1 rounded hover:bg-amber-100/10 transition-colors"
                >
                    <PlusIcon
                        width={16}
                        height={16}
                        className="text-[var(--secondary)] opacity-60"
                    />
                </button>
            </div>
            <div
                ref={setNodeRef}
                className="flex-1 p-3 space-y-3 min-h-[200px]"
            >
                <SortableContext
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
                {showAddTask && (
                    <form onSubmit={handleAddTask} className="space-y-2">
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="새 작업 제목..."
                            className="w-full p-2 text-sm border border-[var(--container-border)] rounded-md bg-[var(--background)] text-[var(--secondary)] placeholder-[var(--secondary)]/50"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-3 py-1 text-xs bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary)]/90"
                            >
                                추가
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddTask(false);
                                    setNewTaskTitle("");
                                }}
                                className="px-3 py-1 text-xs text-[var(--secondary)] opacity-60 hover:opacity-80"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
} 