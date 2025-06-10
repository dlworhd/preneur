import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Calendar,
    CheckSquare,
    Inbox,
    Settings,
    BarChart3,
    Repeat,
    Search,
    Home,
    User,
    Moon,
    Sun,
    LogOut,
    Plus,
    Edit,
    Trash2,
    Archive,
    Bell,
    Download,
    Upload,
    Copy,
    ExternalLink,
} from "lucide-react";
import Modal from "./Modal";
import { cn } from "@/lib/utils";

interface Command {
    id: string;
    title: string;
    description?: string;
    icon: React.ReactNode;
    action: () => void;
    category: string;
    keywords?: string[];
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 전체 커맨드 목록
    const commands: Command[] = [
        // 네비게이션
        {
            id: "nav-dashboard",
            title: "대시보드로 이동",
            description: "메인 대시보드 페이지",
            icon: <Home className="w-4 h-4" />,
            action: () => {
                navigate("/dashboard");
                onClose();
            },
            category: "네비게이션",
            keywords: ["dashboard", "홈", "메인"],
        },
        {
            id: "nav-calendar",
            title: "캘린더로 이동",
            description: "일정 관리 페이지",
            icon: <Calendar className="w-4 h-4" />,
            action: () => {
                navigate("/dashboard/calendar");
                onClose();
            },
            category: "네비게이션",
            keywords: ["calendar", "일정", "스케줄"],
        },
        {
            id: "nav-tasks",
            title: "작업으로 이동",
            description: "할 일 관리 페이지",
            icon: <CheckSquare className="w-4 h-4" />,
            action: () => {
                navigate("/dashboard/tasks");
                onClose();
            },
            category: "네비게이션",
            keywords: ["tasks", "todo", "할일", "작업"],
        },
        {
            id: "nav-routines",
            title: "루틴으로 이동",
            description: "루틴 관리 페이지",
            icon: <Repeat className="w-4 h-4" />,
            action: () => {
                navigate("/dashboard/routines");
                onClose();
            },
            category: "네비게이션",
            keywords: ["routines", "루틴", "습관"],
        },
        {
            id: "nav-inbox",
            title: "인박스로 이동",
            description: "빠른 메모 및 아이디어",
            icon: <Inbox className="w-4 h-4" />,
            action: () => {
                navigate("/dashboard/inbox");
                onClose();
            },
            category: "네비게이션",
            keywords: ["inbox", "인박스", "메모"],
        },
        {
            id: "nav-settings",
            title: "설정으로 이동",
            description: "애플리케이션 설정",
            icon: <Settings className="w-4 h-4" />,
            action: () => {
                navigate("/dashboard/settings");
                onClose();
            },
            category: "네비게이션",
            keywords: ["settings", "설정", "환경설정"],
        },

        // 액션
        {
            id: "action-new-event",
            title: "새 일정 추가",
            description: "새로운 캘린더 일정 생성",
            icon: <Plus className="w-4 h-4" />,
            action: () => {
                navigate("/dashboard/calendar");
                onClose();
                // 캘린더 페이지에서 새 일정 모달을 여는 로직은 별도로 구현 필요
            },
            category: "액션",
            keywords: ["event", "일정", "새로운", "추가", "생성"],
        },
        {
            id: "action-new-task",
            title: "새 작업 추가",
            description: "새로운 할 일 생성",
            icon: <Plus className="w-4 h-4" />,
            action: () => {
                navigate("/dashboard/tasks");
                onClose();
            },
            category: "액션",
            keywords: ["task", "todo", "작업", "할일", "새로운"],
        },
        {
            id: "action-new-routine",
            title: "새 루틴 추가",
            description: "새로운 루틴 생성",
            icon: <Plus className="w-4 h-4" />,
            action: () => {
                navigate("/dashboard/routines");
                onClose();
            },
            category: "액션",
            keywords: ["routine", "루틴", "습관", "새로운"],
        },

        // 테마
        {
            id: "theme-dark",
            title: "다크 모드 전환",
            description: "어두운 테마로 변경",
            icon: <Moon className="w-4 h-4" />,
            action: () => {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
                onClose();
            },
            category: "테마",
            keywords: ["dark", "다크", "어두운", "테마"],
        },
        {
            id: "theme-light",
            title: "라이트 모드 전환",
            description: "밝은 테마로 변경",
            icon: <Sun className="w-4 h-4" />,
            action: () => {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
                onClose();
            },
            category: "테마",
            keywords: ["light", "라이트", "밝은", "테마"],
        },

        // 기타
        {
            id: "action-copy-url",
            title: "현재 페이지 URL 복사",
            description: "현재 페이지의 URL을 클립보드에 복사",
            icon: <Copy className="w-4 h-4" />,
            action: () => {
                navigator.clipboard.writeText(window.location.href);
                onClose();
            },
            category: "기타",
            keywords: ["copy", "url", "복사", "링크"],
        },
        {
            id: "action-refresh",
            title: "페이지 새로고침",
            description: "현재 페이지 새로고침",
            icon: <Download className="w-4 h-4" />,
            action: () => {
                window.location.reload();
            },
            category: "기타",
            keywords: ["refresh", "reload", "새로고침"],
        },
    ];

    // 검색 필터링
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredCommands(commands);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = commands.filter(
                (command) =>
                    command.title.toLowerCase().includes(query) ||
                    command.description?.toLowerCase().includes(query) ||
                    command.keywords?.some((keyword) =>
                        keyword.toLowerCase().includes(query)
                    ) ||
                    command.category.toLowerCase().includes(query)
            );
            setFilteredCommands(filtered);
        }
        setSelectedIndex(0);
    }, [searchQuery]);

    // 키보드 네비게이션
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < filteredCommands.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredCommands.length - 1
                    );
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].action();
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, filteredCommands, selectedIndex, onClose]);

    // 포커스 관리
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // 모달이 닫힐 때 검색어 초기화
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
        }
    }, [isOpen]);

    // 카테고리별 그룹화
    const groupedCommands = filteredCommands.reduce((acc, command) => {
        if (!acc[command.category]) {
            acc[command.category] = [];
        }
        acc[command.category].push(command);
        return acc;
    }, {} as Record<string, Command[]>);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="커맨드 팔레트"
            subtitle="원하는 기능을 빠르게 실행하세요"
        >
            <div className="space-y-4">
                {/* 검색 입력 */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--secondary)]/40" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="커맨드를 입력하세요..."
                        className="w-full pl-10 pr-16 py-3 bg-[var(--background)] border border-[var(--container-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]/30 transition-all duration-200 text-[var(--secondary)] placeholder-[var(--secondary)]/40"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-[var(--container-border)]/20 rounded text-xs text-[var(--secondary)]/40">
                            ↑↓
                        </kbd>
                        <kbd className="px-2 py-1 bg-[var(--container-border)]/20 rounded text-xs text-[var(--secondary)]/40">
                            ESC
                        </kbd>
                    </div>
                </div>

                {/* 커맨드 목록 */}
                <div className="max-h-96 overflow-y-auto">
                    {filteredCommands.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="w-8 h-8 mx-auto mb-4 text-[var(--secondary)]/40" />
                            <p className="text-[var(--secondary)]/60 font-medium">
                                {searchQuery.trim() === ""
                                    ? "커맨드를 검색해보세요"
                                    : "일치하는 커맨드가 없습니다"}
                            </p>
                            <p className="text-sm text-[var(--secondary)]/40 mt-1">
                                다른 키워드로 검색해보세요
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(groupedCommands).map(([category, commands]) => (
                                <div key={category}>
                                    <h3 className="text-xs font-semibold text-[var(--secondary)]/60 uppercase tracking-wider mb-2 px-2">
                                        {category}
                                    </h3>
                                    <div className="space-y-1">
                                        {commands.map((command, index) => {
                                            const globalIndex = filteredCommands.indexOf(command);
                                            return (
                                                <div
                                                    key={command.id}
                                                    onClick={() => command.action()}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200",
                                                        globalIndex === selectedIndex
                                                            ? "bg-[var(--primary)]/10 border border-[var(--primary)]/20"
                                                            : "hover:bg-[var(--container-border)]/20 border border-transparent"
                                                    )}
                                                >
                                                    <div className="flex-shrink-0 text-[var(--secondary)]/60">
                                                        {command.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-[var(--secondary)] text-sm">
                                                            {command.title}
                                                        </div>
                                                        {command.description && (
                                                            <div className="text-xs text-[var(--secondary)]/60 mt-0.5">
                                                                {command.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {globalIndex === selectedIndex && (
                                                        <kbd className="px-2 py-1 bg-[var(--primary)]/20 text-[var(--primary)] rounded text-xs font-medium">
                                                            ↵
                                                        </kbd>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 도움말 */}
                <div className="text-center pt-4 border-t border-[var(--container-border)]/20">
                    <p className="text-xs text-[var(--secondary)]/40">
                        <kbd className="px-2 py-1 bg-[var(--container-border)]/20 rounded">Cmd</kbd> + <kbd className="px-2 py-1 bg-[var(--container-border)]/20 rounded">/</kbd> 로 언제든 열 수 있습니다
                    </p>
                </div>
            </div>
        </Modal>
    );
} 