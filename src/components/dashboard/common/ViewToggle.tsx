import { cn } from "@/lib/utils";
import { List, LayoutGrid } from "lucide-react";
import Button from "../../common/Button";

type ViewMode = "list" | "kanban";

interface ViewToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    className?: string;
}

export default function ViewToggle({
    viewMode,
    onViewModeChange,
    className,
}: ViewToggleProps) {
    return (
        <div className={cn("flex gap-1", className)}>
            <Button
                onClick={() => onViewModeChange("list")}
                className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === "list"
                        ? "bg-[var(--primary)] "
                        : "text-[var(--secondary)] hover:bg-amber-100/10"
                )}
            >
                <List width={16} height={16} />
            </Button>
            <Button
                onClick={() => onViewModeChange("kanban")}
                className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === "kanban"
                        ? "bg-[var(--primary)] "
                        : "text-[var(--secondary)] hover:bg-amber-100/10"
                )}
            >
                <LayoutGrid width={16} height={16} />
            </Button>
        </div>
    );
}
