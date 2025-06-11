import "@/styles/globals.css";
import "@/styles/dashboard.css";
import Container from "@/components/dashboard/Container";
import SideBar from "@/components/dashboard/common/Sidebar";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <>
            <SideBar />
            <Container
                className={cn(
                    "border border-[var(--container-border)] rounded-md bg-[var(--container-background)]",
                    "absolute top-[16px] right-[16px] w-[var(--container-width)] h-[var(--container-height)]"
                )}
            >
                <Outlet />
            </Container>
        </>
    );
}
