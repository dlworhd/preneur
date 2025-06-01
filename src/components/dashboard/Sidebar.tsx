import { cn } from "@/lib/utils";
import NavMenu from "./NavMenu";
import NavFooter from "./NavFooter";
import NavHeader from "./NavHeader";
import {
    ChevronDownIcon,
    CircleDashedIcon,
    GroupIcon,
    InboxIcon,
    LogOutIcon,
    SettingsIcon,
    Zap,
    LayoutDashboard,
} from "lucide-react";
import NavMenuItem, { type NavItem } from "./NavMenuItem";
import { Select, SelectItem } from "../common/Select";

export default function SideBar() {
    const selectItems: SelectItem[] = [
        {
            id: 1,
            value: "프로젝트",
            icon: <GroupIcon width={20} height={20} />,
        },
        { id: 2, value: "설정", icon: <SettingsIcon width={20} height={20} /> },
        {
            id: 3,
            value: "로그아웃",
            icon: <LogOutIcon width={20} height={20} />,
        },
    ];
    
    // 메인 대시보드 및 작업 관리
    const mainNavItems: NavItem[] = [
        {
            id: 1,
            name: "Dashboard",
            path: "/dashboard",
            icon: <LayoutDashboard width={20} height={20} />,
        },
        {
            id: 2,
            name: "Inbox",
            path: "/dashboard/inbox",
            icon: <InboxIcon width={20} height={20} />,
        },
    ];

    // 기능별 메뉴들
    const featureNavItems: NavItem[] = [
        {
            id: 3,
            name: "Tasks",
            path: "/dashboard/tasks",
            icon: <CircleDashedIcon width={20} height={20} />,
        },
        {
            id: 4,
            name: "Routines", 
            path: "/dashboard/routines",
            icon: <Zap width={20} height={20} />,
        },
    ];

    const handleValueChange = async (value: string) => {
        console.log("Selected:", value);
        // 선택된 값에 따른 액션 처리
        switch (value) {
            case "프로젝트":
                // 프로젝트 관련 액션
                break;
            case "설정":
                // 설정 페이지로 이동
                window.location.href = "/dashboard/settings";
                break;
            case "로그아웃":
                // 로그아웃 처리
                break;
        }
    };

    return (
        <header
            className={cn(
                "fixed top-0 left-0 flex flex-col justify-between w-[var(--sidebar-width)] h-[var(--sidebar-height)] p-4"
            )}
        >
            <NavHeader className="flex-1">
                <Select onValueChange={handleValueChange} defaultValue="@bankusy">
                    <Select.Trigger>
                        <div className="flex justify-between items-center w-full">
                            <Select.Value placeholder="@bankusy" />
                            <ChevronDownIcon width={20} height={20} />
                        </div>
                    </Select.Trigger>
                    <Select.Content>
                        {selectItems.map((item) => (
                            <Select.Item
                                key={item.id}
                                value={item.value}
                            >
                                {item.icon}
                                {item.value}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select>
            </NavHeader>
            <NavMenu className="flex-8 p-2">
                {/* 메인 대시보드 및 작업 관리 */}
                {mainNavItems.map((item, index) => (
                    <div key={item.id} className={index > 0 ? "mt-3" : ""}>
                        <NavMenuItem item={item}></NavMenuItem>
                    </div>
                ))}

                {/* 구분선 */}
                <div className="my-6 border-t border-[var(--container-border)]"></div>

                {/* 기능별 메뉴들 */}
                {featureNavItems.map((item, index) => (
                    <div key={item.id} className={index > 0 ? "mt-3" : ""}>
                        <NavMenuItem item={item}></NavMenuItem>
                    </div>
                ))}
            </NavMenu>
            <NavFooter />
        </header>
    );
}

