import { cn } from "@/lib/utils";
import {
    CircleDashedIcon,
    PlusIcon,
    CheckCircle,
    Timer,
    AlertCircle,
    Tag,
    Circle,
    List,
    LayoutGrid,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    DragOverEvent,
    useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type TaskTag = "task" | "all";
type ViewMode = "list" | "kanban";

interface Task {
    id: number;
    title: string;
    description: string;
    status: "todo" | "in-progress" | "review" | "done";
    priority: "high" | "medium" | "low";
    assignee: string;
    dueDate: string;
    tags: TaskTag[];
    progress?: number;
    target?: number;
    unit?: string;
    order?: number;
}

function TaskCard({ task }: { task: Task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
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

    const getTagColor = (tag: TaskTag) => {
        switch (tag) {
            case "task":
                return "bg-[var(--red-100)] text-[var(--red-800)]";
            default:
                return "bg-[var(--gray-100)] text-[var(--gray-800)]";
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "p-3 rounded-lg border border-[var(--container-border)]",
                "bg-[var(--background)] hover:bg-amber-100/10",
                "cursor-grab active:cursor-grabbing transition-colors relative",
                isDragging && "opacity-50 z-40"
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-[var(--secondary)] truncate pr-2">
                    {task.title}
                </h4>
                <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                </div>
            </div>
            <p className="text-xs text-[var(--secondary)] opacity-60 mb-3 line-clamp-2">
                {task.description}
            </p>
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    {task.tags.map((tag, index) => (
                        <span
                            key={index}
                            className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                getTagColor(tag)
                            )}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="text-xs text-[var(--secondary)] opacity-60">
                    {new Date(task.dueDate).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            </div>
            {task.progress && task.target && (
                <div className="mt-2 text-xs text-[var(--secondary)]">
                    {task.progress}/{task.target} {task.unit}
                </div>
            )}
        </div>
    );
}

function DroppableColumn({
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
        <div className="flex-1 min-w-0 flex flex-col border border-[var(--container-border)] rounded-2xl h-full">
            <div className="bg-[var(--background)] p-3 flex-shrink-0 border-b border-[var(--container-border)] rounded-t-2xl">
                <h3 className="text-sm font-medium text-[var(--secondary)] flex items-center gap-2">
                    {getStatusIcon(status)}
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
                            className="p-3 border-2 border-dashed border-[var(--primary)] rounded-lg bg-[var(--background)]"
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
                                <button
                                    type="submit"
                                    className="text-xs px-2 py-1 bg-[var(--primary)] text-white rounded hover:opacity-80"
                                >
                                    추가
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewTaskTitle("");
                                        setShowAddTask(false);
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

function KanbanView({
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
                distance: 3,
            },
        })
    );

    // 내부에서 필터링
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

        // 활성 태스크와 오버 태스크 찾기
        const activeTask = filteredTasks.find((task) => task.id === activeId);
        const overTask = filteredTasks.find((task) => task.id === overId);

        if (!activeTask) return;

        // 컬럼 간 이동 (카드 위에 드롭)
        if (overTask && activeTask.status !== overTask.status) {
            const overStatusTasks = filteredTasks
                .filter((task) => task.status === overTask.status)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            const overIndex = overStatusTasks.findIndex(
                (task) => task.id === overId
            );
            onTaskMove(Number(activeId), overTask.status, overIndex);
        }
        // 컬럼으로 직접 드롭 (빈 컬럼 또는 컬럼 끝)
        else if (
            ["todo", "in-progress", "review", "done"].includes(overId as string)
        ) {
            if (activeTask.status !== overId) {
                // 다른 컬럼으로 이동 시 맨 마지막에 추가
                const targetColumnTasks = filteredTasks.filter(
                    (task) => task.status === overId
                );
                onTaskMove(
                    Number(activeId),
                    overId as string,
                    targetColumnTasks.length
                );
            } else {
                // 같은 컬럼 내에서 맨 마지막으로 이동
                const sameColumnTasks = filteredTasks.filter(
                    (task) => task.status === overId && task.id !== activeId
                );
                onTaskMove(
                    Number(activeId),
                    overId as string,
                    sameColumnTasks.length
                );
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // 같은 아이템이면 무시
        if (activeId === overId) return;

        const activeTask = filteredTasks.find((task) => task.id === activeId);
        const overTask = filteredTasks.find((task) => task.id === overId);

        if (!activeTask) return;

        // 같은 컬럼 내에서 순서 변경
        if (overTask && activeTask.status === overTask.status) {
            const sameStatusTasks = filteredTasks
                .filter((task) => task.status === activeTask.status)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            const activeIndex = sameStatusTasks.findIndex(
                (task) => task.id === activeId
            );
            const overIndex = sameStatusTasks.findIndex(
                (task) => task.id === overId
            );

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
            <div className="flex gap-2 h-full w-full p-2 relative">
                <DroppableColumn
                    id="todo"
                    title="To Do"
                    tasks={todoTasks}
                    status="todo"
                    onAddTask={onAddTask}
                />
                <DroppableColumn
                    id="in-progress"
                    title="In Progress"
                    tasks={inProgressTasks}
                    status="in-progress"
                    onAddTask={onAddTask}
                />
                <DroppableColumn
                    id="review"
                    title="Review"
                    tasks={reviewTasks}
                    status="review"
                    onAddTask={onAddTask}
                />
                <DroppableColumn
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
                const sameStatusTasks = updatedTasks
                    .filter((t) => t.status === newStatus)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                const currentIndex = sameStatusTasks.findIndex(
                    (t) => t.id === taskId
                );

                if (currentIndex !== -1 && currentIndex !== newIndex) {
                    // arrayMove를 사용하여 순서 변경
                    const reorderedTasks = arrayMove(
                        sameStatusTasks,
                        currentIndex,
                        newIndex
                    );

                    // 전체 배열에서 같은 상태의 태스크들의 order 업데이트
                    reorderedTasks.forEach((reorderedTask, index) => {
                        const originalIndex = updatedTasks.findIndex(
                            (t) => t.id === reorderedTask.id
                        );
                        if (originalIndex !== -1) {
                            updatedTasks[originalIndex] = {
                                ...updatedTasks[originalIndex],
                                order: index,
                            };
                        }
                    });

                    console.log(
                        `Reordered within column: moved task ${taskId} from index ${currentIndex} to ${newIndex}`
                    );
                }
            }
            // 다른 컬럼으로 이동
            else if (oldStatus !== newStatus) {
                // 상태 업데이트
                updatedTasks[taskIndex] = {
                    ...task,
                    status: newStatus as Task["status"],
                };

                const newStatusTasks = updatedTasks.filter(
                    (t) => t.status === newStatus && t.id !== taskId
                );
                const insertIndex =
                    newIndex !== undefined ? newIndex : newStatusTasks.length;

                // 새 컬럼에서의 순서 설정
                updatedTasks[taskIndex] = {
                    ...updatedTasks[taskIndex],
                    order: insertIndex,
                };

                // 새 컬럼의 다른 태스크들 순서 업데이트
                newStatusTasks.forEach((statusTask, index) => {
                    const originalIndex = updatedTasks.findIndex(
                        (t) => t.id === statusTask.id
                    );
                    if (originalIndex !== -1) {
                        const newOrder =
                            index >= insertIndex ? index + 1 : index;
                        updatedTasks[originalIndex] = {
                            ...updatedTasks[originalIndex],
                            order: newOrder,
                        };
                    }
                });
            }

            console.log("Updated tasks:", updatedTasks);
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

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "high":
                return (
                    <AlertCircle
                        width={16}
                        height={16}
                        className="text-[var(--icon-error)]"
                    />
                );
            case "medium":
                return (
                    <Timer
                        width={16}
                        height={16}
                        className="text-[var(--icon-warning)]"
                    />
                );
            case "low":
                return (
                    <CircleDashedIcon
                        width={16}
                        height={16}
                        className="text-[var(--icon-success)]"
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

    const getTagColor = (tag: TaskTag) => {
        switch (tag) {
            case "task":
                return "bg-[var(--red-100)] text-[var(--red-800)]";
            default:
                return "bg-[var(--gray-100)] text-[var(--gray-800)]";
        }
    };

    const filteredTasks = tasks
        .filter((task) => activeTag === "all" || task.tags.includes(activeTag))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const renderTaskRow = (task: Task) => (
        <div
            key={task.id}
            className={cn(
                "text-sm",
                "hover:bg-amber-100/10 text-[var(--secondary)]",
                "flex h-[40px] p-2 border-b border-[var(--container-border)]"
            )}
        >
            <div className="flex items-center flex-[0.5]">
                {getStatusIcon(task.status)}
            </div>
            <div className="flex items-center flex-[4.5] cursor-pointer">
                <div className="w-full">
                    <div className="truncate font-medium">{task.title}</div>
                    <div className="text-xs opacity-60 truncate">
                        {task.description}
                    </div>
                </div>
            </div>
            <div className="flex items-center flex-[1.5] cursor-pointer">
                <div className="flex gap-1 flex-wrap">
                    {task.tags.map((tag, index) => (
                        <span
                            key={index}
                            className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                getTagColor(tag)
                            )}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            <div className="flex justify-center items-center flex-[1] cursor-pointer">
                {task.progress && task.target ? (
                    <span className="text-xs">
                        {task.progress}/{task.target} {task.unit}
                    </span>
                ) : (
                    <span className="text-xs">{task.status}</span>
                )}
            </div>
            <div className="flex justify-center items-center flex-[1] cursor-pointer text-xs">
                {task.assignee}
            </div>
            <div className="flex justify-end items-center flex-[1] cursor-pointer text-xs opacity-60">
                {new Date(task.dueDate).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                })}
            </div>
        </div>
    );

    const tagButtons = [
        {
            id: "task" as TaskTag,
            label: "Tasks",
            icon: <CircleDashedIcon width={16} height={16} />,
        },
    ];

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
                <Button onClick={() => {}}>
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
                    <KanbanView
                        tasks={tasks}
                        onTaskMove={handleTaskMove}
                        onAddTask={handleAddTask}
                        activeTag={activeTag}
                    />
                ) : (
                    filteredTasks.map(renderTaskRow)
                )}
            </div>
        </div>
    );
}
