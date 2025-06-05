import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Palette, Database, PlusIcon, ChevronRight } from "lucide-react";
import Button from "@/components/common/Button";

interface SettingItem {
    id: string;
    category: string;
    title: string;
    description: string;
    value: string;
    type: 'toggle' | 'select' | 'input';
}

function SettingItemRow({ item }: { item: SettingItem }) {
    return (
        <div className={cn(
            "text-sm hover:bg-amber-100/10 text-[var(--secondary)]",
            "flex h-[48px] p-2 border-b border-[var(--container-border)]"
        )}>
            <div className="flex items-center flex-[0.5]">
                {item.category === 'profile' && <User width={20} height={20} />}
                {item.category === 'notifications' && <Bell width={20} height={20} />}
                {item.category === 'security' && <Shield width={20} height={20} />}
                {item.category === 'appearance' && <Palette width={20} height={20} />}
                {item.category === 'data' && <Database width={20} height={20} />}
            </div>
            <div className="flex items-center flex-[4] cursor-pointer">
                <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs opacity-60">{item.description}</div>
                </div>
            </div>
            <div className="flex justify-center items-center flex-[2] cursor-pointer">
                {item.type === 'toggle' ? (
                    <div className={cn(
                        "w-10 h-5 rounded-full transition-colors",
                                                        item.value === 'true' ? 'bg-[var(--primary)]' : 'bg-[var(--gray-300)]'
                    )}>
                        <div className={cn(
                            "w-4 h-4 bg-white rounded-full transition-transform mt-0.5",
                            item.value === 'true' ? 'translate-x-5' : 'translate-x-0.5'
                        )} />
                    </div>
                ) : (
                    <span className="text-xs">{item.value}</span>
                )}
            </div>
            <div className="flex justify-end items-center flex-[0.5] cursor-pointer">
                <ChevronRight width={16} height={16} className="opacity-40" />
            </div>
        </div>
    );
}

interface MetricItemProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
}

function MetricItem({ label, value, icon, trend }: MetricItemProps) {
    return (
        <div className={cn(
            "text-sm hover:bg-amber-100/10 text-[var(--secondary)]",
            "flex h-[40px] p-2 border-b border-[var(--container-border)]"
        )}>
            <div className="flex items-center flex-[0.5]">
                {icon}
            </div>
            <div className="flex items-center flex-[3] cursor-pointer">
                {label}
            </div>
            <div className="flex justify-end items-center flex-[2] cursor-pointer font-medium">
                {value}
            </div>
            {trend && (
                <div className="flex justify-end items-center flex-[1] cursor-pointer text-xs text-[var(--primary)]">
                    {trend}
                </div>
            )}
        </div>
    );
}

export default function SettingsPage() {
    const [isClient, setIsClient] = useState(false);
    const [settings, setSettings] = useState<SettingItem[]>([]);

    useEffect(() => {
        setIsClient(true);
        
        // 설정 데이터
        setSettings([
            {
                id: '1',
                category: 'profile',
                title: '프로필 공개',
                description: '다른 사용자에게 프로필을 공개합니다',
                value: 'true',
                type: 'toggle'
            },
            {
                id: '2',
                category: 'notifications',
                title: '이메일 알림',
                description: '새로운 메시지 시 이메일로 알림을 받습니다',
                value: 'true',
                type: 'toggle'
            },
            {
                id: '3',
                category: 'notifications',
                title: '푸시 알림',
                description: '브라우저 푸시 알림을 활성화합니다',
                value: 'false',
                type: 'toggle'
            },
            {
                id: '4',
                category: 'security',
                title: '2단계 인증',
                description: '계정 보안을 위한 2단계 인증을 설정합니다',
                value: '비활성화',
                type: 'select'
            },
            {
                id: '5',
                category: 'security',
                title: '세션 타임아웃',
                description: '자동 로그아웃 시간을 설정합니다',
                value: '30분',
                type: 'select'
            },
            {
                id: '6',
                category: 'appearance',
                title: '테마',
                description: '다크/라이트 모드를 선택합니다',
                value: 'System',
                type: 'select'
            },
            {
                id: '7',
                category: 'appearance',
                title: '언어',
                description: '인터페이스 언어를 설정합니다',
                value: '한국어',
                type: 'select'
            },
            {
                id: '8',
                category: 'data',
                title: '데이터 백업',
                description: '자동 데이터 백업을 활성화합니다',
                value: 'true',
                type: 'toggle'
            }
        ]);
    }, []);

    if (!isClient) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="text-sm text-[var(--secondary)] opacity-60">Loading...</span>
            </div>
        );
    }

    const enabledSettings = settings.filter(setting => setting.value === 'true').length;
    const categories = [...new Set(settings.map(setting => setting.category))];

    const metrics = [
        {
            label: "활성화된 설정",
            value: enabledSettings.toString(),
            icon: <Settings width={20} height={20} />,
            trend: "설정됨"
        },
        {
            label: "설정 카테고리",
            value: categories.length.toString(),
            icon: <Palette width={20} height={20} />,
            trend: "그룹"
        },
        {
            label: "보안 수준",
            value: "중간",
            icon: <Shield width={20} height={20} />,
            trend: "안전"
        }
    ];

    const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.category]) {
            acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
    }, {} as Record<string, SettingItem[]>);

    const categoryNames = {
        profile: '프로필',
        notifications: '알림',
        security: '보안',
        appearance: '모양',
        data: '데이터'
    };

    return (
        <div className={cn("flex flex-col h-full")}>
            {/* 헤더 */}
            <div className={cn(
                "border-b border-[var(--container-border)]",
                "flex items-center flex-[0.5] px-2"
            )}>
                <span className="text-sm font-medium text-[var(--secondary)]">Settings</span>
            </div>

            {/* 액션 바 */}
            <div className={cn(
                "border-b border-[var(--container-border)]",
                "flex justify-end items-center flex-[0.5] px-2"
            )}>
                <Button onClick={() => {}}>
                    <div className="flex gap-2 items-center">
                        <PlusIcon width={20} height={20} />
                        <span>Add Setting</span>
                    </div>
                </Button>
            </div>

            {/* 메인 콘텐츠 */}
            <div className={cn(
                "bg-[var(--background)]",
                "scrollbar-container will-change-scroll flex-[8] h-full overflow-y-auto z-1"
            )}>
                {/* 메트릭스 섹션 */}
                <div className="border-b border-[var(--container-border)] mb-4">
                    <div className="p-2 text-xs font-medium text-[var(--secondary)] opacity-60">
                        METRICS
                    </div>
                    {metrics.map((metric, index) => (
                        <MetricItem
                            key={index}
                            label={metric.label}
                            value={metric.value}
                            icon={metric.icon}
                            trend={metric.trend}
                        />
                    ))}
                </div>

                {/* 설정 목록 */}
                {Object.entries(groupedSettings).map(([category, categorySettings]) => (
                    <div key={category} className="border-b border-[var(--container-border)] mb-4">
                        <div className="p-2 text-xs font-medium text-[var(--secondary)] opacity-60">
                            {categoryNames[category as keyof typeof categoryNames]?.toUpperCase() || category.toUpperCase()}
                        </div>
                        {categorySettings.map((setting) => (
                            <SettingItemRow key={setting.id} item={setting} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
