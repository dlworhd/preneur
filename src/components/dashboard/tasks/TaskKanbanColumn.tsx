import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import TaskCard, { type Task } from "./TaskCard";
import { StatusIcon, type StatusType } from "@/components/dashboard/common/StatusIcon";
import Button from "@/components/common/Button";

interface TaskKanbanColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    status: string;
    onAddTask: (title: string, status: string) => void;
}

export default function TaskKanbanColumn({
    id,
    title,
    tasks,
    status,
    onAddTask,
}: TaskKanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
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



    return (
        <div className="flex-1 min-w-0 flex flex-col border border-[var(--container-border)] rounded-2xl h-full">
            <div className="bg-[var(--background)] p-3 flex-shrink-0 border-b border-[var(--container-border)] rounded-t-2xl">
                <h3 className="text-sm font-medium text-[var(--secondary)] flex items-center gap-2">
                    <StatusIcon status={status as StatusType} />
                    {title}
                    <span className="text-xs opacity-60">({tasks.length})</span>
                </h3>
            </div>
            <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                <SortableContext
                    items={tasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
                {tasks.length > 0 && <div ref={setNodeRef} />}

                {/* Add Task Area */}
                <div className="relative">
                    {showAddTask ? (
                        <form
                            onSubmit={handleAddTask}
                            className="p-3 border border-dashed border-[var(--primary)] rounded-lg bg-[var(--background)]"
                        >
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) =>
                                    setNewTaskTitle(e.target.value)
                                }
                                placeholder="새 작업 제목을 입력하세요..."
                                className="w-full text-sm bg-transparent border-none outline-none text-[var(--secondary)] placeholder-[var(--secondary)] placeholder-opacity-60"
                                autoFocus
                                onBlur={() => {
                                    if (!newTaskTitle) setShowAddTask(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        setNewTaskTitle("");
                                        setShowAddTask(false);
                                    }
                                }}
                            />
                            <div className="flex gap-2 mt-2">
                                <Button
                                    type="submit"
                                    className="text-xs px-2 py-1 bg-[var(--primary)]  rounded hover:opacity-80"
                                >
                                    추가
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setNewTaskTitle("");
                                        setShowAddTask(false);
                                    }}
                                    className="text-xs px-2 py-1 text-[var(--secondary)] opacity-60 hover:opacity-100"
                                >
                                    취소
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div
                            className="p-3 border border-dashed border-transparent rounded-lg hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all cursor-pointer"
                            onClick={() => setShowAddTask(true)}
                        >
                            <div className="text-center text-xs text-[var(--secondary)] opacity-40 hover:opacity-60">
                                <PlusIcon
                                    width={16}
                                    height={16}
                                    className="mx-auto mb-1"
                                />
                                새 작업 추가
                            </div>
                        </div>
                    )}
                </div>
                {tasks.length === 0 && <div ref={setNodeRef} className="h-8" />}
            </div>
        </div>
    );
} 