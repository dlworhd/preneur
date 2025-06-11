// 일정 템플릿 (마스터 데이터)
interface EventTemplate {
    id: string;
    title: string;
    description?: string;
    color: string;
    location?: string;
    
    // 반복 설정
    recurrence?: {
        type: 'daily' | 'weekly' | 'monthly' | 'yearly';
        interval: number; // 1=매일, 2=이틀마다
        daysOfWeek?: number[]; // 0=일요일, 1=월요일...
        endDate?: Date;
        count?: number; // 몇 번 반복할지
    };
    
    // 원본 날짜 정보
    originalStartDate: Date;
    originalEndDate: Date;
    
    createdAt: Date;
    updatedAt: Date;
}

// 실제 일정 인스턴스 (표시용)
interface EventInstance {
    id: string;
    templateId: string; // 템플릿 참조
    date: Date; // 해당 날짜
    isOriginal: boolean; // 원본인지 반복된 것인지
    
    // 개별 수정사항 (선택적)
    overrides?: {
        title?: string;
        description?: string;
        location?: string;
        color?: string;
        cancelled?: boolean;
    };
}

// 캘린더에서 사용할 통합 타입
interface CalendarEvent {
    id: string;
    templateId: string;
    title: string;
    description?: string;
    date: Date;
    color: string;
    location?: string;
    isRecurring: boolean;
    isCancelled?: boolean;
} 