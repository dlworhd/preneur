import { cn } from "@/lib/utils";
import { Timer, AlertCircle, Tag, CircleDashedIcon, CheckCircle, Circle } from "lucide-react";
import { type Task, type TaskTag } from "./TaskCard";

export default function TaskListView({
    tasks,
    activeTag,
}: {
    tasks: Task[];
    activeTag: TaskTag;
}) {
    const filteredTasks = tasks.filter((task) =>
        activeTag === "all" ? true : task.tags.includes(activeTag)
    );

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "high":
                return (
                    <AlertCircle
                        width={16}
                        height={16}
                        className="text-[var(--icon-danger)]"
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
        <tr
            key={task.id}
            className="border-b border-[var(--container-border)] hover:bg-amber-100/10 transition-colors"
        >
            <td className="p-3">
                <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[var(--secondary)] truncate">
                            {task.title}
                        </h4>
                        <p className="text-xs text-[var(--secondary)] opacity-60 truncate">
                            {task.description}
                        </p>
                    </div>
                </div>
            </td>
            <td className="p-3">
                <div className="flex items-center gap-1">
                    {getPriorityIcon(task.priority)}
                    <span className="text-xs text-[var(--secondary)] opacity-60 capitalize">
                        {task.priority}
                    </span>
                </div>
            </td>
            <td className="p-3">
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
            </td>
            <td className="p-3">
                <span className="text-xs text-[var(--secondary)] opacity-60">
                    {task.assignee}
                </span>
            </td>
            <td className="p-3">
                <span className="text-xs text-[var(--secondary)] opacity-60">
                    {new Date(task.dueDate).toLocaleDateString("ko-KR")}
                </span>
            </td>
        </tr>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-[var(--gray-50)] border-b border-[var(--container-border)]">
                    <tr>
                        <th className="text-left p-3 text-xs font-medium text-[var(--secondary)] opacity-60 uppercase tracking-wider">
                            작업
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-[var(--secondary)] opacity-60 uppercase tracking-wider">
                            우선순위
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-[var(--secondary)] opacity-60 uppercase tracking-wider">
                            태그
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-[var(--secondary)] opacity-60 uppercase tracking-wider">
                            담당자
                        </th>
                        <th className="text-left p-3 text-xs font-medium text-[var(--secondary)] opacity-60 uppercase tracking-wider">
                            마감일
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTasks.map(renderTaskRow)}
                </tbody>
            </table>
        </div>
    );
} 