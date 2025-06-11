import { useMemo } from 'react';
import { EventTemplate, CalendarEvent } from '../types/Calendar';
import { addDays, addMonths, addWeeks, getNextDayOfWeek } from '../lib/dateUtils';

export function useCalendarEvents(templates: EventTemplate[]) {
    return useMemo(() => {
        const instances: CalendarEvent[] = [];
        
        templates.forEach(template => {
            if (!template.recurrence) {
                // 단발성 일정
                instances.push({
                    id: `${template.id}-original`,
                    templateId: template.id,
                    title: template.title,
                    description: template.description,
                    date: template.originalStartDate,
                    color: template.color,
                    location: template.location,
                    isRecurring: false
                });
            } else {
                // 반복 일정 - 필요한 날짜만 계산
                const dates = generateRecurrenceDates(template);
                dates.forEach((date, index) => {
                    instances.push({
                        id: `${template.id}-${index}`,
                        templateId: template.id,
                        title: template.title,
                        description: template.description,
                        date,
                        color: template.color,
                        location: template.location,
                        isRecurring: true
                    });
                });
            }
        });
        
        return instances;
    }, [templates]);
}

function generateRecurrenceDates(template: EventTemplate): Date[] {
    const dates: Date[] = [];
    const { recurrence, originalStartDate } = template;
    
    if (!recurrence) return [originalStartDate];
    
    let currentDate = new Date(originalStartDate);
    const endDate = recurrence.endDate || addMonths(new Date(), 6);
    
    for (let i = 0; i < (recurrence.count || 100); i++) {
        if (currentDate > endDate) break;
        
        switch (recurrence.type) {
            case 'daily':
                dates.push(new Date(currentDate));
                currentDate = addDays(currentDate, recurrence.interval);
                break;
            case 'weekly':
                if (recurrence.daysOfWeek) {
                    recurrence.daysOfWeek.forEach(dayOfWeek => {
                        const date = getNextDayOfWeek(currentDate, dayOfWeek);
                        if (date <= endDate) dates.push(date);
                    });
                }
                currentDate = addWeeks(currentDate, recurrence.interval);
                break;
            // ... monthly, yearly 로직
        }
    }
    
    return dates.sort((a, b) => a.getTime() - b.getTime());
} 