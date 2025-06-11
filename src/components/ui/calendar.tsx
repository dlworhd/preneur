import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "@/components/common/Select";
import Button from "../common/Button";

interface CalendarProps {
    selected?: Date | null;
    onSelect?: (date: Date | undefined) => void;
    className?: string;
    mode?: "single" | "range";
    disabled?: (date: Date) => boolean;
}

const MONTHS = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({
    selected,
    onSelect,
    className,
    mode = "single",
    disabled,
}: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(selected || new Date());
    
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of the month and how many days in the month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get days from previous month to fill the grid
    const daysFromPrevMonth = firstDayWeekday;
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    // Calculate total cells needed (6 weeks * 7 days = 42)
    const totalCells = 42;
    const daysFromNextMonth = totalCells - daysInMonth - daysFromPrevMonth;
    
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };
    
    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleYearChange = (yearStr: string) => {
        const newYear = parseInt(yearStr);
        setCurrentDate(new Date(newYear, month, 1));
    };

    const handleMonthChange = (monthStr: string) => {
        const newMonth = parseInt(monthStr);
        setCurrentDate(new Date(year, newMonth, 1));
    };

    // Generate year options (current year ± 10 years)
    const yearOptions = Array.from({ length: 21 }, (_, i) => {
        const yearOption = year - 10 + i;
        return { value: yearOption.toString(), label: yearOption.toString() };
    });

    // Generate month options
    const monthOptions = MONTHS.map((monthName, index) => ({
        value: index.toString(),
        label: monthName
    }));
    
    const handleDateClick = (date: Date) => {
        if (disabled && disabled(date)) return;
        onSelect?.(date);
    };
    
    const isSelected = (date: Date) => {
        if (!selected) return false;
        return date.toDateString() === selected.toDateString();
    };
    
    const isToday = (date: Date) => {
        return date.toDateString() === today.toDateString();
    };
    
    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === month && date.getFullYear() === year;
    };
    
    // Generate calendar days
    const calendarDays: Date[] = [];
    
    // Previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        calendarDays.push(new Date(year, month - 1, daysInPrevMonth - i));
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(new Date(year, month, day));
    }
    
    // Next month days
    for (let day = 1; day <= daysFromNextMonth; day++) {
        calendarDays.push(new Date(year, month + 1, day));
    }
    
    return (
        <div className={cn("p-3", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    onClick={goToPreviousMonth}
                    className="p-1 hover:bg-[var(--container-border)]/20 rounded-md transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-[var(--secondary)]" />
                </Button>
                
                <div className="flex items-center gap-2">
                    <Select 
                        key={`month-${year}-${month}`}
                        onValueChange={handleMonthChange} 
                        defaultValue={month.toString()}
                    >
                        <Select.Trigger>
                            <span className="text-sm font-medium text-[var(--secondary)] cursor-pointer hover:text-[var(--primary)] px-2 py-1 rounded transition-colors">
                                {MONTHS[month]}
                            </span>
                        </Select.Trigger>
                        <Select.Content className="max-h-48 overflow-y-auto">
                            {monthOptions.map((option) => (
                                <Select.Item align="center" key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select>
                    
                    <Select 
                        key={`year-${year}-${month}`}
                        onValueChange={handleYearChange} 
                        defaultValue={year.toString()}
                    >
                        <Select.Trigger>
                            <span className="text-sm font-medium text-[var(--secondary)] cursor-pointer hover:text-[var(--primary)] px-2 py-1 rounded transition-colors">
                                {year}
                            </span>
                        </Select.Trigger>
                        <Select.Content className="max-h-48 overflow-y-auto">
                            {yearOptions.map((option) => (
                                <Select.Item align="center" key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select>
                </div>
                
                <Button
                    onClick={goToNextMonth}
                    className="p-1 hover:bg-[var(--container-border)]/20 rounded-md transition-colors"
                >
                    <ChevronRight className="w-4 h-4 text-[var(--secondary)]" />
                </Button>
            </div>
            
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="h-8 flex items-center justify-center text-xs font-medium text-[var(--secondary)]/60"
                    >
                        {day}
                    </div>
                ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                    const isDisabled = disabled && disabled(date);
                    const selected = isSelected(date);
                    const today = isToday(date);
                    const currentMonth = isCurrentMonth(date);
                    
                    return (
                        <Button
                            key={index}
                            onClick={() => handleDateClick(date)}
                            disabled={isDisabled}
                            className={cn(
                                "h-8 w-8 text-xs font-normal rounded-md transition-colors",
                                "hover:bg-[var(--container-border)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20",
                                currentMonth
                                    ? "text-[var(--secondary)] opacity-100"
                                    : "text-[var(--secondary)] opacity-20 bg-transparent",
                                selected && [
                                    "bg-[var(--primary)] text-white opacity-100",
                                    "hover:bg-[var(--primary)]/90"
                                ],
                                today && !selected && currentMonth && [
                                    "bg-[var(--container-border)]/30 font-medium opacity-100"
                                ],
                                !currentMonth && [
                                    "hover:bg-[var(--container-border)]/10 cursor-pointer hover:opacity-30"
                                ],
                                isDisabled && [
                                    "text-[var(--secondary)] opacity-10 cursor-not-allowed",
                                    "hover:bg-transparent"
                                ]
                            )}
                        >
                            {date.getDate()}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
} 