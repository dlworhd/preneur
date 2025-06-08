import { cn } from "@/lib/utils";
import { 
    CircleDashedIcon, 
    CheckCircle, 
    Circle, 
    Timer, 
    AlertCircle 
} from "lucide-react";
import { type Task, type TaskTag } from "./TaskCard";

interface TaskListViewProps {
    tasks: Task[];
    activeTag: TaskTag;
}

export default function TaskListView({ tasks, activeTag }: TaskListViewProps) {
    const filteredTasks = tasks.filter(
        (task) => activeTag === "all" || task.tags.includes(activeTag)
    );

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

    const getTagColor = (tag: TaskTag) => {
        switch (tag) {
            case "task":
                return "bg-[var(--red-100)] text-[var(--red-800)]";
            default:
                return "bg-[var(--gray-100)] text-[var(--gray-800)]";
        }
    };

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
                    {task.time && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--green-100)] text-[var(--green-800)]">
                            {task.time}
                        </span>
                    )}
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

    return (
        <div className="space-y-6">
            {/* 시간이 있는 작업들 */}
            {filteredTasks.filter((t) => t.time).length > 0 && (
                <div>
                    <div className="px-2 py-3 border-b border-[var(--container-border)] bg-[var(--background)] sticky top-0 z-10">
                        <h3 className="text-sm font-medium text-[var(--secondary)] flex items-center gap-2">
                            <Timer width={16} height={16} />
                            시간 예약 작업
                            <span className="text-xs opacity-60">
                                ({filteredTasks.filter((t) => t.time).length}개)
                            </span>
                        </h3>
                    </div>
                    {filteredTasks
                        .filter((task) => task.time)
                        .sort((a, b) => {
                            if (!a.time || !b.time) return 0;
                            return a.time.localeCompare(b.time);
                        })
                        .map(renderTaskRow)}
                </div>
            )}

            {/* 시간이 없는 작업들 */}
            {filteredTasks.filter((t) => !t.time).length > 0 && (
                <div>
                    <div className="px-2 py-3 border-b border-[var(--container-border)] bg-[var(--background)] sticky top-0 z-10">
                        <h3 className="text-sm font-medium text-[var(--secondary)] flex items-center gap-2">
                            <CircleDashedIcon width={16} height={16} />
                            일반 작업
                            <span className="text-xs opacity-60">
                                ({filteredTasks.filter((t) => !t.time).length}개)
                            </span>
                        </h3>
                    </div>
                    {filteredTasks
                        .filter((task) => !task.time)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map(renderTaskRow)}
                </div>
            )}
        </div>
    );
} 