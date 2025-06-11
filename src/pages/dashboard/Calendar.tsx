import { cn } from "@/lib/utils";
import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from "react";
import {
    Calendar as CalendarIcon,
    Grid3X3,
    List,
    Plus,
    Trash2,
    Clock,
    MapPin,
    Sparkles,
} from "lucide-react";

import Button from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import Modal from "@/components/common/Modal";
import Popover from "@/components/common/Popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { parseScheduleRequest } from "@/lib/gemini";

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

// 새로운 타입 정의 추가
interface EventTemplate {
    title: string;
    description?: string;
    location?: string;
    originalStartDate: string;
    originalEndDate: string;
    recurrence?: {
        type: 'daily' | 'weekly' | 'monthly' | 'yearly';
        interval: number;
        daysOfWeek?: number[];
        count: number;
    };
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

    // 애니메이션 상태

    // 기타 상태
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
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
    const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(
        null
    );
    const [customColor, setCustomColor] = useState("#3b82f6");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<"start" | "end">(
        "start"
    );
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // 드래그 자동 스크롤 상태
    const [dragEdgeTimer, setDragEdgeTimer] = useState<ReturnType<
        typeof setTimeout
    > | null>(null);
    const [dragEdgeDirection, setDragEdgeDirection] = useState<
        "prev" | "next" | null
    >(null);

    const [aiInput, setAiInput] = useState("");
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [showAIPopover, setShowAIPopover] = useState(false);
    const [aiButtonRef, setAiButtonRef] = useState<HTMLElement | null>(null);

    // 반복 일정 관련 상태 추가
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
    const [recurrenceInterval, setRecurrenceInterval] = useState(1);
    const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
    const [recurrenceCount, setRecurrenceCount] = useState(8);
    const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
    const [useEndDate, setUseEndDate] = useState(false);

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

    // 오늘 날짜를 메모화 (성능 최적화)
    const todayString = useMemo(() => {
        const today = new Date();
        return today.toDateString();
    }, []);

    // 월 데이터 생성 함수
    const generateMonthData = React.useCallback(
        (year: number, month: number): MonthData => {
            const days: CalendarDay[] = [];

            // 해당 월의 첫 번째 날과 마지막 날
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);

            // 주의 시작을 일요일로 맞추기 위해 이전 월의 날들 추가
            const firstDayOfWeek = firstDay.getDay();
            for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                const prevDate = new Date(year, month, -i);
                const isToday = prevDate.toDateString() === todayString;
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
                const isToday = date.toDateString() === todayString;
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
                const isToday = nextDate.toDateString() === todayString;
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
        [events, todayString]
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

    // 월 변경 시 currentDate 업데이트 및 인접 월 미리 로드
    useEffect(() => {
        if (
            months.length > 0 &&
            currentMonthIndex >= 0 &&
            currentMonthIndex < months.length
        ) {
            const currentMonth = months[currentMonthIndex];
            setCurrentDate(new Date(currentMonth.year, currentMonth.month, 1));

            // 인접 월들도 미리 업데이트 (성능 최적화)
            const indicesToUpdate = [
                currentMonthIndex - 1,
                currentMonthIndex,
                currentMonthIndex + 1,
            ].filter((index) => index >= 0 && index < months.length);

            setMonths((prev) =>
                prev.map((month, index) =>
                    indicesToUpdate.includes(index)
                        ? generateMonthData(month.year, month.month)
                        : month
                )
            );
        }
    }, [currentMonthIndex, months.length, generateMonthData]);

    // 이벤트가 변경될 때 현재 보이는 월만 새로고침 (성능 최적화)
    const refreshCurrentMonth = useCallback(() => {
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
    }, [months, currentMonthIndex, generateMonthData]);

    // 이벤트 상태가 변경될 때마다 월 데이터 새로고침
    useEffect(() => {
        if (months.length > 0) {
            refreshCurrentMonth();
        }
    }, [events]);

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
        if (direction === "next" && currentMonthIndex < months.length - 1) {
            setCurrentMonthIndex((prev) => prev + 1);
        } else if (direction === "prev" && currentMonthIndex > 0) {
            setCurrentMonthIndex((prev) => prev - 1);
        }
    };

    const goToToday = () => {
        const today = new Date();
        goToMonth(today);
    };

    const goToMonth = (targetDate: Date) => {
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();

        // 현재 months에서 해당 월 찾기
        const monthIndex = months.findIndex(
            (m) => m.year === targetYear && m.month === targetMonth
        );

        if (monthIndex !== -1) {
            // 해당 월이 이미 로드되어 있으면 바로 이동
            setCurrentMonthIndex(monthIndex);
        } else {
            // 해당 월이 없으면 새로 생성
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
    const handleDateClick = (
        date: Date,
        hasEvents: boolean,
        event: React.MouseEvent
    ) => {
        if (hasEvents) {
            setSelectedDate(date);
            setIsViewingEvents(true);
        } else {
            // 일정이 없는 경우 새 일정 생성 팝오버 열기
            const formatDateToLocal = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            };

            setCustomStartDate(formatDateToLocal(date));
            setCustomEndDate(formatDateToLocal(date));
            setStartDate(date);
            setEndDate(date);
            setNewEvent({
                title: "",
                description: "",
                location: "",
                color: COLORS[0],
            });
            setPopoverAnchor(event.currentTarget as HTMLElement);
            setIsCreatingEvent(true);
        }
    };

    // 일정 관련 함수들
    const handleCreateEvent = () => {
        if (!newEvent.title.trim()) return;

        if (!startDate || !endDate) {
            return;
        }

        let eventStartDate = startDate;
        let eventEndDate = endDate;

        if (eventStartDate > eventEndDate) {
            [eventStartDate, eventEndDate] = [eventEndDate, eventStartDate];
        }

        if (isRecurring) {
            // 반복 일정 생성
            const template: EventTemplate = {
                title: newEvent.title,
                description: newEvent.description,
                location: newEvent.location,
                originalStartDate: eventStartDate.toISOString().split('T')[0],
                originalEndDate: useEndDate && recurrenceEndDate 
                    ? recurrenceEndDate.toISOString().split('T')[0] 
                    : eventEndDate.toISOString().split('T')[0],
                recurrence: {
                    type: recurrenceType,
                    interval: recurrenceInterval,
                    daysOfWeek: recurrenceType === 'weekly' && selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek : undefined,
                    count: useEndDate ? 100 : recurrenceCount // 종료일 사용 시 충분히 큰 수
                }
            };

            const dates = generateRecurrenceDates(template);
            console.log('반복 일정 템플릿:', template);
            console.log('생성된 날짜들:', dates);
            
            const newEvents = dates.map(date => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title: newEvent.title,
                description: newEvent.description,
                startDate: date,
                endDate: date,
                color: newEvent.color,
                location: newEvent.location,
            }));

            setEvents((prev) => [...prev, ...newEvents]);

            console.log(`${newEvent.title} - ${dates.length}개의 반복 일정이 생성되었습니다.`);
        } else {
            // 단일 일정 생성
            const event: Event = {
                id: Date.now().toString(),
                title: newEvent.title,
                description: newEvent.description,
                startDate: eventStartDate,
                endDate: eventEndDate,
                color: newEvent.color,
                location: newEvent.location,
            };

            setEvents((prev) => [...prev, event]);
        }

        // 상태 초기화
        setIsCreatingEvent(false);
        setCustomStartDate("");
        setCustomEndDate("");
        setStartDate(null);
        setEndDate(null);
        setPopoverAnchor(null);
        setShowDatePicker(false);
        
        // 반복 일정 상태 초기화
        setIsRecurring(false);
        setRecurrenceType('weekly');
        setRecurrenceInterval(1);
        setSelectedDaysOfWeek([]);
        setRecurrenceCount(8);
        setRecurrenceEndDate(null);
        setUseEndDate(false);


    };

    const handleDeleteEvent = (eventId: string) => {
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
    };

    const handleEventClick = (event: Event, e: React.MouseEvent) => {
        e.stopPropagation(); // 날짜 클릭 이벤트 전파 방지
        setSelectedDate(event.startDate);
        setIsViewingEvents(true);
    };

    const currentMonthData = months[currentMonthIndex];

    // 반복 일정 날짜 생성 함수
    const generateRecurrenceDates = (template: EventTemplate): Date[] => {
        const dates: Date[] = [];
        const originalStartDate = new Date(template.originalStartDate);
        const originalEndDate = new Date(template.originalEndDate);
        const recurrence = template.recurrence;
        
        if (!recurrence) {
            return [originalStartDate];
        }

        console.log(`Generating dates from ${originalStartDate.toISOString().split('T')[0]} to ${originalEndDate.toISOString().split('T')[0]}`);
        console.log(`Recurrence:`, recurrence);

        switch (recurrence.type) {
            case 'daily':
                let currentDate = new Date(originalStartDate);
                for (let i = 0; i < recurrence.count; i++) {
                    if (currentDate > originalEndDate) break;
                    dates.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + recurrence.interval);
                }
                break;
                
            case 'weekly':
                if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
                    // 특정 요일들에 반복
                    let currentWeekStart = new Date(originalStartDate);
                    currentWeekStart.setDate(originalStartDate.getDate() - originalStartDate.getDay()); // 해당 주의 일요일
                    
                    let weekCount = 0;
                    let totalAdded = 0;
                    
                    while (weekCount < recurrence.count && currentWeekStart <= originalEndDate) {
                        // 각 요일에 대해 확인
                        recurrence.daysOfWeek.forEach(dayOfWeek => {
                            const targetDate = new Date(currentWeekStart);
                            targetDate.setDate(currentWeekStart.getDate() + dayOfWeek);
                            
                            // 시작일 이후이고 종료일 이전인 경우만 추가
                            if (targetDate >= originalStartDate && targetDate <= originalEndDate) {
                                dates.push(new Date(targetDate));
                                totalAdded++;
                                console.log(`Added: ${targetDate.toISOString().split('T')[0]} (${['일', '월', '화', '수', '목', '금', '토'][dayOfWeek]}요일)`);
                            }
                        });
                        
                        // 다음 주로 이동 (interval 적용)
                        currentWeekStart.setDate(currentWeekStart.getDate() + (7 * recurrence.interval));
                        weekCount++;
                        
                        // 무한루프 방지
                        if (weekCount > 100) {
                            console.warn('주 수가 100을 초과하여 중단합니다.');
                            break;
                        }
                    }
                    
                    console.log(`Total weeks processed: ${weekCount}, Total dates added: ${totalAdded}`);
                } else {
                    // 매주 같은 요일 (시작일의 요일)
                    let currentDate = new Date(originalStartDate);
                    for (let i = 0; i < recurrence.count; i++) {
                        if (currentDate > originalEndDate) break;
                        dates.push(new Date(currentDate));
                        currentDate.setDate(currentDate.getDate() + (7 * recurrence.interval));
                    }
                }
                break;
                
            case 'monthly':
                let monthlyDate = new Date(originalStartDate);
                for (let i = 0; i < recurrence.count; i++) {
                    if (monthlyDate > originalEndDate) break;
                    dates.push(new Date(monthlyDate));
                    monthlyDate.setMonth(monthlyDate.getMonth() + recurrence.interval);
                }
                break;
                
            case 'yearly':
                let yearlyDate = new Date(originalStartDate);
                for (let i = 0; i < recurrence.count; i++) {
                    if (yearlyDate > originalEndDate) break;
                    dates.push(new Date(yearlyDate));
                    yearlyDate.setFullYear(yearlyDate.getFullYear() + recurrence.interval);
                }
                break;
        }
        
        const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
        console.log(`Generated ${sortedDates.length} dates total:`);
        console.log('First 5:', sortedDates.slice(0, 5).map(d => d.toISOString().split('T')[0]));
        console.log('Last 5:', sortedDates.slice(-5).map(d => d.toISOString().split('T')[0]));
        
        return sortedDates;
    };

    const handleAIScheduleRequest = async () => {
        if (!aiInput.trim()) return;
        
        setIsProcessingAI(true);
        try {
            const result = await parseScheduleRequest(aiInput);
            
            // 새로운 eventTemplate 형식 처리
            if (result.eventTemplate) {
                const template: EventTemplate = result.eventTemplate;
                
                if (template.recurrence) {
                    // 반복 일정 - 날짜들을 계산해서 개별 이벤트 생성
                    const dates = generateRecurrenceDates(template);
                    
                    dates.forEach(date => {
                        const newEvent: Event = {
                            id: Math.random().toString(36).substr(2, 9),
                            title: template.title,
                            description: template.description || "",
                            startDate: date,
                            endDate: date,
                            color: "#3b82f6",
                            location: template.location,
                        };
                        setEvents(prev => [...prev, newEvent]);
                    });
                    
                    console.log(`${template.title} - ${dates.length}개의 반복 일정이 생성되었습니다.`);
                } else {
                    // 단발성 일정
                    const newEvent: Event = {
                        id: Math.random().toString(36).substr(2, 9),
                        title: template.title,
                        description: template.description || "",
                        startDate: new Date(template.originalStartDate),
                        endDate: new Date(template.originalEndDate),
                        color: "#3b82f6",
                        location: template.location,
                    };
                    setEvents(prev => [...prev, newEvent]);
                    console.log(`${template.title} - 단발성 일정이 생성되었습니다.`);
                }
            }
            // 기존 events 배열 형식도 지원 (하위 호환성)
            else if (result.events && Array.isArray(result.events)) {
                result.events.forEach((event: any) => {
                    const newEvent: Event = {
                        id: Math.random().toString(36).substr(2, 9),
                        title: event.title,
                        description: event.description || "",
                        startDate: new Date(event.startDate),
                        endDate: new Date(event.endDate),
                        color: "#3b82f6",
                        location: event.location,
                    };
                    setEvents(prev => [...prev, newEvent]);
                });
                console.log(`${result.events.length}개의 일정이 생성되었습니다.`);
            } else {
                throw new Error("올바르지 않은 응답 형식입니다.");
            }
            
            setAiInput("");
            setShowAIPopover(false);
            
        } catch (error) {
            console.error('AI 일정 생성 실패:', error);
            // TODO: 에러 토스트 표시
            alert('일정 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsProcessingAI(false);
        }
    };

    return (
        <div className={cn("flex flex-col h-full")}>
            {/* 헤더 */}
            <div
                className={cn(
                    "bg-[var(--background)] border-b border-[var(--container-border)]",
                    "flex items-center justify-between px-4 h-12"
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
                                    <span className="m font-medium text-[var(--secondary)] cursor-pointer hover:text-[var(--primary)] px-2 py-1 rounded transition-colors w-12 inline-block enter">
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
                                    <span className="m font-medium text-[var(--secondary)] cursor-pointer hover:text-[var(--primary)] px-2 py-1 rounded transition-colors w-12 inline-block enter">
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
                                "p-2 rounded-md",
                                viewMode === "calendar"
                                    ? "bg-[var(--primary)] "
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
                                    ? "bg-[var(--primary)] "
                                    : "bg-transparent"
                            )}
                        >
                            <List width={16} height={16} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* 월 단위 캘린더 */}
            <div
                className={cn(
                    "bg-[var(--background)] relative",
                    "flex-1 overflow-hidden"
                )}
            >
                {viewMode === "calendar" ? (
                    <div className="h-full flex flex-col">
                        {/* 월 표시 */}
                        <div className="border-b border-[var(--container-border)] bg-[var(--background)]/95 backdrop-blur-sm h-12">
                            <h3 className="flex justify-between items-center h-full">
                                <div className="flex flex-2 justify-center items-center m font-medium text-[var(--secondary)] enter">
                                    <Button onClick={() => changeMonth("prev")}>
                                        ←
                                    </Button>
                                    <Button
                                        onClick={goToToday}
                                        className="w-20 mx-3 px-3 py-1 text-xs hover:bg-[var(--primary)]/90  rounded-lg transition-opacity"
                                    >
                                        Today
                                    </Button>
                                    <Button onClick={() => changeMonth("next")}>
                                        →
                                    </Button>
                                </div>
                            </h3>
                        </div>
                        {/* 요일 헤더 */}
                        <div className="border-b border-[var(--container-border)] bg-[var(--background)]">
                            <div className="grid grid-cols-7 gap-1 p-2">
                                {weekDays.map((day) => (
                                    <div
                                        key={day}
                                        className="p-2 text-center enter text-xs font-medium text-[var(--secondary)] opacity-60"
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
                                        "grid grid-cols-7 grid-rows-6 gap-1 h-full"
                                    )}
                                >
                                    {currentMonthData.days.map((day, index) => (
                                        <Button
                                            key={`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`}
                                            className={cn(
                                                "min-h-0 p-1.5 cursor-pointer relative flex flex-col",
                                                "bg-[var(--background)] border border-[var(--container-border)] rounded-lg",
                                                "hover:bg-[var(--secondary-hover)]/20 hover:border-[var(--primary)]/30",
                                                day.isCurrentMonth
                                                    ? "opacity-100 shadow-sm"
                                                    : "opacity-30 bg-[var(--background)]/50",
                                                day.isToday &&
                                                    "ring-2 ring-[var(--primary)] ring-opacity-50 bg-[var(--primary)]/5"
                                            )}
                                            onClick={(e) =>
                                                handleDateClick(
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
                                                            "bg-[var(--primary)]  w-4 h-4 rounded-full text-[10px] leading-none"
                                                    )}
                                                >
                                                    {day.date.getDate()}
                                                </span>
                                            </div>

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
                                                                        "absolute text-[8px]  cursor-pointer transition-opacity z-[80]",
                                                                        "hover:opacity-80",
                                                                        !day.isCurrentMonth &&
                                                                            "opacity-60",
                                                                        isMultiDay
                                                                            ? [
                                                                                  "h-3 flex items-center text-[8px] leading-none",
                                                                                  isFirstDay &&
                                                                                      "pl-0.5",
                                                                                  isLastDay &&
                                                                                      "pr-0.5",
                                                                              ]
                                                                            : "h-3 truncate text-[8px] leading-none flex items-center px-0.5"
                                                                    )}
                                                                    style={{
                                                                        zIndex: 1,
                                                                        backgroundColor:
                                                                            event.color,
                                                                        left: "0",
                                                                        right: "0",
                                                                        top: `${
                                                                            25 +
                                                                            day.events
                                                                                .slice(
                                                                                    0,
                                                                                    3
                                                                                )
                                                                                .indexOf(
                                                                                    event
                                                                                ) *
                                                                                14
                                                                        }px`,
                                                                    }}
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        handleEventClick(
                                                                            event,
                                                                            e
                                                                        )
                                                                    }
                                                                    title={`${event.title}`}
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
                                                    
                                                </div>
                                            </div>
                                            {day.events.length > 3 && (
                                                        <div
                                                            className={cn(
                                                                "text-[8px] text-[var(--secondary)] opacity-60 px-0.5 py-0.5 h-3 flex justify-end items-center",
                                                                !day.isCurrentMonth &&
                                                                    "opacity-30"
                                                            )}
                                                        >
                                                            +
                                                            {day.events.length -
                                                                3}
                                                        </div>
                                                    )}
                                        </Button>
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
                                <div className="enter text-[var(--secondary)] opacity-60 py-8">
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
                                            className="bg-[var(--background)] border border-[var(--container-border)] rounded-xl p-4 hover:bg-[var(--secondary-hover)]/20 transition-colors cursor-pointer"
                                            onClick={() =>
                                                handleEventClick(
                                                    event,
                                                    {} as React.MouseEvent
                                                )
                                            }
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
                                                            <p className="m text-[var(--secondary)] opacity-70 mb-2">
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
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteEvent(
                                                            event.id
                                                        );
                                                    }}
                                                    className="p-1 text-[var(--secondary)] opacity-40 hover:opacity-100 hover:ed-500 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 일정 생성 팝오버 */}
            {isCreatingEvent && (
                <div
                    className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
                    onClick={() => {
                        setIsCreatingEvent(false);
                        setCustomStartDate("");
                        setCustomEndDate("");
                        setStartDate(null);
                        setEndDate(null);
                        setPopoverAnchor(null);
                        setShowDatePicker(false);
                    }}
                >
                    <div
                        className="bg-[var(--background)] border border-[var(--container-border)] rounded-xl shadow-lg p-4 w-72 max-w-[90vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-[var(--secondary)]">
                                    새 일정
                                </h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={newEvent.color}
                                        onChange={(e) => {
                                            setNewEvent((prev) => ({
                                                ...prev,
                                                color: e.target.value,
                                            }));
                                            setCustomColor(e.target.value);
                                            // 색상 선택 후 팔레트 닫기
                                            setTimeout(() => {
                                                (
                                                    e.target as HTMLInputElement
                                                ).blur();
                                            }, 100);
                                        }}
                                        className="w-6 h-6 rounded-full border border-[var(--container-border)] hover:border-[var(--primary)] transition-all cursor-pointer"
                                        style={{
                                            backgroundColor: newEvent.color,
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={newEvent.color}
                                        onChange={(e) => {
                                            setNewEvent((prev) => ({
                                                ...prev,
                                                color: e.target.value,
                                            }));
                                            setCustomColor(e.target.value);
                                        }}
                                        className="w-16 px-1 py-0.5 bg-[var(--background)] border border-[var(--container-border)] rounded text-xs text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30"
                                        placeholder="#3b82f6"
                                    />
                                </div>
                            </div>

                            {/* 제목 입력 */}
                            <input
                                type="text"
                                value={newEvent.title}
                                onChange={(e) =>
                                    setNewEvent((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-sm text-[var(--secondary)] placeholder:text-[var(--secondary)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                                placeholder="일정 제목"
                                autoFocus
                            />

                            {/* 날짜 선택 */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-[var(--secondary)]/70 mb-1 block">
                                        시작일
                                    </label>
                                    <Button
                                        onClick={() => {
                                            if (
                                                showDatePicker &&
                                                datePickerMode === "start"
                                            ) {
                                                setShowDatePicker(false);
                                            } else {
                                                setDatePickerMode("start");
                                                setShowDatePicker(true);
                                            }
                                        }}
                                        className={cn(
                                            "w-full px-2 py-1.5 bg-[var(--background)] border rounded-lg text-xs text-[var(--secondary)] text-left hover:border-[var(--primary)] transition-all",
                                            showDatePicker &&
                                                datePickerMode === "start"
                                                ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                                                : "border-[var(--container-border)]"
                                        )}
                                    >
                                        {startDate
                                            ? startDate.toLocaleDateString(
                                                  "ko-KR"
                                              )
                                            : "날짜 선택"}
                                    </Button>
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--secondary)]/70 mb-1 block">
                                        종료일
                                    </label>
                                    <Button
                                        onClick={() => {
                                            if (
                                                showDatePicker &&
                                                datePickerMode === "end"
                                            ) {
                                                setShowDatePicker(false);
                                            } else {
                                                setDatePickerMode("end");
                                                setShowDatePicker(true);
                                            }
                                        }}
                                        className={cn(
                                            "w-full px-2 py-1.5 bg-[var(--background)] border rounded-lg text-xs text-[var(--secondary)] text-left hover:border-[var(--primary)] transition-all",
                                            showDatePicker &&
                                                datePickerMode === "end"
                                                ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                                                : "border-[var(--container-border)]"
                                        )}
                                    >
                                        {endDate
                                            ? endDate.toLocaleDateString(
                                                  "ko-KR"
                                              )
                                            : "날짜 선택"}
                                    </Button>
                                </div>
                            </div>
                            {/* 날짜 피커 */}
                            {showDatePicker && (
                                <div className="border border-[var(--container-border)] rounded-lg">
                                    <CalendarPicker
                                        selected={
                                            datePickerMode === "start"
                                                ? startDate
                                                : endDate
                                        }
                                        onSelect={(date) => {
                                            if (date) {
                                                if (
                                                    datePickerMode === "start"
                                                ) {
                                                    setStartDate(date);
                                                    const year =
                                                        date.getFullYear();
                                                    const month = String(
                                                        date.getMonth() + 1
                                                    ).padStart(2, "0");
                                                    const day = String(
                                                        date.getDate()
                                                    ).padStart(2, "0");
                                                    setCustomStartDate(
                                                        `${year}-${month}-${day}`
                                                    );
                                                } else {
                                                    setEndDate(date);
                                                    const year =
                                                        date.getFullYear();
                                                    const month = String(
                                                        date.getMonth() + 1
                                                    ).padStart(2, "0");
                                                    const day = String(
                                                        date.getDate()
                                                    ).padStart(2, "0");
                                                    setCustomEndDate(
                                                        `${year}-${month}-${day}`
                                                    );
                                                }
                                                setShowDatePicker(false);
                                            }
                                        }}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {/* 설명 입력 */}
                            <input
                                type="text"
                                value={newEvent.description}
                                onChange={(e) =>
                                    setNewEvent((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-sm text-[var(--secondary)] placeholder:text-[var(--secondary)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                                placeholder="설명 (선택사항)"
                            />

                            {/* 장소 입력 */}
                            <input
                                type="text"
                                value={newEvent.location}
                                onChange={(e) =>
                                    setNewEvent((prev) => ({
                                        ...prev,
                                        location: e.target.value,
                                    }))
                                }
                                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-sm text-[var(--secondary)] placeholder:text-[var(--secondary)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                                placeholder="장소 (선택사항)"
                            />

                            {/* 반복 일정 설정 */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="recurring"
                                        checked={isRecurring}
                                        onChange={(e) => setIsRecurring(e.target.checked)}
                                        className="w-4 h-4 text-[var(--primary)] bg-[var(--background)] border-[var(--container-border)] rounded focus:ring-[var(--primary)] focus:ring-2"
                                    />
                                    <label htmlFor="recurring" className="text-sm text-[var(--secondary)]">
                                        반복 일정
                                    </label>
                                </div>

                                {isRecurring && (
                                    <div className="space-y-3 p-3 bg-[var(--background)]/50 border border-[var(--container-border)] rounded-lg">
                                        {/* 반복 유형 */}
                                        <div>
                                            <label className="text-xs text-[var(--secondary)]/70 mb-1 block">
                                                반복 유형
                                            </label>
                                            <select
                                                value={recurrenceType}
                                                onChange={(e) => setRecurrenceType(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                                                className="w-full px-2 py-1.5 bg-[var(--background)] border border-[var(--container-border)] rounded text-xs text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30"
                                            >
                                                <option value="daily">매일</option>
                                                <option value="weekly">매주</option>
                                                <option value="monthly">매월</option>
                                                <option value="yearly">매년</option>
                                            </select>
                                        </div>

                                        {/* 간격 설정 */}
                                        <div>
                                            <label className="text-xs text-[var(--secondary)]/70 mb-1 block">
                                                간격
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={recurrenceInterval}
                                                    onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                                                    className="w-16 px-2 py-1.5 bg-[var(--background)] border border-[var(--container-border)] rounded text-xs text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30"
                                                />
                                                <span className="text-xs text-[var(--secondary)]/70">
                                                    {recurrenceType === 'daily' && '일마다'}
                                                    {recurrenceType === 'weekly' && '주마다'}
                                                    {recurrenceType === 'monthly' && '개월마다'}
                                                    {recurrenceType === 'yearly' && '년마다'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 요일 선택 (주간 반복시만) */}
                                        {recurrenceType === 'weekly' && (
                                            <div>
                                                <label className="text-xs text-[var(--secondary)]/70 mb-1 block">
                                                    요일 선택
                                                </label>
                                                <div className="flex gap-1">
                                                    {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => {
                                                                if (selectedDaysOfWeek.includes(index)) {
                                                                    setSelectedDaysOfWeek(prev => prev.filter(d => d !== index));
                                                                } else {
                                                                    setSelectedDaysOfWeek(prev => [...prev, index]);
                                                                }
                                                            }}
                                                            className={cn(
                                                                "w-8 h-8 text-xs rounded-full transition-all",
                                                                selectedDaysOfWeek.includes(index)
                                                                    ? "bg-[var(--primary)] text-white"
                                                                    : "bg-[var(--background)] border border-[var(--container-border)] text-[var(--secondary)]"
                                                            )}
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 종료 조건 */}
                                        <div>
                                            <label className="text-xs text-[var(--secondary)]/70 mb-1 block">
                                                종료 조건
                                            </label>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        id="endByCount"
                                                        name="endCondition"
                                                        checked={!useEndDate}
                                                        onChange={() => setUseEndDate(false)}
                                                        className="w-3 h-3 text-[var(--primary)] bg-[var(--background)] border-[var(--container-border)]"
                                                    />
                                                    <label htmlFor="endByCount" className="text-xs text-[var(--secondary)]">
                                                        횟수로 종료
                                                    </label>
                                                    {!useEndDate && (
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="100"
                                                            value={recurrenceCount}
                                                            onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 1)}
                                                            className="w-16 px-1 py-0.5 bg-[var(--background)] border border-[var(--container-border)] rounded text-xs text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        id="endByDate"
                                                        name="endCondition"
                                                        checked={useEndDate}
                                                        onChange={() => setUseEndDate(true)}
                                                        className="w-3 h-3 text-[var(--primary)] bg-[var(--background)] border-[var(--container-border)]"
                                                    />
                                                    <label htmlFor="endByDate" className="text-xs text-[var(--secondary)]">
                                                        날짜로 종료
                                                    </label>
                                                    {useEndDate && (
                                                        <input
                                                            type="date"
                                                            value={recurrenceEndDate ? recurrenceEndDate.toISOString().split('T')[0] : ''}
                                                            onChange={(e) => setRecurrenceEndDate(e.target.value ? new Date(e.target.value) : null)}
                                                            className="px-1 py-0.5 bg-[var(--background)] border border-[var(--container-border)] rounded text-xs text-[var(--secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => {
                                        setIsCreatingEvent(false);
                                        setCustomStartDate("");
                                        setCustomEndDate("");
                                        setStartDate(null);
                                        setEndDate(null);
                                        setPopoverAnchor(null);
                                        setShowDatePicker(false);
                                    }}
                                    className="flex-1 px-3 py-2 text-xs text-[var(--secondary)]/70 hover:text-[var(--secondary)] border border-[var(--container-border)] rounded-lg hover:bg-[var(--container-border)]/10 transition-all"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleCreateEvent}
                                    disabled={
                                        !newEvent.title.trim() ||
                                        !startDate ||
                                        !endDate
                                    }
                                    className="flex-1 px-3 py-2 text-xs bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    추가
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 일정 보기 모달 */}
            {isViewingEvents && selectedDate && (
                <Modal
                    isOpen={isViewingEvents}
                    onClose={() => {
                        setIsViewingEvents(false);
                        setSelectedDate(null);
                    }}
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
                                        <div className="enter py-12">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--container-border)]/20 flex items-center justify-center">
                                                <CalendarIcon className="w-8 h-8 text-[var(--secondary)]/40" />
                                            </div>
                                            <p className="text-[var(--secondary)]/60 font-medium">
                                                이 날에는 일정이 없습니다
                                            </p>
                                            <p className="m text-[var(--secondary)]/40 mt-1">
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
                                                        <p className="m text-[var(--secondary)]/70 mb-3 leading-relaxed">
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
                                                className="p-2 text-[var(--secondary)]/30 hover:text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
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
                                    setStartDate(selectedDate);
                                    setEndDate(selectedDate);
                                    setSelectedDate(null);
                                    setNewEvent({
                                        title: "",
                                        description: "",
                                        location: "",
                                        color: COLORS[0],
                                    });
                                    setIsCreatingEvent(true);
                                }}
                                className="flex-1 px-6 py-3 bg-[var(--primary)]  rounded-xl hover:bg-[var(--primary)]/90 transition-all duration-200 font-medium shadow-lg shadow-[var(--primary)]/20"
                            >
                                <div className="flex items-center justify-center gap-1">
                                    <Plus className="w-4 h-4" />새 일정 추가
                                </div>
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* AI 플로팅 버튼 */}
            <button
                ref={(el) => setAiButtonRef(el)}
                onClick={() => setShowAIPopover(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 flex items-center justify-center cursor-pointer"
                title="AI 일정 생성"
            >
                <Sparkles className="w-6 h-6" />
            </button>

            {/* AI 팝오버 */}
            <Popover
                isOpen={showAIPopover}
                onClose={() => {
                    setShowAIPopover(false);
                    setAiInput("");
                }}
                anchorElement={aiButtonRef}
                placement="top"
                className="w-80 p-4"
            >
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-[var(--secondary)] flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI 일정 생성
                    </h3>
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder="예: 2025년 5월 1일부터 매주 화요일 회의 일정 잡아줘"
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-sm text-[var(--secondary)] placeholder:text-[var(--secondary)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAIScheduleRequest();
                                }
                            }}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    setShowAIPopover(false);
                                    setAiInput("");
                                }}
                                className="flex-1 px-3 py-2 text-xs text-[var(--secondary)]/70 hover:text-[var(--secondary)] border border-[var(--container-border)] rounded-lg hover:bg-[var(--container-border)]/10 transition-all"
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleAIScheduleRequest}
                                disabled={isProcessingAI || !aiInput.trim()}
                                className="flex-1 px-3 py-2 text-xs bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
                            >
                                {isProcessingAI ? "생성 중..." : "생성"}
                            </Button>
                        </div>
                    </div>
                </div>
            </Popover>
        </div>
    );
}

