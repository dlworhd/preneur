import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Database,
    Download,
    Trash2,
    Eye,
    EyeOff,
    Save,
    RefreshCw,
    Moon,
    Sun,
    Monitor,
    Volume2,
    VolumeX,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Key,
    CreditCard,
    FileText,
    HelpCircle,
} from "lucide-react";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";

interface SettingsSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
}

export default function Settings() {
    const [activeSection, setActiveSection] = useState("profile");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [settings, setSettings] = useState({
        // 프로필 설정
        profile: {
            name: "김개발",
            email: "kim@example.com",
            phone: "+82 10-1234-5678",
            location: "서울, 대한민국",
            bio: "풀스택 개발자이자 프로덕트 메이커입니다.",
            avatar: "",
        },
        // 알림 설정
        notifications: {
            email: true,
            push: true,
            desktop: false,
            marketing: false,
            taskReminders: true,
            weeklyReports: true,
            soundEnabled: true,
        },
        // 테마 설정
        appearance: {
            theme: "system", // light, dark, system
            accentColor: "#3b82f6",
            fontSize: "medium", // small, medium, large
            sidebarCollapsed: false,
        },
        // 언어 및 지역
        localization: {
            language: "ko",
            timezone: "Asia/Seoul",
            dateFormat: "YYYY-MM-DD",
            timeFormat: "24h",
            currency: "KRW",
        },
        // 보안 설정
        security: {
            twoFactorEnabled: false,
            sessionTimeout: 30,
            loginNotifications: true,
        },
        // 데이터 설정
        data: {
            autoBackup: true,
            backupFrequency: "daily",
            dataRetention: 365,
        },
    });

    const sections: SettingsSection[] = [
        {
            id: "profile",
            title: "프로필",
            icon: <User className="w-4 h-4" />,
            description: "개인 정보 및 프로필 설정",
        },
        {
            id: "notifications",
            title: "알림",
            icon: <Bell className="w-4 h-4" />,
            description: "알림 및 메시지 설정",
        },
        {
            id: "appearance",
            title: "모양",
            icon: <Palette className="w-4 h-4" />,
            description: "테마 및 인터페이스 설정",
        },
        {
            id: "localization",
            title: "언어 및 지역",
            icon: <Globe className="w-4 h-4" />,
            description: "언어, 시간대 및 지역 설정",
        },
        {
            id: "security",
            title: "보안",
            icon: <Shield className="w-4 h-4" />,
            description: "계정 보안 및 개인정보 보호",
        },
        {
            id: "data",
            title: "데이터",
            icon: <Database className="w-4 h-4" />,
            description: "백업 및 데이터 관리",
        },
    ];

    const handleSettingChange = (section: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof typeof prev],
                [key]: value,
            },
        }));
    };

    const handleSaveSettings = () => {
        // 설정 저장 로직
        console.log("Settings saved:", settings);
    };

    const handleExportData = () => {
        // 데이터 내보내기 로직
        console.log("Exporting data...");
    };

    const handleDeleteAccount = () => {
        // 계정 삭제 로직
        console.log("Account deletion requested");
        setShowDeleteModal(false);
    };

    const renderProfileSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-[var(--secondary)] mb-4">
                    기본 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--secondary)] mb-2">
                            이름
                        </label>
                        <input
                            type="text"
                            value={settings.profile.name}
                            onChange={(e) => handleSettingChange("profile", "name", e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--secondary)] mb-2">
                            이메일
                        </label>
                        <input
                            type="email"
                            value={settings.profile.email}
                            onChange={(e) => handleSettingChange("profile", "email", e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--secondary)] mb-2">
                            전화번호
                        </label>
                        <input
                            type="tel"
                            value={settings.profile.phone}
                            onChange={(e) => handleSettingChange("profile", "phone", e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--secondary)] mb-2">
                            위치
                        </label>
                        <input
                            type="text"
                            value={settings.profile.location}
                            onChange={(e) => handleSettingChange("profile", "location", e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-[var(--secondary)] mb-2">
                        소개
                    </label>
                    <textarea
                        value={settings.profile.bio}
                        onChange={(e) => handleSettingChange("profile", "bio", e.target.value)}
                        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 h-24 resize-none"
                        placeholder="자신에 대해 간단히 소개해주세요"
                    />
                </div>
            </div>
        </div>
    );

    const renderNotificationsSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-[var(--secondary)] mb-4">
                    알림 설정
                </h3>
                <div className="space-y-4">
                    {[
                        { key: "email", label: "이메일 알림", description: "중요한 업데이트를 이메일로 받기" },
                        { key: "push", label: "푸시 알림", description: "브라우저 푸시 알림 받기" },
                        { key: "desktop", label: "데스크톱 알림", description: "데스크톱 알림 표시" },
                        { key: "marketing", label: "마케팅 알림", description: "제품 업데이트 및 프로모션 정보" },
                        { key: "taskReminders", label: "작업 알림", description: "작업 마감일 및 리마인더" },
                        { key: "weeklyReports", label: "주간 리포트", description: "주간 활동 요약 받기" },
                        { key: "soundEnabled", label: "알림 소리", description: "알림 시 소리 재생" },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--background)] border border-[var(--container-border)] rounded-lg">
                            <div>
                                <div className="font-medium text-[var(--secondary)]">{item.label}</div>
                                <div className="text-sm text-[var(--secondary)]/70">{item.description}</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                                    onChange={(e) => handleSettingChange("notifications", item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-[var(--container-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderAppearanceSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-[var(--secondary)] mb-4">
                    테마 설정
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--secondary)] mb-3">
                            테마 모드
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: "light", label: "라이트", icon: <Sun className="w-4 h-4" /> },
                                { value: "dark", label: "다크", icon: <Moon className="w-4 h-4" /> },
                                { value: "system", label: "시스템", icon: <Monitor className="w-4 h-4" /> },
                            ].map((theme) => (
                                <Button
                                    key={theme.value}
                                    onClick={() => handleSettingChange("appearance", "theme", theme.value)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 border rounded-lg transition-all",
                                        settings.appearance.theme === theme.value
                                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                                            : "border-[var(--container-border)] hover:border-[var(--primary)]/50"
                                    )}
                                >
                                    {theme.icon}
                                    <span className="text-sm font-medium text-[var(--secondary)]">
                                        {theme.label}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-[var(--secondary)] mb-3">
                            글꼴 크기
                        </label>
                        <select
                            value={settings.appearance.fontSize}
                            onChange={(e) => handleSettingChange("appearance", "fontSize", e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                        >
                            <option value="small">작게</option>
                            <option value="medium">보통</option>
                            <option value="large">크게</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSecuritySection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-[var(--secondary)] mb-4">
                    계정 보안
                </h3>
                <div className="space-y-4">
                    <div className="p-4 bg-[var(--background)] border border-[var(--container-border)] rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-[var(--secondary)]">2단계 인증</div>
                                <div className="text-sm text-[var(--secondary)]/70">
                                    계정 보안을 강화하기 위해 2단계 인증을 활성화하세요
                                </div>
                            </div>
                            <Button
                                onClick={() => handleSettingChange("security", "twoFactorEnabled", !settings.security.twoFactorEnabled)}
                                className={cn(
                                    "px-4 py-2 rounded-lg transition-colors",
                                    settings.security.twoFactorEnabled
                                        ? "bg-red-500 text-white hover:bg-red-600"
                                        : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                                )}
                            >
                                {settings.security.twoFactorEnabled ? "비활성화" : "활성화"}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-[var(--background)] border border-[var(--container-border)] rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-[var(--secondary)]">비밀번호 변경</div>
                                <div className="text-sm text-[var(--secondary)]/70">
                                    정기적으로 비밀번호를 변경하세요
                                </div>
                            </div>
                            <Button
                                onClick={() => setShowPasswordField(!showPasswordField)}
                                className="px-4 py-2 border border-[var(--container-border)] text-[var(--secondary)] rounded-lg hover:bg-[var(--container-border)]/20 transition-colors"
                            >
                                변경
                            </Button>
                        </div>
                        {showPasswordField && (
                            <div className="mt-4 space-y-3">
                                <input
                                    type="password"
                                    placeholder="현재 비밀번호"
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                />
                                <input
                                    type="password"
                                    placeholder="새 비밀번호"
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                />
                                <input
                                    type="password"
                                    placeholder="새 비밀번호 확인"
                                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                />
                                <div className="flex gap-2">
                                    <Button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors">
                                        저장
                                    </Button>
                                    <Button
                                        onClick={() => setShowPasswordField(false)}
                                        className="px-4 py-2 border border-[var(--container-border)] text-[var(--secondary)] rounded-lg hover:bg-[var(--container-border)]/20 transition-colors"
                                    >
                                        취소
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDataSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-[var(--secondary)] mb-4">
                    데이터 관리
                </h3>
                <div className="space-y-4">
                    <div className="p-4 bg-[var(--background)] border border-[var(--container-border)] rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="font-medium text-[var(--secondary)]">데이터 내보내기</div>
                                <div className="text-sm text-[var(--secondary)]/70">
                                    모든 데이터를 JSON 형식으로 다운로드
                                </div>
                            </div>
                            <Button
                                onClick={handleExportData}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                내보내기
                            </Button>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-red-400">계정 삭제</div>
                                <div className="text-sm text-red-400/70">
                                    계정과 모든 데이터가 영구적으로 삭제됩니다
                                </div>
                            </div>
                            <Button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                삭제
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case "profile":
                return renderProfileSection();
            case "notifications":
                return renderNotificationsSection();
            case "appearance":
                return renderAppearanceSection();
            case "security":
                return renderSecuritySection();
            case "data":
                return renderDataSection();
            default:
                return renderProfileSection();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* 헤더 */}
            <div className="bg-[var(--background)] border-b border-[var(--container-border)] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-[var(--secondary)] mb-1">
                            설정
                        </h1>
                        <p className="text-sm text-[var(--secondary)]/70">
                            계정 및 애플리케이션 설정을 관리하세요
                        </p>
                    </div>
                    <Button
                        onClick={handleSaveSettings}
                        className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        저장
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* 사이드바 */}
                <div className="w-64 bg-[var(--background)] border-r border-[var(--container-border)] p-4">
                    <nav className="space-y-2">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                                    activeSection === section.id
                                        ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20"
                                        : "text-[var(--secondary)]/70 hover:text-[var(--secondary)] hover:bg-[var(--container-border)]/20"
                                )}
                            >
                                {section.icon}
                                <div>
                                    <div className="font-medium">{section.title}</div>
                                    <div className="text-xs opacity-70">{section.description}</div>
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="flex-1 p-6 overflow-y-auto bg-[var(--background)]">
                    {renderContent()}
                </div>
            </div>

            {/* 계정 삭제 확인 모달 */}
            {showDeleteModal && (
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                >
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-full">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--secondary)]">
                                계정 삭제
                            </h2>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-[var(--secondary)]/80 mb-4">
                                정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 
                                모든 데이터가 영구적으로 삭제됩니다.
                            </p>
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <p className="text-sm text-red-400">
                                    ⚠️ 삭제될 데이터: 프로필, 프로젝트, 작업, 설정 등 모든 정보
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 border border-[var(--container-border)] text-[var(--secondary)] rounded-lg hover:bg-[var(--container-border)]/20 transition-colors"
                            >
                                취소
                            </Button>
                            <Button
                                onClick={handleDeleteAccount}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                삭제
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
