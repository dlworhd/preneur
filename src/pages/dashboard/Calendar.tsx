import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";
import {
    Calendar as CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Grid3X3,
    List,
    Plus,
    Trash2,
    Clock,
    MapPin,
} from "lucide-react";

import Button from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import Modal from "@/components/common/Modal";

// 색상 상수
const COLORS = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#f59e0b", // amber
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#f97316", // orange
    "#06b6d4", // cyan
    "#84cc16", // lime
];

// 타입 정의
interface Event {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    color: string;
    location?: string;
}

interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: Event[];
}

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([
        {
            id: "1",
            title: "팀 미팅",
            description: "주간 개발 팀 미팅",
            startDate: new Date(2025, 0, 15),
            endDate: new Date(2025, 0, 15),
            color: COLORS[0],
            location: "회의실 A",
        },
        {
            id: "2",
            title: "프로젝트 마감",
            description: "AMI 프로젝트 1차 마감",
            startDate: new Date(2025, 0, 20),
            endDate: new Date(2025, 0, 22),
            color: COLORS[1],
            location: "재택근무",
        },
        {
            id: "3",
            title: "점심 약속",
            description: "동료와 점심 식사",
            startDate: new Date(2025, 0, 17),
            endDate: new Date(2025, 0, 17),
            color: COLORS[2],
            location: "이태원 맛집",
        },
    ]);

    // 무한 스크롤 상태
    const [months, setMonths] = useState<Date[]>([]);
    const [visibleMonth, setVisibleMonth] = useState(new Date());
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // 기타 상태
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Date | null>(null);
    const [dragEnd, setDragEnd] = useState<Date | null>(null);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        location: "",
        color: COLORS[0],
    });
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");
    const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

    const years = Array.from(
        { length: 10 },
        (_, i) => visibleMonth.getFullYear() - 5 + i
    );
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // 초기 월 데이터 생성
    useEffect(() => {
        const initialMonths: Date[] = [];
        const baseDate = new Date();

        for (let i = -3; i <= 3; i++) {
            const monthDate = new Date(
                baseDate.getFullYear(),
                baseDate.getMonth() + i,
                1
            );
            initialMonths.push(monthDate);
        }

        setMonths(initialMonths);
        setVisibleMonth(baseDate);
        setCurrentDate(baseDate);
    }, []);

    // 초기 로드 후 현재 달로 스크롤
    useEffect(() => {
        if (months.length > 0 && scrollContainerRef.current) {
            const timer = setTimeout(() => {
                const today = new Date();
                const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
                const monthElement = monthRefs.current.get(monthKey);

                if (monthElement && scrollContainerRef.current) {
                    monthElement.scrollIntoView({
                        behavior: "auto",
                        block: "center",
                    });
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [months.length]);

    // 현재 보이는 월 감지 (5주 이상 보이면 월 변경)
    useEffect(() => {
        if (!scrollContainerRef.current) return;

        const handleScroll = () => {
            const container = scrollContainerRef.current!;
            const containerRect = container.getBoundingClientRect();
            const dayHeight = 100;
            const rowsVisible = Math.floor(containerRect.height / dayHeight);
            const scrollTop = container.scrollTop;
            const startRowIndex = Math.floor(scrollTop / dayHeight);
            const endRowIndex = startRowIndex + rowsVisible;

            // 각 월별로 보이는 주 수 계산
            const monthWeekCount: { [key: string]: number } = {};
            const calendarData = generateContinuousCalendarData();

            for (
                let rowIndex = Math.max(0, startRowIndex);
                rowIndex <=
                Math.min(endRowIndex, Math.ceil(calendarData.length / 7) - 1);
                rowIndex++
            ) {
                const dayIndex = rowIndex * 7;
                if (dayIndex < calendarData.length) {
                    const dayData = calendarData[dayIndex];
                    const monthKey = `${dayData.date.getFullYear()}-${dayData.date.getMonth()}`;
                    monthWeekCount[monthKey] =
                        (monthWeekCount[monthKey] || 0) + 1;
                }
            }

            // 5주 이상 보이는 월 찾기
            let targetMonth: Date | undefined;
            let maxWeeks = 0;

            for (const [monthKey, weekCount] of Object.entries(
                monthWeekCount
            )) {
                if (weekCount >= 5 && weekCount > maxWeeks) {
                    const [year, month] = monthKey.split("-").map(Number);
                    targetMonth = new Date(year, month, 1);
                    maxWeeks = weekCount;
                }
            }

            // 5주 이상 보이는 월이 없으면 가장 많이 보이는 월 선택
            if (!targetMonth) {
                for (const [monthKey, weekCount] of Object.entries(
                    monthWeekCount
                )) {
                    if (weekCount > maxWeeks) {
                        const [year, month] = monthKey.split("-").map(Number);
                        targetMonth = new Date(year, month, 1);
                        maxWeeks = weekCount;
                    }
                }
            }

            if (
                targetMonth &&
                targetMonth.getTime() !== visibleMonth.getTime()
            ) {
                setVisibleMonth(targetMonth);
                setCurrentDate(targetMonth);
            }
        };

        const container = scrollContainerRef.current;
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [months, events, visibleMonth]);

    // 스크롤 끝 감지해서 새 월 추가
    useEffect(() => {
        if (!scrollContainerRef.current) return;

        const handleScroll = () => {
            const container = scrollContainerRef.current!;
            const { scrollTop, scrollHeight, clientHeight } = container;

            if (scrollTop < 500 && months.length > 0) {
                const firstMonth = months[0];
                const newMonths: Date[] = [];

                for (let i = 3; i > 0; i--) {
                    const prevMonth = new Date(
                        firstMonth.getFullYear(),
                        firstMonth.getMonth() - i,
                        1
                    );
                    newMonths.push(prevMonth);
                }

                setMonths((prev) => [...newMonths, ...prev]);
            }

            if (
                scrollTop + clientHeight > scrollHeight - 500 &&
                months.length > 0
            ) {
                const lastMonth = months[months.length - 1];
                const newMonths: Date[] = [];

                for (let i = 1; i <= 3; i++) {
                    const nextMonth = new Date(
                        lastMonth.getFullYear(),
                        lastMonth.getMonth() + i,
                        1
                    );
                    newMonths.push(nextMonth);
                }

                setMonths((prev) => [...prev, ...newMonths]);
            }
        };

        const container = scrollContainerRef.current;
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [months]);

    // 특정 월로 스크롤 이동
    const scrollToMonth = (targetDate: Date) => {
        const monthKey = `${targetDate.getFullYear()}-${targetDate.getMonth()}`;
        const monthElement = monthRefs.current.get(monthKey);

        if (monthElement && scrollContainerRef.current) {
            monthElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };

    // 핸들러 함수들
    const handleMonthSelect = (monthIndex: number) => {
        const newDate = new Date(visibleMonth.getFullYear(), monthIndex, 1);
        scrollToMonth(newDate);
    };

    const handleYearSelect = (year: number) => {
        const newDate = new Date(year, visibleMonth.getMonth(), 1);
        scrollToMonth(newDate);
    };

    const changeMonth = (direction: "prev" | "next") => {
        const newDate = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth() + (direction === "next" ? 1 : -1),
            1
        );
        scrollToMonth(newDate);
    };

    const goToToday = () => {
        const today = new Date();
        scrollToMonth(today);
    };

    // 연속된 캘린더 데이터 생성
    const generateContinuousCalendarData = (): CalendarDay[] => {
        const allDays: CalendarDay[] = [];
        const today = new Date();
        const currentVisibleMonth = visibleMonth.getMonth();
        const currentVisibleYear = visibleMonth.getFullYear();

        months.forEach((monthDate) => {
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();
            const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

            for (let day = 1; day <= lastDayOfMonth; day++) {
                const date = new Date(year, month, day);
                const isToday = date.toDateString() === today.toDateString();
                const isCurrentMonth =
                    month === currentVisibleMonth &&
                    year === currentVisibleYear;
                const dayEvents = events.filter(
                    (event) =>
                        date >=
                            new Date(
                                event.startDate.getFullYear(),
                                event.startDate.getMonth(),
                                event.startDate.getDate()
                            ) &&
                        date <=
                            new Date(
                                event.endDate.getFullYear(),
                                event.endDate.getMonth(),
                                event.endDate.getDate()
                            )
                );

                allDays.push({
                    date,
                    isCurrentMonth,
                    isToday,
                    events: dayEvents,
                });
            }
        });

        return allDays;
    };

    // 연속된 캘린더 데이터 생성
    const continuousCalendarData = React.useMemo(() => {
        return generateContinuousCalendarData();
    }, [months, events, visibleMonth]);

    // 드래그 핸들러들
    const handleMouseDown = (date: Date, e: React.MouseEvent) => {
        e.preventDefault();
        setDragStart(date);
        setDragEnd(date);
        setIsDragging(true);
    };

    const handleMouseEnter = (date: Date, e: React.MouseEvent) => {
        if (isDragging && dragStart) {
            setDragEnd(date);
        }
    };

    const handleMouseUp = (date: Date, e: React.MouseEvent) => {
        if (isDragging && dragStart) {
            setNewEvent({
                title: "",
                description: "",
                location: "",
                color: COLORS[0],
            });

            const start = dragStart < dragEnd! ? dragStart : dragEnd!;
            const end = dragStart < dragEnd! ? dragEnd! : dragStart;
            setCustomStartDate(start.toISOString().split("T")[0]);
            setCustomEndDate(end.toISOString().split("T")[0]);
            setIsCreatingEvent(true);
        }
        setIsDragging(false);
    };

    // 일정 관련 함수들
    const handleCreateEvent = () => {
        if (!newEvent.title.trim()) return;

        let startDate: Date;
        let endDate: Date;

        if (customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            endDate = new Date(customEndDate);
        } else if (dragStart && dragEnd) {
            startDate = dragStart < dragEnd! ? dragStart : dragEnd!;
            endDate = dragStart < dragEnd! ? dragEnd! : dragStart;
        } else {
            return;
        }

        if (startDate > endDate) {
            [startDate, endDate] = [endDate, startDate];
        }

        const event: Event = {
            id: Date.now().toString(),
            title: newEvent.title,
            description: newEvent.description,
            startDate,
            endDate,
            color: newEvent.color,
            location: newEvent.location,
        };

        setEvents((prev) => [...prev, event]);
        setIsCreatingEvent(false);
        setDragStart(null);
        setDragEnd(null);
        setCustomStartDate("");
        setCustomEndDate("");
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
    };

    // 드래그 관련 유틸리티 함수들
    const isInDragRange = (date: Date): boolean => {
        if (!dragStart || !dragEnd) return false;
        const start = dragStart < dragEnd ? dragStart : dragEnd;
        const end = dragStart < dragEnd ? dragEnd : dragStart;
        return date >= start && date <= end;
    };

    const isDragStart = (date: Date): boolean => {
        return dragStart?.getTime() === date.getTime();
    };

    const isDragEnd = (date: Date): boolean => {
        return dragEnd?.getTime() === date.getTime();
    };

    const getDragDuration = (): number => {
        if (!dragStart || !dragEnd) return 0;
        const diffTime = Math.abs(dragEnd.getTime() - dragStart.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <div className={cn("flex flex-col h-full")}>
            {/* 헤더 */}
            <div
                className={cn(
                    "border-b border-[var(--container-border)]",
                    "flex items-center justify-between flex-[0.5] px-2"
                )}
            >
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                        <div className="relative">
                            <Select
                                key={`year-${visibleMonth.getFullYear()}`}
                                onValueChange={(value) =>
                                    handleYearSelect(parseInt(value))
                                }
                                defaultValue={visibleMonth
                                    .getFullYear()
                                    .toString()}
                            >
                                <Select.Trigger>
                                    <span className="text-sm font-medium text-[var(--secondary)] cursor-pointer hover:text-[var(--primary)] px-2 py-1 rounded transition-colors w-12 inline-block text-center">
                                        <Select.Value />
                                    </span>
                                </Select.Trigger>
                                <Select.Content className="flex flex-col justify-center">
                                    {years.map((year) => (
                                        <Select.Item
                                            key={year}
                                            value={year.toString()}
                                        >
                                            {year}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select>
                        </div>
                        <div className="relative">
                            <Select
                                key={`month-${visibleMonth.getMonth()}`}
                                onValueChange={(value) => {
                                    const monthIndex =
                                        monthNames.indexOf(value);
                                    handleMonthSelect(monthIndex);
                                }}
                                defaultValue={
                                    monthNames[visibleMonth.getMonth()]
                                }
                            >
                                <Select.Trigger>
                                    <span className="text-sm font-medium text-[var(--secondary)] cursor-pointer hover:text-[var(--primary)] px-2 py-1 rounded transition-colors w-12 inline-block text-center">
                                        <Select.Value />
                                    </span>
                                </Select.Trigger>
                                <Select.Content className="flex flex-col justify-center">
                                    {monthNames.map((month) => (
                                        <Select.Item key={month} value={month}>
                                            {month}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select>
                        </div>
                    </div>

                    <Button
                        onClick={goToToday}
                        className="px-3 py-1 text-xs bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Today
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex gap-2 items-center">
                        <Button onClick={() => changeMonth("prev")}>←</Button>
                        <Button onClick={() => changeMonth("next")}>→</Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => setViewMode("calendar")}
                            className={cn(
                                "p-2",
                                viewMode === "calendar"
                                    ? "bg-[var(--primary)] text-white"
                                    : "bg-transparent"
                            )}
                        >
                            <Grid3X3 width={16} height={16} />
                        </Button>
                        <Button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-2",
                                viewMode === "list"
                                    ? "bg-[var(--primary)] text-white"
                                    : "bg-transparent"
                            )}
                        >
                            <List width={16} height={16} />
                        </Button>
                    </div>

                    <Button
                        onClick={() => {
                            setNewEvent({
                                title: "",
                                description: "",
                                location: "",
                                color: COLORS[0],
                            });
                            setCustomStartDate("");
                            setCustomEndDate("");
                            setDragStart(null);
                            setDragEnd(null);
                            setIsCreatingEvent(true);
                        }}
                    >
                        <div className="flex gap-2 items-center">
                            <Plus width={20} height={20} />
                            <span>New Event</span>
                        </div>
                    </Button>
                </div>

                {isDragging && dragStart && dragEnd && (
                    <div className="absolute top-full left-0 right-0 p-2 bg-[var(--background)] border-b border-[var(--container-border)]">
                        <span className="text-xs text-[var(--primary)] ml-2">
                            선택:{" "}
                            {dragStart.toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric",
                            })}{" "}
                            -{" "}
                            {dragEnd.toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric",
                            })}{" "}
                            ({getDragDuration()}일)
                        </span>
                    </div>
                )}
            </div>

            {/* 무한 스크롤 캘린더 */}
            <div
                ref={scrollContainerRef}
                className={cn(
                    "bg-[var(--background)]",
                    "scrollbar-container will-change-scroll flex-[8] h-full overflow-y-auto z-1"
                )}
            >
                {viewMode === "calendar" ? (
                    <div className="relative">
                        {/* 요일 헤더 - 고정 */}
                        <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--container-border)]">
                            <div className="grid grid-cols-7 gap-1 p-2">
                                {weekDays.map((day) => (
                                    <div
                                        key={day}
                                        className="p-2 text-center text-xs font-medium text-[var(--secondary)] opacity-60"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 동적 월 표시 */}
                        <div className="sticky top-10 z-10 bg-[var(--background)]/90 backdrop-blur-sm border-b border-[var(--container-border)]/50 p-2">
                            <h3 className="text-sm font-mediuborder-[var]]m text-[var(--secondary)] text-center">
                                {visibleMonth.getFullYear()}년{" "}
                                {monthNames[visibleMonth.getMonth()]}
                            </h3>
                        </div>

                        {/* 연속된 캘린더 그리드 */}
                        <div className="grid grid-cols-7 gap-1 select-none p-2">
                            {continuousCalendarData.map((day, index) => (
                                <div
                                    key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
                                    ref={(el) => {
                                        if (el && index % 7 === 0) {
                                            const monthKey = `${day.date.getFullYear()}-${day.date.getMonth()}`;
                                            monthRefs.current.set(monthKey, el);
                                        }
                                    }}
                                    className={cn(
                                        "min-h-[100px] p-2 cursor-pointer relative hover:bg-amber-100/10",
                                        "bg-[var(--background)] border transition-all duration-300 ease-in-out",
                                        day.isCurrentMonth
                                            ? "border-[var(--border-2)]"
                                            : "",
                                        day.isToday &&
                                            "ring-1 ring-[var(--primary)]",
                                        isDragging && "cursor-grabbing"
                                    )}
                                    onMouseDown={(e) =>
                                        handleMouseDown(day.date, e)
                                    }
                                    onMouseEnter={(e) =>
                                        handleMouseEnter(day.date, e)
                                    }
                                    onMouseUp={(e) =>
                                        handleMouseUp(day.date, e)
                                    }
                                >
                                    {/* 드래그 하이라이트 */}
                                    {isDragging && isInDragRange(day.date) && (
                                        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-2 bg-[var(--primary)] opacity-80 z-10 rounded" />
                                    )}

                                    <div
                                        className={cn(
                                            "text-xs font-medium mb-1 flex items-center justify-between relative z-20",
                                            "text-[var(--secondary)]",
                                            day.isToday &&
                                                "text-[var(--primary)] font-bold"
                                        )}
                                    >
                                        <span>{day.date.getDate()}</span>
                                        {isDragging && (
                                            <>
                                                {isDragStart(day.date) && (
                                                    <span className="text-xs bg-[var(--primary)] text-white px-1 rounded z-30">
                                                        시작
                                                    </span>
                                                )}
                                                {isDragEnd(day.date) &&
                                                    dragStart?.getTime() !==
                                                        dragEnd?.getTime() && (
                                                        <span className="text-xs bg-[var(--primary)] text-white px-1 rounded z-30">
                                                            끝
                                                        </span>
                                                    )}
                                            </>
                                        )}
                                    </div>

                                    {/* 이벤트 표시 */}
                                    <div className="space-y-1 relative z-20">
                                        {day.events
                                            .slice(0, 3)
                                            .map((event: Event) => (
                                                <div
                                                    key={event.id}
                                                    className="text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                                                    style={{
                                                        backgroundColor:
                                                            event.color,
                                                    }}
                                                    onClick={() =>
                                                        handleDeleteEvent(
                                                            event.id
                                                        )
                                                    }
                                                    title={`${event.title} (클릭해서 삭제)`}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}
                                        {day.events.length > 3 && (
                                            <div className="text-xs text-[var(--secondary)] opacity-60 p-1">
                                                +{day.events.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* 리스트 뷰 */
                    <div className="p-4">
                        <div className="space-y-4">
                            {events.length === 0 ? (
                                <div className="text-center text-[var(--secondary)] opacity-60 py-8">
                                    등록된 일정이 없습니다
                                </div>
                            ) : (
                                events
                                    .sort(
                                        (a, b) =>
                                            a.startDate.getTime() -
                                            b.startDate.getTime()
                                    )
                                    .map((event) => (
                                        <div
                                            key={event.id}
                                            className="bg-[var(--background)] border border-[var(--container-border)] rounded-xl p-4 hover:bg-amber-100/10 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div
                                                        className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                                                        style={{
                                                            backgroundColor:
                                                                event.color,
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-[var(--secondary)] mb-1">
                                                            {event.title}
                                                        </h3>
                                                        {event.description && (
                                                            <p className="text-sm text-[var(--secondary)] opacity-70 mb-2">
                                                                {
                                                                    event.description
                                                                }
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-xs text-[var(--secondary)] opacity-60">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {event.startDate.toLocaleDateString(
                                                                    "ko-KR"
                                                                )}
                                                                {event.startDate.getTime() !==
                                                                    event.endDate.getTime() &&
                                                                    ` - ${event.endDate.toLocaleDateString(
                                                                        "ko-KR"
                                                                    )}`}
                                                            </div>
                                                            {event.location && (
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {
                                                                        event.location
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteEvent(
                                                            event.id
                                                        )
                                                    }
                                                    className="p-1 text-[var(--secondary)] opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 일정 생성 모달 */}
            {isCreatingEvent && (
                <Modal
                    isOpen={isCreatingEvent}
                    onClose={() => {
                        setIsCreatingEvent(false);
                        setDragStart(null);
                        setDragEnd(null);
                        setIsDragging(false);
                        setCustomStartDate("");
                        setCustomEndDate("");
                    }}
                    width="400px"
                >
                    <div className="flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">
                                새 일정 만들기
                            </h3>
                            <div>
                                <Select
                                    className="w-28"
                                    onValueChange={(color) => {
                                        setNewEvent((prev) => ({
                                            ...prev,
                                            color,
                                        }));
                                    }}
                                    defaultValue={newEvent.color}
                                >
                                    <Select.Trigger>
                                        <div className="flex items-center w-full gap-1">
                                            <div
                                                className="w-4 h-4 rounded-full mr-2"
                                                style={{
                                                    backgroundColor:
                                                        newEvent.color,
                                                }}
                                            />
                                            <Select.Value placeholder="색상 선택" />
                                        </div>
                                    </Select.Trigger>
                                    <Select.Content>
                                        {COLORS.map((color) => (
                                            <Select.Item
                                                key={color}
                                                value={color}
                                            >
                                                <div className="flex items-center">
                                                    <div
                                                        className="w-4 h-4 rounded-full mr-2"
                                                        style={{
                                                            backgroundColor:
                                                                color,
                                                        }}
                                                    />
                                                    {color}
                                                </div>
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    제목 *
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) =>
                                        setNewEvent((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    className="w-full p-3 border border-[var(--border-1)] rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50"
                                    placeholder="일정 제목을 입력하세요"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    설명
                                </label>
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) =>
                                        setNewEvent((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    className="w-full p-3 border border-[var(--border-1)] rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 resize-none"
                                    rows={3}
                                    placeholder="일정 설명을 입력하세요"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    위치
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.location}
                                    onChange={(e) =>
                                        setNewEvent((prev) => ({
                                            ...prev,
                                            location: e.target.value,
                                        }))
                                    }
                                    className="w-full p-3 border border-[var(--border-1)] rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50"
                                    placeholder="위치를 입력하세요"
                                />
                            </div>

                            <div>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">
                                            시작일
                                        </label>
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) =>
                                                setCustomStartDate(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full p-2 border border-[var(--border-1)] rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-muted-foreground mb-1">
                                            종료일{" "}
                                        </label>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) =>
                                                setCustomEndDate(e.target.value)
                                            }
                                            className="w-full p-2 border border-[var(--border-1)] rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setIsCreatingEvent(false);
                                    setDragStart(null);
                                    setDragEnd(null);
                                    setIsDragging(false);
                                    setCustomStartDate("");
                                    setCustomEndDate("");
                                }}
                                className="flex-1 px-4 py-2 border border-[var(--border-1)] rounded-xl text-muted-foreground hover:bg-accent/10 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCreateEvent}
                                disabled={
                                    !newEvent.title.trim() ||
                                    ((!customStartDate || !customEndDate) &&
                                        (!dragStart || !dragEnd))
                                }
                                className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                생성
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
