import { cn } from "@/lib/utils";
import { useState } from "react";
import { Filter, Search } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import FilterButton from "@/components/common/FilterButton";
import Button from "@/components/common/Button";

function EmptyInboxState() {
    return (
        <div className="bg-[var(--background)] flex flex-col items-center justify-center h-full">
            <div className="mb-8">
                <div className="w-20 h-32 relative">
                    {/* 휴대폰 외곽선 */}
                    <div className={cn(
                        "w-full h-full",
                        "border border-[var(--container-border)]",
                        "rounded-xl bg-[var(--background)]",
                        "relative"
                    )}>
                        {/* 화면 */}
                        <div className={cn(
                            "absolute inset-2",
                            "bg-[var(--container-border)]",
                            "rounded-lg opacity-30"
                        )}></div>
                        {/* 홈 버튼 */}
                        <div className={cn(
                            "absolute bottom-1 left-1/2",
                            "transform -translate-x-1/2",
                            "w-3 h-0.5",
                            "bg-[var(--container-border)]",
                            "rounded-full"
                        )}></div>
                    </div>
                </div>
            </div>
            <div className="enter">
                <h2 className="text-lg font-medium text-[var(--secondary)] mb-2">
                    No notifications
                </h2>
            </div>
        </div>
    );
}

function InboxSidebar() {
    const [activeFilter, setActiveFilter] = useState('all');

    const filterButtons = [
        { id: 'all', label: 'All' },
        { id: 'unread', label: 'Unread' },
        { id: 'starred', label: 'Starred' },
    ];

    return (
        <div className="flex flex-col h-full">
            <PageHeader title="Inbox" className="h-12 px-4" />

            {/* 액션 바 - 메시지 필터링 */}
            <div className={cn(
                "border-b border-[var(--container-border)]",
                "flex items-center justify-between",
                "h-12 px-4"
            )}>
                <div className="flex gap-1">
                    {filterButtons.map((filter) => (
                        <FilterButton
                            key={filter.id}
                            id={filter.id}
                            label={filter.label}
                            isActive={activeFilter === filter.id}
                            onClick={setActiveFilter}
                            className="text-xs"
                        />
                    ))}
                </div>
                <div className="flex gap-1">
                    <Button className={cn(
                        "p-1 rounded",
                        "hover:bg-[var(--secondary-hover)]/20"
                    )}>
                        <Search width={16} height={16} className="text-[var(--secondary)] opacity-60" />
                    </Button>
                    <Button className={cn(
                        "p-1 rounded",
                        "hover:bg-[var(--secondary-hover)]/20"
                    )}>
                        <Filter width={16} height={16} className="text-[var(--secondary)] opacity-60" />
                    </Button>
                </div>
            </div>

            {/* 사이드바 콘텐츠 */}
            <div className="flex-1 p-4">
                {/* 빈 사이드바 - 레이아웃만 유지 */}
            </div>
        </div>
    );
}

export default function InboxPage() {
    return (
        <div className={cn("flex h-full")}>
            {/* 왼쪽 사이드바 - 1 비율, 위쪽 끝까지 */}
            <div className={cn(
                "flex-[1] border-r border-[var(--container-border)]",
                "bg-[var(--background)]"
            )}>
                <InboxSidebar />
            </div>

            {/* 오른쪽 메인 콘텐츠 - 3 비율 */}
            <div className="flex-[3]">
                <EmptyInboxState />
            </div>
        </div>
    );
}
