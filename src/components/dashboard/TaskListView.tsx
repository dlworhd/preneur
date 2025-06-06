import { cn } from "@/lib/utils";
import { CheckCircle, Circle, CircleDashedIcon } from "lucide-react";
import { type Task, type TaskTag } from "./TaskCard";

interface TaskListViewProps {
    tasks: Task[];
    activeTag: TaskTag;
}

export default function TaskListView({ tasks, activeTag }: TaskListViewProps) {
    const filteredTasks = tasks.filter(
        (task) => activeTag === "all" || task.tags.includes(activeTag)
    );

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

    return (
        <>
            {filteredTasks.map(renderTaskRow)}
        </>
    );
} 