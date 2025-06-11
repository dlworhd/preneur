import { cn } from "@/lib/utils";
import {
    CircleDashedIcon,
    PlusIcon,
    CheckCircle,
    Timer,
    Zap,
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
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
    useDroppable,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ViewMode = "list" | "kanban";

interface Routine {
    id: number;
    title: string;
    description: string;
    status: "todo" | "in-progress" | "review" | "done";
    priority: "high" | "medium" | "low";
    assignee: string;
    dueDate: string;
    progress?: number;
    target?: number;
    unit?: string;
    order?: number;
    time?: string; // HH:MM 형식
}

function RoutineCard({ routine }: { routine: Routine }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: routine.id });

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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "p-3 rounded-lg border border-[var(--container-border)]",
                "bg-[var(--background)] hover:bg-[var(--secondary-hover)]/20",
                "cursor-grab active:cursor-grabbing transition-colors relative",
                isDragging && "opacity-50 z-40"
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="m font-medium text-[var(--secondary)] truncate pr-2">
                    {routine.title}
                </h4>
                <div className="flex items-center gap-2">
                    {getStatusIcon(routine.status)}
                </div>
            </div>
            <p className="text-xs text-[var(--secondary)] opacity-60 mb-3 line-clamp-2">
                {routine.description}
            </p>
            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--blue-100)] text-[var(--blue-800)]">
                        routine
                    </span>
                    {routine.time && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--green-100)] text-[var(--green-800)]">
                            <Timer
                                width={10}
                                height={10}
                                className="inline mr-1"
                            />
                            {routine.time}
                        </span>
                    )}
                </div>
                <div className="text-xs text-[var(--secondary)] opacity-60">
                    {new Date(routine.dueDate).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                    })}
                </div>
            </div>
            {routine.progress && routine.target && (
                <div className="mt-2 text-xs text-[var(--secondary)]">
                    {routine.progress}/{routine.target} {routine.unit}
                </div>
            )}
        </div>
    );
}

function DroppableColumn({
    id,
    title,
    routines,
    status,
    onAddRoutine,
}: {
    id: string;
    title: string;
    routines: Routine[];
    status: string;
    onAddRoutine: (title: string, status: string) => void;
}) {
    const { setNodeRef } = useDroppable({
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
                <h3 className="m font-medium text-[var(--secondary)] flex items-center gap-2">
                    {getStatusIcon(status)}
                    {title}
                    <span className="text-xs opacity-60">
                        ({routines.length})
                    </span>
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
                        <form onSubmit={handleAddRoutine} className="p-3 border border-dashed border-[var(--primary)] rounded-lg bg-[var(--background)]">
                            <input
                                type="text"
                                value={newRoutineTitle}
                                onChange={(e) => setNewRoutineTitle(e.target.value)}
                                placeholder="새 루틴 제목을 입력하세요..."
                                className="w-full m bg-transparent border-none outline-none text-[var(--secondary)] placeholder-[var(--secondary)] placeholder-opacity-60"
                                autoFocus
                                onBlur={() => {
                                    if (!newRoutineTitle) setShowAddRoutine(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setNewRoutineTitle("");
                                        setShowAddRoutine(false);
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
                                        setNewRoutineTitle("");
                                        setShowAddRoutine(false);
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
                            onClick={() => setShowAddRoutine(true)}
                        >
                            <div className="enter text-xs text-[var(--secondary)] opacity-40 hover:opacity-60">
                                <PlusIcon width={16} height={16} className="mx-auto mb-1" />
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

function KanbanView({
    routines,
    onRoutineMove,
    onAddRoutine,
}: {
    routines: Routine[];
    onRoutineMove: (
        routineId: number,
        newStatus: string,
        newIndex?: number
    ) => void;
    onAddRoutine: (title: string, status: string) => void;
}) {
    const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

    const todoRoutines = routines
        .filter((routine) => routine.status === "todo")
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    const inProgressRoutines = routines
        .filter((routine) => routine.status === "in-progress")
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    const reviewRoutines = routines
        .filter((routine) => routine.status === "review")
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    const doneRoutines = routines
        .filter((routine) => routine.status === "done")
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const routine = routines.find((r) => r.id === active.id);
        setActiveRoutine(routine || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // 같은 아이템이면 무시
        if (activeId === overId) return;

        // 활성 루틴과 오버 루틴 찾기
        const activeRoutine = routines.find(
            (routine) => routine.id === activeId
        );
        const overRoutine = routines.find((routine) => routine.id === overId);

        if (!activeRoutine) return;

        // 컬럼 간 이동 (카드 위에 드롭)
        if (overRoutine && activeRoutine.status !== overRoutine.status) {
            const overStatusRoutines = routines
                .filter((routine) => routine.status === overRoutine.status)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            const overIndex = overStatusRoutines.findIndex(
                (routine) => routine.id === overId
            );
            onRoutineMove(Number(activeId), overRoutine.status, overIndex);
        }
        // 컬럼으로 직접 드롭 (빈 컬럼 또는 컬럼 끝)
        else if (
            ["todo", "in-progress", "review", "done"].includes(overId as string)
        ) {
            if (activeRoutine.status !== overId) {
                // 다른 컬럼으로 이동 시 맨 마지막에 추가
                const targetColumnRoutines = routines.filter(
                    (routine) => routine.status === overId
                );
                onRoutineMove(
                    Number(activeId),
                    overId as string,
                    targetColumnRoutines.length
                );
            } else {
                // 같은 컬럼 내에서 맨 마지막으로 이동
                const sameColumnRoutines = routines.filter(
                    (routine) =>
                        routine.status === overId && routine.id !== activeId
                );
                onRoutineMove(
                    Number(activeId),
                    overId as string,
                    sameColumnRoutines.length
                );
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveRoutine(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // 같은 아이템이면 무시
        if (activeId === overId) return;

        const activeRoutine = routines.find(
            (routine) => routine.id === activeId
        );
        const overRoutine = routines.find((routine) => routine.id === overId);

        if (!activeRoutine) return;

        // 같은 컬럼 내에서 순서 변경
        if (overRoutine && activeRoutine.status === overRoutine.status) {
            const sameStatusRoutines = routines
                .filter((routine) => routine.status === activeRoutine.status)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            const activeIndex = sameStatusRoutines.findIndex(
                (routine) => routine.id === activeId
            );
            const overIndex = sameStatusRoutines.findIndex(
                (routine) => routine.id === overId
            );

            if (activeIndex !== overIndex) {
                onRoutineMove(
                    Number(activeId),
                    activeRoutine.status,
                    overIndex
                );
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
            <div className="flex gap-2 h-full overflow-x-auto p-2">
                <DroppableColumn
                    id="todo"
                    title="To Do"
                    routines={todoRoutines}
                    status="todo"
                    onAddRoutine={onAddRoutine}
                />
                <DroppableColumn
                    id="in-progress"
                    title="In Progress"
                    routines={inProgressRoutines}
                    status="in-progress"
                    onAddRoutine={onAddRoutine}
                />
                <DroppableColumn
                    id="review"
                    title="Review"
                    routines={reviewRoutines}
                    status="review"
                    onAddRoutine={onAddRoutine}
                />
                <DroppableColumn
                    id="done"
                    title="Done"
                    routines={doneRoutines}
                    status="done"
                    onAddRoutine={onAddRoutine}
                />
            </div>
            <DragOverlay>
                {activeRoutine ? (
                    <div
                        className={cn(
                            "p-3 rounded-lg border border-[var(--container-border)]",
                            "bg-[var(--background)] shadow-lg rotate-3",
                            "z-50 relative"
                        )}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="m font-medium text-[var(--secondary)] truncate pr-2">
                                {activeRoutine.title}
                            </h4>
                        </div>
                        <p className="text-xs text-[var(--secondary)] opacity-60 line-clamp-2">
                            {activeRoutine.description}
                        </p>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default function RoutinesPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // 클라이언트에서만 localStorage 접근
        const savedViewMode = localStorage.getItem("routinesViewMode");
        if (savedViewMode && (savedViewMode === "list" || savedViewMode === "kanban")) {
            setViewMode(savedViewMode as ViewMode);
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem("routinesViewMode", viewMode);
        }
    }, [viewMode, isClient]);

    useEffect(() => {
        // 루틴 데이터 초기화
        const allRoutines: Routine[] = [
            {
                id: 4,
                title: "일일 운동",
                description: "매일 30분 이상 운동하기",
                status: "in-progress",
                priority: "medium",
                assignee: "개인",
                dueDate: "2024-12-31",
                order: 1,
                time: "07:00",
            },
            {
                id: 5,
                title: "독서 습관",
                description: "매주 1권 이상 독서",
                status: "in-progress",
                priority: "medium",
                assignee: "개인",
                dueDate: "2024-12-31",
                progress: 8,
                target: 52,
                unit: "권",
                order: 2,
                time: "21:00",
            },
            {
                id: 6,
                title: "주간 회고",
                description: "매주 금요일 개인 회고 작성",
                status: "done",
                priority: "low",
                assignee: "개인",
                dueDate: "2024-12-31",
                order: 0,
            },
            {
                id: 7,
                title: "명상",
                description: "매일 아침 10분 명상",
                status: "in-progress",
                priority: "high",
                assignee: "개인",
                dueDate: "2024-12-31",
                order: 3,
                time: "06:30",
            },
            {
                id: 8,
                title: "물 마시기",
                description: "하루 2L 이상 물 마시기",
                status: "todo",
                priority: "medium",
                assignee: "개인",
                dueDate: "2024-12-31",
                order: 4,
            },
        ];

        setRoutines(allRoutines);
    }, []);

    const handleRoutineMove = (
        routineId: number,
        newStatus: string,
        newIndex?: number
    ) => {
        setRoutines((prevRoutines) => {
            const updatedRoutines = [...prevRoutines];
            const routineIndex = updatedRoutines.findIndex(
                (routine) => routine.id === routineId
            );

            if (routineIndex === -1) return prevRoutines;

            const routine = updatedRoutines[routineIndex];
            const oldStatus = routine.status;

            // 같은 컬럼 내에서 순서 변경
            if (oldStatus === newStatus && newIndex !== undefined) {
                const sameStatusRoutines = updatedRoutines
                    .filter((r) => r.status === newStatus)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                const currentIndex = sameStatusRoutines.findIndex(
                    (r) => r.id === routineId
                );

                if (currentIndex !== -1 && currentIndex !== newIndex) {
                    const reorderedRoutines = arrayMove(
                        sameStatusRoutines,
                        currentIndex,
                        newIndex
                    );

                    reorderedRoutines.forEach((reorderedRoutine, index) => {
                        const originalIndex = updatedRoutines.findIndex(
                            (r) => r.id === reorderedRoutine.id
                        );
                        if (originalIndex !== -1) {
                            updatedRoutines[originalIndex] = {
                                ...updatedRoutines[originalIndex],
                                order: index,
                            };
                        }
                    });
                }
            }
            // 다른 컬럼으로 이동
            else if (oldStatus !== newStatus) {
                updatedRoutines[routineIndex] = {
                    ...routine,
                    status: newStatus as Routine["status"],
                };

                const newStatusRoutines = updatedRoutines.filter(
                    (r) => r.status === newStatus && r.id !== routineId
                );
                const insertIndex =
                    newIndex !== undefined
                        ? newIndex
                        : newStatusRoutines.length;

                updatedRoutines[routineIndex] = {
                    ...updatedRoutines[routineIndex],
                    order: insertIndex,
                };

                newStatusRoutines.forEach((statusRoutine, index) => {
                    const originalIndex = updatedRoutines.findIndex(
                        (r) => r.id === statusRoutine.id
                    );
                    if (originalIndex !== -1) {
                        const newOrder =
                            index >= insertIndex ? index + 1 : index;
                        updatedRoutines[originalIndex] = {
                            ...updatedRoutines[originalIndex],
                            order: newOrder,
                        };
                    }
                });
            }

            return updatedRoutines;
        });
    };

    const handleAddRoutine = (title: string, status: string) => {
        const newRoutine: Routine = {
            id: Math.max(...routines.map(r => r.id), 0) + 1,
            title,
            description: "",
            status: status as Routine["status"],
            priority: "medium",
            assignee: "개인",
            dueDate: new Date().toISOString().split('T')[0],
            order: routines.filter(r => r.status === status).length,
        };

        setRoutines(prevRoutines => [...prevRoutines, newRoutine]);
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
                    <Circle
                        width={16}
                        height={16}
                        className="text-[var(--icon-warning)]"
                    />
                );
            case "low":
                return (
                    <Circle
                        width={16}
                        height={16}
                        className="text-[var(--icon-success)]"
                    />
                );
            default:
                return (
                    <Circle
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
                return (
                    <Timer
                        width={16}
                        height={16}
                        className="text-[var(--icon-info)]"
                    />
                );
            case "review":
                return (
                    <AlertCircle
                        width={16}
                        height={16}
                        className="text-[var(--icon-warning)]"
                    />
                );
            case "todo":
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

    const renderRoutineRow = (routine: Routine) => (
        <div
            key={routine.id}
            className={cn(
                "text-sm",
                "hover:bg-amber-100/10 text-[var(--secondary)]",
                "flex h-[40px] p-2 border-b border-[var(--container-border)]"
            )}
        >
            <div className="flex items-center flex-[0.5]">
                {getStatusIcon(routine.status)}
            </div>
            <div className="flex items-center flex-[4.5] cursor-pointer">
                <div className="w-full">
                    <div className="truncate font-medium">{routine.title}</div>
                    <div className="text-xs opacity-60 truncate">
                        {routine.description}
                    </div>
                </div>
            </div>
            <div className="flex items-center flex-[1.5] cursor-pointer">
                <div className="flex gap-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--blue-100)] text-[var(--blue-800)]">
                        routine
                    </span>
                    {routine.time && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--green-100)] text-[var(--green-800)]">
                            {routine.time}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex justify-center items-center flex-[1] cursor-pointer">
                {routine.progress && routine.target ? (
                    <span className="text-xs">
                        {routine.progress}/{routine.target} {routine.unit}
                    </span>
                ) : (
                    <span className="text-xs">{routine.status}</span>
                )}
            </div>
            <div className="flex justify-center items-center flex-[1] cursor-pointer text-xs">
                {routine.assignee}
            </div>
            <div className="flex justify-end items-center flex-[1] cursor-pointer text-xs opacity-60">
                {new Date(routine.dueDate).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                })}
            </div>
        </div>
    );

    if (!isClient) {
        return (
            <div className={cn("flex flex-col h-full")}>
                <div className={cn(
                    "border-b border-[var(--container-border)]",
                    "flex items-center justify-between px-4 h-12"
                )}>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium py-1">
                            <Zap width={16} height={16} />
                            Routines
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <div className="p-2 rounded-md bg-[var(--primary)] ">
                            <List width={16} height={16} />
                        </div>
                        <div className="p-2 rounded-md text-[var(--secondary)] opacity-60">
                            <LayoutGrid width={16} height={16} />
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-sm text-[var(--secondary)] opacity-60">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full")}>
            {/* 헤더 - 태그 네비게이션 + 뷰 토글 */}
            <div
                className={cn(
                    "bg-[var(--background)] border-b border-[var(--container-border)]",
                    "flex items-center justify-between px-4 h-12"
                )}
            >
                <div className="flex gap-2">
                    <Button
                        className={cn(
                            "flex items-center gap-2 text-sm font-medium py-1 rounded-md transition-colors"
                        )}
                    >
                        <Zap width={16} height={16} />
                        Routine
                    </Button>
                </div>

                {/* 뷰 토글 */}
                <div className="flex gap-1">
                    <Button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            viewMode === "list"
                                ? "bg-[var(--primary)]"
                                : "hover:bg-[var(--secondary-hover)]/20"
                        )}
                    >
                        <List width={16} height={16} />
                    </Button>
                    <Button
                        onClick={() => setViewMode("kanban")}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            viewMode === "kanban"
                                ? "bg-[var(--primary)]"
                                : "hover:bg-[var(--secondary-hover)]/20"
                        )}
                    >
                        <LayoutGrid width={16} height={16} />
                    </Button>
                </div>
            </div>

            {/* 액션 바 */}
            <div
                className={cn(
                    "bg-[var(--background)] border-b border-[var(--container-border)]",
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
                        {routines.length}개 항목
                    </span>
                </div>
                <Button onClick={() => {}}>
                    <div className="flex gap-2 items-center">
                        <PlusIcon width={20} height={20} />
                        <span>New Routine</span>
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
                        routines={routines}
                        onRoutineMove={handleRoutineMove}
                        onAddRoutine={handleAddRoutine}
                    />
                ) : (
                    <div className="space-y-6">
                        {/* 시간이 있는 루틴들 */}
                        {routines.filter((r) => r.time).length > 0 && (
                            <div>
                                <div className="px-2 py-3 border-b border-[var(--container-border)] bg-[var(--background)] sticky top-0 z-10">
                                    <h3 className="text-sm font-medium text-[var(--secondary)] flex items-center gap-2">
                                        <Timer width={16} height={16} />
                                        시간 예약 루틴
                                        <span className="text-xs opacity-60">
                                            ({routines.filter((r) => r.time).length}개)
                                        </span>
                                    </h3>
                                </div>
                                {routines
                                    .filter((routine) => routine.time)
                                    .sort((a, b) => {
                                        if (!a.time || !b.time) return 0;
                                        return a.time.localeCompare(b.time);
                                    })
                                    .map(renderRoutineRow)}
                            </div>
                        )}

                        {/* 시간이 없는 루틴들 */}
                        {routines.filter((r) => !r.time).length > 0 && (
                            <div>
                                <div className="px-2 py-3 border-b border-[var(--container-border)] bg-[var(--background)] sticky top-0 z-10">
                                    <h3 className="text-sm font-medium text-[var(--secondary)] flex items-center gap-2">
                                        <CircleDashedIcon width={16} height={16} />
                                        일반 루틴
                                        <span className="text-xs opacity-60">
                                            ({routines.filter((r) => !r.time).length}개)
                                        </span>
                                    </h3>
                                </div>
                                {routines
                                    .filter((routine) => !routine.time)
                                    .sort(
                                        (a, b) =>
                                            (a.order || 0) - (b.order || 0)
                                    )
                                    .map(renderRoutineRow)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
