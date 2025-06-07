import { cn } from "@/lib/utils";
import React, { useState, useEffect, useRef } from "react";
import {
    Calendar as CalendarIcon,
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

interface MonthData {
    year: number;
    month: number;
    days: CalendarDay[];
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

    // 월 단위 스크롤 상태
    const [months, setMonths] = useState<MonthData[]>([]);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // 애니메이션 상태
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev' | null>(null);

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
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isViewingEvents, setIsViewingEvents] = useState(false);
    
    // 드래그 자동 스크롤 상태
    const [dragEdgeTimer, setDragEdgeTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [dragEdgeDirection, setDragEdgeDirection] = useState<'prev' | 'next' | null>(null);
    


    const years = Array.from(
        { length: 10 },
        (_, i) => currentDate.getFullYear() - 5 + i
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

    // 월 데이터 생성 함수
    const generateMonthData = React.useCallback(
        (year: number, month: number): MonthData => {
            const days: CalendarDay[] = [];
            const today = new Date();

            // 해당 월의 첫 번째 날과 마지막 날
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);

            // 주의 시작을 일요일로 맞추기 위해 이전 월의 날들 추가
            const firstDayOfWeek = firstDay.getDay();
            for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                const prevDate = new Date(year, month, -i);
                const isToday =
                    prevDate.toDateString() === today.toDateString();
                const dayEvents = events.filter((event) => {
                    const eventStart = new Date(
                        event.startDate.getFullYear(),
                        event.startDate.getMonth(),
                        event.startDate.getDate()
                    );
                    const eventEnd = new Date(
                        event.endDate.getFullYear(),
                        event.endDate.getMonth(),
                        event.endDate.getDate()
                    );
                    const currentDay = new Date(
                        prevDate.getFullYear(),
                        prevDate.getMonth(),
                        prevDate.getDate()
                    );
                    return currentDay >= eventStart && currentDay <= eventEnd;
                });

                days.push({
                    date: prevDate,
                    isCurrentMonth: false,
                    isToday,
                    events: dayEvents,
                });
            }

            // 해당 월의 날들
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const date = new Date(year, month, day);
                const isToday = date.toDateString() === today.toDateString();
                const dayEvents = events.filter((event) => {
                    const eventStart = new Date(
                        event.startDate.getFullYear(),
                        event.startDate.getMonth(),
                        event.startDate.getDate()
                    );
                    const eventEnd = new Date(
                        event.endDate.getFullYear(),
                        event.endDate.getMonth(),
                        event.endDate.getDate()
                    );
                    const currentDay = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    );
                    return currentDay >= eventStart && currentDay <= eventEnd;
                });

                days.push({
                    date,
                    isCurrentMonth: true,
                    isToday,
                    events: dayEvents,
                });
            }

            // 6주(42일)로 고정하기 위해 다음 월의 날들 추가
            // 현재 days 배열이 42개가 될 때까지 다음 월 날들을 추가
            let nextDay = 1;
            while (days.length < 42) {
                const nextDate = new Date(year, month + 1, nextDay);
                const isToday =
                    nextDate.toDateString() === today.toDateString();
                const dayEvents = events.filter((event) => {
                    const eventStart = new Date(
                        event.startDate.getFullYear(),
                        event.startDate.getMonth(),
                        event.startDate.getDate()
                    );
                    const eventEnd = new Date(
                        event.endDate.getFullYear(),
                        event.endDate.getMonth(),
                        event.endDate.getDate()
                    );
                    const currentDay = new Date(
                        nextDate.getFullYear(),
                        nextDate.getMonth(),
                        nextDate.getDate()
                    );
                    return currentDay >= eventStart && currentDay <= eventEnd;
                });

                days.push({
                    date: nextDate,
                    isCurrentMonth: false,
                    isToday,
                    events: dayEvents,
                });

                nextDay++;
            }

            return { year, month, days };
        },
        [events]
    );

    // 초기 월 데이터 생성 (현재 월 + 이전/다음 월)
    useEffect(() => {
        const today = new Date();
        const initialMonths: MonthData[] = [];

        // 이전 월, 현재 월, 다음 월
        for (let i = -1; i <= 1; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
            initialMonths.push(
                generateMonthData(date.getFullYear(), date.getMonth())
            );
        }

        setMonths(initialMonths);
        setCurrentMonthIndex(1); // 중간이 현재 월
        setCurrentDate(today);
    }, []);

    // 월 변경 시 currentDate 업데이트
    useEffect(() => {
        if (
            months.length > 0 &&
            currentMonthIndex >= 0 &&
            currentMonthIndex < months.length
        ) {
            const currentMonth = months[currentMonthIndex];
            setCurrentDate(new Date(currentMonth.year, currentMonth.month, 1));
        }
    }, [currentMonthIndex, months]);

    // 이벤트가 변경될 때 모든 월 데이터 새로고침
    useEffect(() => {
        if (months.length > 0) {
            const updatedMonths = months.map((month) =>
                generateMonthData(month.year, month.month)
            );
            setMonths(updatedMonths);
        }
    }, [events, generateMonthData]);

    // 스크롤 이벤트 처리 (월 단위 스냅)
    useEffect(() => {
        if (!scrollContainerRef.current) return;

        let lastScrollTime = 0;
        let isScrolling = false;

        const handleScroll = (e: WheelEvent) => {
            e.preventDefault();

            // 이미 스크롤 중이거나 애니메이션 중이면 무시
            if (isScrolling || isTransitioning) return;

            const now = Date.now();
            // 기본 디바운싱
            if (now - lastScrollTime < 100) return;

            // 스크롤 방향만 감지 (크기는 무시)
            const delta = e.deltaY;
            const threshold = 5; // 최소 스크롤 임계값 (더 작게)

            if (Math.abs(delta) < threshold) return;

            // 스크롤 시작 - 방향만 확인하고 항상 1월씩만 이동
            isScrolling = true;
            lastScrollTime = now;

            // 스크롤 방향에 따라 무조건 1월씩만 이동 (애니메이션 적용)
            if (delta > 0) {
                // 아래로 스크롤 - 다음 달로 1월만 이동
                if (currentMonthIndex < months.length - 1) {
                    setIsTransitioning(true);
                    setTransitionDirection('next');
                    
                    setTimeout(() => {
                        setCurrentMonthIndex((prev) => prev + 1);
                        setTimeout(() => {
                            setIsTransitioning(false);
                            setTransitionDirection(null);
                        }, 300);
                    }, 150);
                }
            } else {
                // 위로 스크롤 - 이전 달로 1월만 이동
                if (currentMonthIndex > 0) {
                    setIsTransitioning(true);
                    setTransitionDirection('prev');
                    
                    setTimeout(() => {
                        setCurrentMonthIndex((prev) => prev - 1);
                        setTimeout(() => {
                            setIsTransitioning(false);
                            setTransitionDirection(null);
                        }, 300);
                    }, 150);
                }
            }

            // 1100ms 후 스크롤 다시 활성화 (애니메이션 시간 + 여유시간)
            setTimeout(() => {
                isScrolling = false;
            }, 1100);
        };

        const container = scrollContainerRef.current;
        container.addEventListener("wheel", handleScroll, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleScroll);
        };
    }, [months.length]);

    // 키보드 이벤트 처리 (화살표 키로 월 이동)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 애니메이션 중이면 무시
            if (isTransitioning) return;
            
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (currentMonthIndex > 0) {
                    setIsTransitioning(true);
                    setTransitionDirection('prev');
                    
                    setTimeout(() => {
                        setCurrentMonthIndex((prev) => prev - 1);
                        setTimeout(() => {
                            setIsTransitioning(false);
                            setTransitionDirection(null);
                        }, 300);
                    }, 150);
                }
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                if (currentMonthIndex < months.length - 1) {
                    setIsTransitioning(true);
                    setTransitionDirection('next');
                    
                    setTimeout(() => {
                        setCurrentMonthIndex((prev) => prev + 1);
                        setTimeout(() => {
                            setIsTransitioning(false);
                            setTransitionDirection(null);
                        }, 300);
                    }, 150);
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [months.length, currentMonthIndex, isTransitioning]);

    // 월 추가 (필요시)
    useEffect(() => {
        if (currentMonthIndex <= 1 && months.length > 0) {
            // 앞쪽 2개 월에 도달하면 이전 월들 추가
                const firstMonth = months[0];
            const newMonths: MonthData[] = [];

                for (let i = 3; i > 0; i--) {
                const date = new Date(firstMonth.year, firstMonth.month - i, 1);
                newMonths.push(
                    generateMonthData(date.getFullYear(), date.getMonth())
                );
                }

                setMonths((prev) => [...newMonths, ...prev]);
            setCurrentMonthIndex((prev) => prev + newMonths.length);
        } else if (
            currentMonthIndex >= months.length - 2 &&
                months.length > 0
            ) {
            // 뒤쪽 2개 월에 도달하면 다음 월들 추가
                const lastMonth = months[months.length - 1];
            const newMonths: MonthData[] = [];

                for (let i = 1; i <= 3; i++) {
                const date = new Date(lastMonth.year, lastMonth.month + i, 1);
                newMonths.push(
                    generateMonthData(date.getFullYear(), date.getMonth())
                );
                }

                setMonths((prev) => [...prev, ...newMonths]);
            }
    }, [currentMonthIndex, months.length, generateMonthData]); // generateMonthData 의존성 추가

    // 핸들러 함수들
    const handleMonthSelect = (monthIndex: number) => {
        const targetDate = new Date(currentDate.getFullYear(), monthIndex, 1);
        goToMonth(targetDate);
    };

    const handleYearSelect = (year: number) => {
        const targetDate = new Date(year, currentDate.getMonth(), 1);
        goToMonth(targetDate);
    };

    const changeMonth = (direction: "prev" | "next") => {
        if (isTransitioning) return; // 애니메이션 중에는 월 변경 방지
        
        if (direction === "next" && currentMonthIndex < months.length - 1) {
            setIsTransitioning(true);
            setTransitionDirection('next');
            
            setTimeout(() => {
                setCurrentMonthIndex((prev) => prev + 1);
                setTimeout(() => {
                    setIsTransitioning(false);
                    setTransitionDirection(null);
                }, 300); // 애니메이션 시간과 동일
            }, 150); // 절반 시간에 실제 변경
        } else if (direction === "prev" && currentMonthIndex > 0) {
            setIsTransitioning(true);
            setTransitionDirection('prev');
            
            setTimeout(() => {
                setCurrentMonthIndex((prev) => prev - 1);
                setTimeout(() => {
                    setIsTransitioning(false);
                    setTransitionDirection(null);
                }, 300); // 애니메이션 시간과 동일
            }, 150); // 절반 시간에 실제 변경
        }
    };

    const goToToday = () => {
        const today = new Date();
        goToMonth(today);
    };

    const goToMonth = (targetDate: Date) => {
        if (isTransitioning) return; // 애니메이션 중에는 월 변경 방지
        
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();

        // 현재 months에서 해당 월 찾기
        const monthIndex = months.findIndex(
            (m) => m.year === targetYear && m.month === targetMonth
        );

        if (monthIndex !== -1) {
            // 현재 월과 다른 경우에만 애니메이션 적용
            if (monthIndex !== currentMonthIndex) {
                const direction = monthIndex > currentMonthIndex ? 'next' : 'prev';
                setIsTransitioning(true);
                setTransitionDirection(direction);
                
                setTimeout(() => {
                    setCurrentMonthIndex(monthIndex);
                    setTimeout(() => {
                        setIsTransitioning(false);
                        setTransitionDirection(null);
                    }, 300);
                }, 150);
            }
        } else {
            // 해당 월이 없으면 새로 생성 (애니메이션 없이)
            const newMonths: MonthData[] = [];

            // 타겟 월 기준으로 이전/현재/다음 월 생성
            for (let i = -1; i <= 1; i++) {
                const date = new Date(targetYear, targetMonth + i, 1);
                newMonths.push(
                    generateMonthData(date.getFullYear(), date.getMonth())
                );
            }

            setMonths(newMonths);
            setCurrentMonthIndex(1);
        }
    };

    // 날짜 클릭 핸들러
    const handleDateClick = (date: Date, hasEvents: boolean) => {
        if (hasEvents) {
            setSelectedDate(date);
            setIsViewingEvents(true);
        }
    };

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
            
            // 드래그 자동 스크롤 처리
            const rect = e.currentTarget.getBoundingClientRect();
            const containerRect = scrollContainerRef.current?.getBoundingClientRect();
            
            if (containerRect) {
                const topEdge = containerRect.top + 50; // 위쪽 가장자리 50px 영역
                const bottomEdge = containerRect.bottom - 50; // 아래쪽 가장자리 50px 영역
                const mouseY = e.clientY;
                
                // 기존 타이머 클리어
                if (dragEdgeTimer) {
                    clearTimeout(dragEdgeTimer);
                    setDragEdgeTimer(null);
                }
                
                if (mouseY < topEdge) {
                    // 위쪽 가장자리 - 이전 월로 이동
                    setDragEdgeDirection('prev');
                    const timer = setTimeout(() => {
                        if (currentMonthIndex > 0) {
                            setIsTransitioning(true);
                            setTransitionDirection('prev');
                            
                            setTimeout(() => {
                                setCurrentMonthIndex(prev => prev - 1);
                                setTimeout(() => {
                                    setIsTransitioning(false);
                                    setTransitionDirection(null);
                                }, 300);
                            }, 150);
                        }
                        setDragEdgeTimer(null);
                        setDragEdgeDirection(null);
                    }, 1000); // 1초 후 이동
                    setDragEdgeTimer(timer);
                } else if (mouseY > bottomEdge) {
                    // 아래쪽 가장자리 - 다음 월로 이동
                    setDragEdgeDirection('next');
                    const timer = setTimeout(() => {
                        if (currentMonthIndex < months.length - 1) {
                            setIsTransitioning(true);
                            setTransitionDirection('next');
                            
                            setTimeout(() => {
                                setCurrentMonthIndex(prev => prev + 1);
                                setTimeout(() => {
                                    setIsTransitioning(false);
                                    setTransitionDirection(null);
                                }, 300);
                            }, 150);
                        }
                        setDragEdgeTimer(null);
                        setDragEdgeDirection(null);
                    }, 1000); // 1초 후 이동
                    setDragEdgeTimer(timer);
                } else {
                    // 가장자리가 아닌 곳 - 타이머 클리어
                    setDragEdgeDirection(null);
                }
            }
        }
    };

    const handleMouseUp = (
        date: Date,
        hasEvents: boolean,
        e: React.MouseEvent
    ) => {
        e.preventDefault();

        // 드래그가 시작되지 않았거나 같은 위치에서 끝났을 때
        if (
            !isDragging ||
            !dragStart ||
            !dragEnd ||
            (dragStart.getTime() === dragEnd.getTime() &&
                dragStart.getTime() === date.getTime())
        ) {
            setIsDragging(false);
            setDragStart(null);
            setDragEnd(null);

            if (hasEvents) {
                // 일정이 있는 경우 일정 보기 모달 열기
                handleDateClick(date, hasEvents);
            } else {
                // 일정이 없는 경우 새 일정 생성 모달 열기
                const formatDateToLocal = (date: Date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    return `${year}-${month}-${day}`;
                };

                setCustomStartDate(formatDateToLocal(date));
                setCustomEndDate(formatDateToLocal(date));
            setNewEvent({
                title: "",
                description: "",
                location: "",
                color: COLORS[0],
            });
                setIsCreatingEvent(true);
            }
            return;
        }

        // 실제 드래그가 발생한 경우에만 일정 생성
        if (isDragging && dragStart && dragEnd) {
            setNewEvent({
                title: "",
                description: "",
                location: "",
                color: COLORS[0],
            });

            const start = dragStart < dragEnd ? dragStart : dragEnd;
            const end = dragStart < dragEnd ? dragEnd : dragStart;

            // 로컬 시간대로 날짜 문자열 생성 (시간대 문제 해결)
            const formatDateToLocal = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            };

            setCustomStartDate(formatDateToLocal(start));
            setCustomEndDate(formatDateToLocal(end));
            setIsCreatingEvent(true);
        }
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
        
        // 드래그 자동 스크롤 타이머 정리
        if (dragEdgeTimer) {
            clearTimeout(dragEdgeTimer);
            setDragEdgeTimer(null);
        }
        setDragEdgeDirection(null);
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
            startDate = dragStart < dragEnd ? dragStart : dragEnd;
            endDate = dragStart < dragEnd ? dragEnd : dragStart;
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

        // 현재 월 데이터를 새로고침하여 새 이벤트 반영
        if (months.length > 0 && currentMonthIndex >= 0) {
            const currentMonth = months[currentMonthIndex];
            const updatedMonthData = generateMonthData(
                currentMonth.year,
                currentMonth.month
            );
            setMonths((prev) =>
                prev.map((month, index) =>
                    index === currentMonthIndex ? updatedMonthData : month
                )
            );
        }
    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents((prev) => prev.filter((event) => event.id !== eventId));

        // 현재 월 데이터를 새로고침하여 삭제된 이벤트 반영
        if (months.length > 0 && currentMonthIndex >= 0) {
            const currentMonth = months[currentMonthIndex];
            const updatedMonthData = generateMonthData(
                currentMonth.year,
                currentMonth.month
            );
            setMonths((prev) =>
                prev.map((month, index) =>
                    index === currentMonthIndex ? updatedMonthData : month
                )
            );
        }
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
        return dragEnd ? dragEnd.getTime() === date.getTime() : false;
    };

    const getDragDuration = (): number => {
        if (!dragStart || !dragEnd) return 0;
        const diffTime = Math.abs(dragEnd.getTime() - dragStart.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };



    const currentMonthData = months[currentMonthIndex];

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
                                key={`year-${currentDate.getFullYear()}`}
                                onValueChange={(value) =>
                                    handleYearSelect(parseInt(value))
                                }
                                defaultValue={currentDate
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
                                key={`month-${currentDate.getMonth()}`}
                                onValueChange={(value) => {
                                    const monthIndex =
                                        monthNames.indexOf(value);
                                    handleMonthSelect(monthIndex);
                                }}
                                defaultValue={
                                    monthNames[currentDate.getMonth()]
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
                </div>

                <div className="flex items-center gap-2">
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

            {/* 월 단위 캘린더 */}
            <div
                ref={scrollContainerRef}
                className={cn(
                    "bg-[var(--background)] relative",
                    "flex-[8] h-full overflow-hidden"
                )}
            >
                {/* 드래그 자동 스크롤 가장자리 하이라이트 */}
                {isDragging && dragEdgeDirection && (
                    <>
                        {dragEdgeDirection === 'prev' && (
                            <div className="absolute left-0 right-0 top-0 h-12 bg-[var(--primary)]/10 border-b-2 border-[var(--primary)]/30 z-50 pointer-events-none">
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-[var(--primary)] text-xs font-medium">↑ 이전 월</span>
                                </div>
                            </div>
                        )}
                        {dragEdgeDirection === 'next' && (
                            <div className="absolute left-0 right-0 bottom-0 h-12 bg-[var(--primary)]/10 border-t-2 border-[var(--primary)]/30 z-50 pointer-events-none">
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-[var(--primary)] text-xs font-medium">다음 월 ↓</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {viewMode === "calendar" ? (
                    <div className="h-full flex flex-col">
                        {/* 월 표시 */}
                        <div className="border-b border-[var(--container-border)] bg-[var(--background)]/95 backdrop-blur-sm">
                            <h3 className="flex justify-center items-center text-sm font-medium text-[var(--secondary)] text-center py-2">
                                <Button onClick={() => changeMonth("prev")}>
                                    ←
                                </Button>
                                <Button
                                    onClick={goToToday}
                                    className="w-20 mx-3 px-3 py-1 text-xs hover:bg-[var(--primary)]/90 text-white rounded-lg transition-opacity"
                                >
                                    Today
                                </Button>
                                <Button onClick={() => changeMonth("next")}>
                                    →
                                </Button>
                            </h3>
                        </div>
                        {/* 요일 헤더 */}
                        <div className="border-b border-[var(--container-border)] bg-[var(--background)]">
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

                        {/* 캘린더 그리드 */}
                        <div className="flex-1 p-2 min-h-0 relative overflow-hidden">
                            {currentMonthData && (
                                <div 
                                    className={cn(
                                        "grid grid-cols-7 grid-rows-6 gap-1 h-full transition-all duration-300 ease-in-out",
                                        isTransitioning && transitionDirection === 'next' && "transform -translate-y-full opacity-0",
                                        isTransitioning && transitionDirection === 'prev' && "transform translate-y-full opacity-0",
                                        !isTransitioning && "transform translate-y-0 opacity-100"
                                    )}
                                >
                                    {currentMonthData.days.map((day, index) => (
                                <div
                                    key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
                                    className={cn(
                                                "min-h-0 p-1.5 cursor-pointer relative transition-all duration-200 flex flex-col",
                                                "bg-[var(--background)] border border-[var(--container-border)] rounded-lg",
                                                "hover:bg-amber-100/10 hover:border-[var(--primary)]/30",
                                        day.isCurrentMonth
                                                    ? "opacity-100 shadow-sm"
                                                    : "opacity-30 bg-[var(--background)]/50",
                                        day.isToday &&
                                                    "ring-2 ring-[var(--primary)] ring-opacity-50 bg-[var(--primary)]/5",
                                        isDragging && "cursor-grabbing"
                                    )}
                                    onMouseDown={(e) =>
                                        handleMouseDown(day.date, e)
                                    }
                                    onMouseEnter={(e) =>
                                        handleMouseEnter(day.date, e)
                                    }
                                    onMouseUp={(e) =>
                                                handleMouseUp(
                                                    day.date,
                                                    day.events.length > 0,
                                                    e
                                                )
                                            }
                                        >
                                    <div
                                        className={cn(
                                                    "text-[10px] font-medium mb-0.5 flex items-center justify-between relative z-20 flex-shrink-0 h-4",
                                                    day.isCurrentMonth
                                                        ? "text-[var(--secondary)]"
                                                        : "text-[var(--secondary)] opacity-50",
                                            day.isToday &&
                                                "text-[var(--primary)] font-bold"
                                        )}
                                    >
                                                <span
                                                    className={cn(
                                                        "flex items-center justify-center",
                                                        day.isToday &&
                                                            "bg-[var(--primary)] text-white w-4 h-4 rounded-full text-[10px] leading-none"
                                                    )}
                                                >
                                                    {day.date.getDate()}
                                                        </span>
                                            </div>

                                            {/* 드래그 이벤트 미리보기 */}
                                            {isDragging &&
                                                isInDragRange(day.date) &&
                                                dragStart &&
                                                dragEnd && (
                                                    <div
                                                        className="absolute left-0 right-0 z-10 pointer-events-none"
                                                        style={{ top: "30px" }}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "h-2.5 bg-white opacity-80",
                                                                isDragStart(
                                                                    day.date
                                                                ) &&
                                                                    "rounded-l",
                                                                isDragEnd(
                                                                    day.date
                                                                ) &&
                                                                    "rounded-r",
                                                                !isDragStart(
                                                                    day.date
                                                                ) &&
                                                                    !isDragEnd(
                                                                        day.date
                                                                    ) &&
                                                                    "rounded-none"
                                                            )}
                                                            style={{
                                                                marginLeft:
                                                                    !isDragStart(
                                                                        day.date
                                                                    )
                                                                        ? "-1px"
                                                                        : "0",
                                                                marginRight:
                                                                    !isDragEnd(
                                                                        day.date
                                                                    )
                                                                        ? "-1px"
                                                                        : "0",
                                                            }}
                                                        />
                                    </div>
                                                )}

                                    {/* 이벤트 표시 */}
                                            <div className="flex-1 min-h-0 overflow-hidden">
                                                <div className="space-y-0.5 h-full">
                                        {day.events
                                            .slice(0, 3)
                                                        .map((event: Event) => {
                                                            // 이벤트가 여러 날에 걸쳐 있는지 확인
                                                            const isMultiDay =
                                                                event.startDate.getTime() !==
                                                                event.endDate.getTime();
                                                            const isFirstDay =
                                                                day.date.toDateString() ===
                                                                event.startDate.toDateString();
                                                            const isLastDay =
                                                                day.date.toDateString() ===
                                                                event.endDate.toDateString();

                                                            // 현재 날짜가 이벤트 기간 내에 있는지 확인
                                                            const eventStart =
                                                                new Date(
                                                                    event.startDate.getFullYear(),
                                                                    event.startDate.getMonth(),
                                                                    event.startDate.getDate()
                                                                );
                                                            const eventEnd =
                                                                new Date(
                                                                    event.endDate.getFullYear(),
                                                                    event.endDate.getMonth(),
                                                                    event.endDate.getDate()
                                                                );
                                                            const currentDay =
                                                                new Date(
                                                                    day.date.getFullYear(),
                                                                    day.date.getMonth(),
                                                                    day.date.getDate()
                                                                );
                                                            const isInRange =
                                                                currentDay >=
                                                                    eventStart &&
                                                                currentDay <=
                                                                    eventEnd;

                                                            if (!isInRange)
                                                                return null;

                                                            return (
                                                                <div
                                                                    key={`${
                                                                        event.id
                                                                    }-${day.date.getTime()}`}
                                                                    className={cn(
                                                                        "absolute text-[8px] text-white cursor-pointer transition-opacity z-30",
                                                                        "hover:opacity-80",
                                                                        !day.isCurrentMonth &&
                                                                            "opacity-60",
                                                                        isMultiDay
                                                                            ? [
                                                                                  "h-2.5 flex items-center text-[8px] leading-none",
                                                                                  isFirstDay &&
                                                                                      "rounded-l pl-0.5",
                                                                                  isLastDay &&
                                                                                      "rounded-r pr-0.5",
                                                                                  !isFirstDay &&
                                                                                      !isLastDay &&
                                                                                      "rounded-none",
                                                                              ]
                                                                            : "h-2.5 rounded truncate text-[8px] leading-none flex items-center px-0.5"
                                                                    )}
                                                    style={{
                                                        backgroundColor:
                                                            event.color,
                                                                        left: isMultiDay && !isFirstDay ? "-1px" : "0",
                                                                        right: isMultiDay && !isLastDay ? "-1px" : "0",
                                                                        top: `${30 + (day.events.slice(0, 3).indexOf(event) * 12)}px`,
                                                    }}
                                                    onClick={() =>
                                                        handleDeleteEvent(
                                                            event.id
                                                        )
                                                    }
                                                    title={`${event.title} (클릭해서 삭제)`}
                                                >
                                                                    {/* 긴 이벤트의 경우 첫날에만 제목 표시 */}
                                                                    {isMultiDay ? (
                                                                        isFirstDay ? (
                                                                            <span className="truncate">
                                                                                {
                                                                                    event.title
                                                                                }
                                                                            </span>
                                                                        ) : (
                                                                            <span className="w-full h-full block"></span>
                                                                        )
                                                                    ) : (
                                                                        <span className="truncate">
                                                                            {
                                                                                event.title
                                                                            }
                                                                        </span>
                                                                    )}
                                                </div>
                                                            );
                                                        })}
                                        {day.events.length > 3 && (
                                                        <div
                                                            className={cn(
                                                                "text-[8px] text-[var(--secondary)] opacity-60 px-0.5 py-0.5 h-2.5 flex items-center",
                                                                !day.isCurrentMonth &&
                                                                    "opacity-30"
                                                            )}
                                                        >
                                                            +
                                                            {day.events.length -
                                                                3}
                                            </div>
                                        )}
                                                </div>
                                    </div>
                                </div>
                            ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* 리스트 뷰 */
                    <div className="p-4 h-full overflow-y-auto">
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
                    width="max-w-lg"
                    title="새 일정 만들기"
                    subtitle="일정의 세부 정보를 입력해주세요"
                >
                    <div className="space-y-6">
                        {/* 제목 입력 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--secondary)] block">
                                제목 <span className="text-red-500">*</span>
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
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--container-border)] rounded-xl text-[var(--secondary)] placeholder:text-[var(--secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                                    placeholder="일정 제목을 입력하세요"
                                    autoFocus
                                />
                            </div>

                        {/* 설명 입력 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--secondary)] block">
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
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--container-border)] rounded-xl text-[var(--secondary)] placeholder:text-[var(--secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all resize-none"
                                placeholder="일정에 대한 추가 정보를 입력하세요"
                                    rows={3}
                                />
                            </div>

                        {/* 장소 입력 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--secondary)] block">
                                장소
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
                                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--container-border)] rounded-xl text-[var(--secondary)] placeholder:text-[var(--secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                                placeholder="장소를 입력하세요"
                                />
                            </div>

                        {/* 날짜 선택 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--secondary)] block">
                                    시작일{" "}
                                    <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) =>
                                        setCustomStartDate(e.target.value)
                                            }
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--container-border)] rounded-xl text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                                        />
                                    </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--secondary)] block">
                                            종료일{" "}
                                    <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) =>
                                                setCustomEndDate(e.target.value)
                                            }
                                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--container-border)] rounded-xl text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                                        />
                                    </div>
                                </div>

                        {/* 색상 선택 */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-[var(--secondary)] block">
                                색상
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() =>
                                            setNewEvent((prev) => ({
                                                ...prev,
                                                color,
                                            }))
                                        }
                                        className={cn(
                                            "w-10 h-10 rounded-full transition-all duration-200 hover:scale-110",
                                            newEvent.color === color
                                                ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)] scale-110"
                                                : "hover:ring-2 hover:ring-[var(--container-border)] hover:ring-offset-2 hover:ring-offset-[var(--background)]"
                                        )}
                                        style={{ backgroundColor: color }}
                                        title={`색상: ${color}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-3 pt-4 border-t border-[var(--container-border)]/20">
                            <button
                                onClick={() => {
                                    setIsCreatingEvent(false);
                                    setDragStart(null);
                                    setDragEnd(null);
                                    setIsDragging(false);
                                    setCustomStartDate("");
                                    setCustomEndDate("");
                                }}
                                className="flex-1 px-6 py-3 text-[var(--secondary)]/70 hover:text-[var(--secondary)] border border-[var(--container-border)] rounded-xl hover:bg-[var(--container-border)]/10 transition-all duration-200 font-medium"
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
                                className="flex-1 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-[var(--primary)]/20"
                            >
                                일정 만들기
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* 일정 보기 모달 */}
            {isViewingEvents && selectedDate && (
                <Modal
                    isOpen={isViewingEvents}
                    onClose={() => {
                        setIsViewingEvents(false);
                        setSelectedDate(null);
                    }}
                    width="max-w-lg"
                    title={selectedDate.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                    })}
                    subtitle={(() => {
                        const dayEvents = events.filter((event) => {
                            const eventStart = new Date(
                                event.startDate.getFullYear(),
                                event.startDate.getMonth(),
                                event.startDate.getDate()
                            );
                            const eventEnd = new Date(
                                event.endDate.getFullYear(),
                                event.endDate.getMonth(),
                                event.endDate.getDate()
                            );
                            const currentDay = new Date(
                                selectedDate.getFullYear(),
                                selectedDate.getMonth(),
                                selectedDate.getDate()
                            );
                            return (
                                currentDay >= eventStart &&
                                currentDay <= eventEnd
                            );
                        });
                        return `총 ${dayEvents.length}개의 일정이 있습니다`;
                    })()}
                >
                    <div className="space-y-4">
                        {/* 일정 목록 */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {(() => {
                                const dayEvents = events
                                    .filter((event) => {
                                        const eventStart = new Date(
                                            event.startDate.getFullYear(),
                                            event.startDate.getMonth(),
                                            event.startDate.getDate()
                                        );
                                        const eventEnd = new Date(
                                            event.endDate.getFullYear(),
                                            event.endDate.getMonth(),
                                            event.endDate.getDate()
                                        );
                                        const currentDay = new Date(
                                            selectedDate.getFullYear(),
                                            selectedDate.getMonth(),
                                            selectedDate.getDate()
                                        );
                                        return (
                                            currentDay >= eventStart &&
                                            currentDay <= eventEnd
                                        );
                                    })
                                    .sort(
                                        (a, b) =>
                                            a.startDate.getTime() -
                                            b.startDate.getTime()
                                    );

                                if (dayEvents.length === 0) {
                                    return (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--container-border)]/20 flex items-center justify-center">
                                                <CalendarIcon className="w-8 h-8 text-[var(--secondary)]/40" />
                                            </div>
                                            <p className="text-[var(--secondary)]/60 font-medium">
                                                이 날에는 일정이 없습니다
                                            </p>
                                            <p className="text-sm text-[var(--secondary)]/40 mt-1">
                                                새로운 일정을 추가해보세요
                                            </p>
                                        </div>
                                    );
                                }

                                return dayEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className="group bg-[var(--background)] border border-[var(--container-border)] rounded-xl p-4 hover:border-[var(--primary)]/20 hover:bg-[var(--primary)]/5 transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div
                                                    className="w-3 h-3 rounded-full mt-2 flex-shrink-0 ring-2 ring-white shadow-sm"
                                                    style={{
                                                        backgroundColor:
                                                            event.color,
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-[var(--secondary)] mb-1 text-base leading-tight">
                                                        {event.title}
                                                    </h4>
                                                    {event.description && (
                                                        <p className="text-sm text-[var(--secondary)]/70 mb-3 leading-relaxed">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--secondary)]/60">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span className="font-medium">
                                                                {event.startDate.getTime() ===
                                                                event.endDate.getTime()
                                                                    ? "하루 종일"
                                                                    : `${event.startDate.toLocaleDateString(
                                                                          "ko-KR",
                                                                          {
                                                                              month: "short",
                                                                              day: "numeric",
                                                                          }
                                                                      )} - ${event.endDate.toLocaleDateString(
                                                                          "ko-KR",
                                                                          {
                                                                              month: "short",
                                                                              day: "numeric",
                                                                          }
                                                                      )}`}
                                                            </span>
                                                        </div>
                                                        {event.location && (
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                <span className="font-medium">
                                                                    {
                                                                        event.location
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    handleDeleteEvent(event.id);
                                                    // 이벤트가 삭제된 후 해당 날짜에 더 이상 이벤트가 없으면 모달 닫기
                                                    const remainingEvents =
                                                        events
                                                            .filter(
                                                                (e) =>
                                                                    e.id !==
                                                                    event.id
                                                            )
                                                            .filter((e) => {
                                                                const eventStart =
                                                                    new Date(
                                                                        e.startDate.getFullYear(),
                                                                        e.startDate.getMonth(),
                                                                        e.startDate.getDate()
                                                                    );
                                                                const eventEnd =
                                                                    new Date(
                                                                        e.endDate.getFullYear(),
                                                                        e.endDate.getMonth(),
                                                                        e.endDate.getDate()
                                                                    );
                                                                const currentDay =
                                                                    new Date(
                                                                        selectedDate.getFullYear(),
                                                                        selectedDate.getMonth(),
                                                                        selectedDate.getDate()
                                                                    );
                                                                return (
                                                                    currentDay >=
                                                                        eventStart &&
                                                                    currentDay <=
                                                                        eventEnd
                                                                );
                                                            });
                                                    if (
                                                        remainingEvents.length ===
                                                        0
                                                    ) {
                                                        setIsViewingEvents(
                                                            false
                                                        );
                                                        setSelectedDate(null);
                                                    }
                                                }}
                                                className="p-2 text-[var(--secondary)]/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                                title="일정 삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex gap-3 pt-4 border-t border-[var(--container-border)]/20">
                            <button
                                onClick={() => {
                                    setIsViewingEvents(false);
                                    setSelectedDate(null);
                                }}
                                className="flex-1 px-6 py-3 text-[var(--secondary)]/70 hover:text-[var(--secondary)] border border-[var(--container-border)] rounded-xl hover:bg-[var(--container-border)]/10 transition-all duration-200 font-medium"
                            >
                                닫기
                            </button>
                            <button
                                onClick={() => {
                                    // 기존 일정 보기 모달 닫고 새 일정 생성 모달 열기
                                    setIsViewingEvents(false);
                                    const formatDateToLocal = (date: Date) => {
                                        const year = date.getFullYear();
                                        const month = String(
                                            date.getMonth() + 1
                                        ).padStart(2, "0");
                                        const day = String(
                                            date.getDate()
                                        ).padStart(2, "0");
                                        return `${year}-${month}-${day}`;
                                    };
                                    setCustomStartDate(
                                        formatDateToLocal(selectedDate)
                                    );
                                    setCustomEndDate(
                                        formatDateToLocal(selectedDate)
                                    );
                                    setSelectedDate(null);
                                    setNewEvent({
                                        title: "",
                                        description: "",
                                        location: "",
                                        color: COLORS[0],
                                    });
                                    setIsCreatingEvent(true);
                                }}
                                className="flex-1 px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-all duration-200 font-medium shadow-lg shadow-[var(--primary)]/20"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" />새 일정 추가
                                </div>
                            </button>
                        </div>
                    </div>
                </Modal>
            )}


        </div>
    );
}
