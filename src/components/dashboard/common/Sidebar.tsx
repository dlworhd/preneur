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
    CalendarIcon,
    NotebookIcon,
    BoxIcon,
    Search,
} from "lucide-react";
import NavMenuItem, { type NavItem } from "./NavMenuItem";
import { Select, SelectItem } from "@/components/common/Select";
import { useCommandPalette } from "@/components/providers/CommandPaletteProvider";

export default function SideBar() {
    const { openCommandPalette } = useCommandPalette();
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
        {
            id: 5,
            name: "Calendar",
            path: "/dashboard/calendar",
            icon: <CalendarIcon width={20} height={20} />,
        },
    ];

    // 기능별 메뉴들
    const secondFeatureNavItems: NavItem[] = [
        {
            id: 6,
            name: "Products",
            path: "/dashboard/products",
            icon: <BoxIcon width={20} height={20} />,
        },
        {
            id: 7,
            name: "Note",
            path: "/dashboard/note",
            icon: <NotebookIcon width={20} height={20} />,
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
                <Select
                    onValueChange={handleValueChange}
                    defaultValue="@bankusy"
                >
                    <Select.Trigger>
                        <div className="flex justify-between items-center w-full">
                            <Select.Value placeholder="@bankusy" />
                            <ChevronDownIcon width={20} height={20} />
                        </div>
                    </Select.Trigger>
                    <Select.Content>
                        {selectItems.map((item) => (
                            <Select.Item key={item.id} value={item.value}>
                                {item.icon}
                                {item.value}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select>
                {/* Command Palette Button */}
            <div className="w-full my-4 flex justify-center">
                <button
                    onClick={openCommandPalette}
                    className="w-full h-10 group flex justify-between items-center gap-4 px-2 py-1 bg-[var(--background)]/80 border border-[var(--container-border)]/80 rounded-md text-[var(--secondary)]/60 hover:text-[var(--secondary)] hover:border-[var(--primary)]/80 hover:bg-[var(--primary)]/5 transition-all duration-200 text-[10px]"
                    title="커맨드 팔레트 열기"
                >
                    <Search width={20} height={20}/>
                    <span className="text-[0.8rem] font-medium w-28 text-start">Search</span>
                    <div className="flex items-center gap-0.5 text-[9px] opacity-70">
                        <kbd className="flex justify-center items-center gap-1 w-[40px] p-1 bg-[var(--container-border)]/20 rounded text-[11px]">
                                <span className="text-[1rem]">⌘</span><span className="text-[0.7rem]">K</span>
                        </kbd>
                    </div>
                </button>
            </div>
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

                <div className="my-6 border-t border-[var(--container-border)]"></div>

                {secondFeatureNavItems.map((item, index) => (
                    <div key={item.id} className={index > 0 ? "mt-3" : ""}>
                        <NavMenuItem item={item}></NavMenuItem>
                    </div>
                ))}
            </NavMenu>
            <NavFooter />
        </header>
    );
}
