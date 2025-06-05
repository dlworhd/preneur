import { cn } from "@/lib/utils";
import { PlusIcon, List, LayoutGrid, Tag } from "lucide-react";
import React, { useState } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageContent from "@/components/dashboard/PageContent";
import TaskKanbanView from "@/components/dashboard/TaskKanbanView";
import TaskListView from "@/components/dashboard/TaskListView";
import { type Task, type TaskTag } from "@/components/dashboard/TaskCard";

type ViewMode = "list" | "kanban";

const sampleTasks: Task[] = [
    {
        id: 1,
        title: "프로젝트 기획서 작성",
        description: "새로운 프로젝트의 전체적인 기획서를 작성하고 팀원들과 공유해야 합니다.",
        status: "todo",
        priority: "high",
        assignee: "김철수",
        dueDate: "2024-12-30",
        tags: ["task"],
        progress: 3,
        target: 10,
        unit: "페이지",
        order: 1,
    },
    {
        id: 2,
        title: "UI 디자인 시스템 구축",
        description: "일관된 사용자 인터페이스를 위한 디자인 시스템을 구축합니다.",
        status: "in-progress",
        priority: "medium",
        assignee: "이영희",
        dueDate: "2024-12-25",
        tags: ["task"],
        progress: 7,
        target: 15,
        unit: "컴포넌트",
        order: 2,
    },
    {
        id: 3,
        title: "코드 리뷰 진행",
        description: "팀원들이 작성한 코드를 리뷰하고 피드백을 제공합니다.",
        status: "review",
        priority: "medium",
        assignee: "박민수",
        dueDate: "2024-12-28",
        tags: ["task"],
        order: 3,
    },
    {
        id: 4,
        title: "데이터베이스 최적화",
        description: "쿼리 성능을 개선하고 인덱스를 최적화합니다.",
        status: "done",
        priority: "high",
        assignee: "정지원",
        dueDate: "2024-12-20",
        tags: ["task"],
        order: 4,
    },
    {
        id: 5,
        title: "API 문서화",
        description: "백엔드 API에 대한 상세한 문서를 작성합니다.",
        status: "todo",
        priority: "low",
        assignee: "최현우",
        dueDate: "2025-01-05",
        tags: ["task"],
        order: 5,
    },
];

export default function TasksPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("kanban");
    const [tasks, setTasks] = useState<Task[]>(sampleTasks);
    const [activeTag, setActiveTag] = useState<TaskTag>("all");

    const handleTaskMove = (
        taskId: number,
        newStatus: string,
        newIndex?: number
    ) => {
        setTasks((prevTasks) => {
            const taskIndex = prevTasks.findIndex((t) => t.id === taskId);
            if (taskIndex === -1) return prevTasks;

            const updatedTasks = [...prevTasks];
            updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                status: newStatus as Task["status"],
            };

            // 같은 상태 내에서 순서 변경
            if (newIndex !== undefined) {
                const sameStatusTasks = updatedTasks.filter(
                    (t) => t.status === newStatus
                );
                const otherTasks = updatedTasks.filter(
                    (t) => t.status !== newStatus
                );
                const [movedTask] = sameStatusTasks.splice(
                    sameStatusTasks.findIndex((t) => t.id === taskId),
                    1
                );
                sameStatusTasks.splice(newIndex, 0, movedTask);
                return [...otherTasks, ...sameStatusTasks];
            }

            return updatedTasks;
        });
    };

    const handleAddTask = (title: string, status: string) => {
        const newTask: Task = {
            id: Date.now(),
            title,
            description: "",
            status: status as Task["status"],
            priority: "medium",
            assignee: "미지정",
            dueDate: new Date().toISOString().split("T")[0],
            tags: ["task"],
            order: tasks.length + 1,
        };
        setTasks((prev) => [...prev, newTask]);
    };

    const getButtonText = () => {
        if (activeTag === "all") return "모든 작업";
        return activeTag;
    };

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Tasks">
                <div className="flex items-center gap-3">
                    {/* 태그 필터 */}
                    <div className="flex items-center gap-2">
                        <Tag
                            width={16}
                            height={16}
                            className="text-[var(--secondary)] opacity-60"
                        />
                        <select
                            value={activeTag}
                            onChange={(e) =>
                                setActiveTag(e.target.value as TaskTag)
                            }
                            className="text-sm border border-[var(--container-border)] rounded-md px-2 py-1 bg-[var(--background)] text-[var(--secondary)]"
                        >
                            <option value="all">모든 작업</option>
                            <option value="task">작업</option>
                        </select>
                    </div>

                    {/* 뷰 모드 토글 */}
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

                    <button
                        className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary)]/90 transition-colors text-sm"
                        onClick={() => handleAddTask("새 작업", "todo")}
                    >
                        <PlusIcon width={16} height={16} />
                        새 작업
                    </button>
                </div>
            </PageHeader>

            <PageContent>
                <div className="p-4 h-full">
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
            </PageContent>
        </div>
    );
}
