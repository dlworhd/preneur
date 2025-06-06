import { cn } from "@/lib/utils";
import { PlusIcon, List, LayoutGrid, Tag, CircleDashedIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import TaskKanbanView from "@/components/dashboard/TaskKanbanView";
import TaskListView from "@/components/dashboard/TaskListView";
import { type Task, type TaskTag } from "@/components/dashboard/TaskCard";

type ViewMode = "list" | "kanban";

export default function TasksPage() {
    const [activeTag, setActiveTag] = useState<TaskTag>("task");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // 클라이언트에서만 localStorage 접근
        const savedViewMode = localStorage.getItem("tasksViewMode");
        if (
            savedViewMode &&
            (savedViewMode === "list" || savedViewMode === "kanban")
        ) {
            setViewMode(savedViewMode as ViewMode);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem("tasksViewMode", viewMode);
        }
    }, [viewMode, isClient]);

    useEffect(() => {
        // 통합 작업 데이터 초기화
        const allTasks: Task[] = [
            // Tasks
            {
                id: 1,
                title: "로그인 버그 수정",
                description: "사용자 로그인 시 오류 발생 문제 해결",
                status: "in-progress",
                priority: "high",
                assignee: "김개발",
                dueDate: "2024-01-15",
                tags: ["task"],
                order: 0,
            },
            {
                id: 2,
                title: "UI 개선 작업",
                description: "대시보드 인터페이스 사용성 개선",
                status: "todo",
                priority: "medium",
                assignee: "박디자인",
                dueDate: "2024-01-20",
                tags: ["task"],
                order: 0,
            },
            {
                id: 3,
                title: "데이터베이스 최적화",
                description: "쿼리 성능 개선 및 인덱스 추가",
                status: "review",
                priority: "high",
                assignee: "이개발",
                dueDate: "2024-01-12",
                tags: ["task"],
                order: 0,
            },
        ];
        setTasks(allTasks);
    }, []);

    const handleTaskMove = (
        taskId: number,
        newStatus: string,
        newIndex?: number
    ) => {
        console.log(
            `handleTaskMove called: taskId=${taskId}, newStatus=${newStatus}, newIndex=${newIndex}`
        );

        setTasks((prevTasks) => {
            const updatedTasks = [...prevTasks];
            const taskIndex = updatedTasks.findIndex(
                (task) => task.id === taskId
            );

            if (taskIndex === -1) return prevTasks;

            const task = updatedTasks[taskIndex];
            const oldStatus = task.status;

            // 같은 컬럼 내에서 순서 변경
            if (oldStatus === newStatus && newIndex !== undefined) {
                // 순서 변경 로직...
            }
            // 다른 컬럼으로 이동
            else if (oldStatus !== newStatus) {
                // 상태 업데이트
                updatedTasks[taskIndex] = {
                    ...task,
                    status: newStatus as Task["status"],
                };
            }

            return updatedTasks;
        });
    };

    const handleAddTask = (title: string, status: string) => {
        const newTask: Task = {
            id: Math.max(...tasks.map((t) => t.id), 0) + 1,
            title,
            description: "",
            status: status as Task["status"],
            priority: "medium",
            assignee: "사용자",
            dueDate: new Date().toISOString().split("T")[0],
            tags: ["task"],
            order: tasks.filter((t) => t.status === status).length,
        };

        setTasks((prevTasks) => [...prevTasks, newTask]);
    };

    const filteredTasks = tasks
        .filter((task) => activeTag === "all" || task.tags.includes(activeTag))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const getButtonText = () => {
        switch (activeTag) {
            case "task":
                return "New Task";
            default:
                return "New Item";
        }
    };

    if (!isClient) {
        return (
            <div className={cn("flex flex-col h-full")}>
                <div
                    className={cn(
                        "border-b border-[var(--container-border)]",
                        "flex items-center justify-between px-4 h-12"
                    )}
                >
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium py-1">
                            <CircleDashedIcon width={16} height={16} />
                            Tasks
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className="p-2 rounded-md bg-[var(--primary)] text-white">
                            <List width={16} height={16} />
                        </div>
                        <div className="p-2 rounded-md text-[var(--secondary)] opacity-60">
                            <LayoutGrid width={16} height={16} />
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-sm text-[var(--secondary)] opacity-60">
                        Loading...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full")}>
            {/* 헤더 - 태그 네비게이션 + 뷰 토글 */}
            <div
                className={cn(
                    "border-b border-[var(--container-border)]",
                    "flex items-center justify-between px-4 h-12"
                )}
            >
                <div className="flex gap-2">
                    <button
                        className={cn(
                            "flex items-center gap-2 text-sm font-medium py-1 rounded-md transition-colors"
                        )}
                    >
                        <CircleDashedIcon width={16} height={16} />
                        Task
                    </button>
                </div>

                {/* 뷰 토글 */}
                <div className="flex gap-1">
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            viewMode === "list"
                                ? "bg-[var(--primary)] text-white"
                                : "text-[var(--secondary)] hover:bg-amber-100/10"
                        )}
                    >
                        <List width={16} height={16} />
                    </button>
                    <button
                        onClick={() => setViewMode("kanban")}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            viewMode === "kanban"
                                ? "bg-[var(--primary)] text-white"
                                : "text-[var(--secondary)] hover:bg-amber-100/10"
                        )}
                    >
                        <LayoutGrid width={16} height={16} />
                    </button>
                </div>
            </div>

            {/* 액션 바 */}
            <div
                className={cn(
                    "border-b border-[var(--container-border)]",
                    "flex justify-between items-center px-4 h-12"
                )}
            >
                <div className="flex items-center gap-2">
                    <Tag
                        width={16}
                        height={16}
                        className="text-[var(--secondary)] opacity-60"
                    />
                    <span className="text-xs text-[var(--secondary)] opacity-60">
                        {filteredTasks.length}개 항목
                    </span>
                </div>
                <Button onClick={() => handleAddTask("새 작업", "todo")}>
                    <div className="flex gap-2 items-center">
                        <PlusIcon width={20} height={20} />
                        <span>{getButtonText()}</span>
                    </div>
                </Button>
            </div>

            {/* 메인 콘텐츠 */}
            <div
                className={cn(
                    "bg-[var(--background)]",
                    "scrollbar-container will-change-scroll flex-[8] h-full overflow-y-auto relative"
                )}
            >
                {viewMode === "kanban" ? (
                    <TaskKanbanView
                        tasks={tasks}
                        onTaskMove={handleTaskMove}
                        onAddTask={handleAddTask}
                        activeTag={activeTag}
                    />
                ) : (
                    <TaskListView tasks={tasks} activeTag={activeTag} />
                )}
            </div>
        </div>
    );
}
