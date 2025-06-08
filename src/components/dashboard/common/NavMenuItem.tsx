import { cn } from "@/lib/utils";
import React from "react";
import { useLocation, Link } from "react-router-dom";

// 타입 정의
export interface NavItem {
    id: number;
    name: string;
    path: string;
    icon: React.ReactNode;
}

interface NavMenuItemProps {
    item: NavItem;
}

export default function NavMenuItem({ item }: NavMenuItemProps) {
    const location = useLocation();
    const isActive = location.pathname === item.path;

    return (
        <Link to={item.path}>
            <li
                className={cn(
                    "text-sm flex gap-4",
                    " transition-opacity",
                    isActive
                        ? "text-[var(--secondary)]"
                        : "text-[var(--secondary)] opacity-60 hover:opacity-100"
                )}
            >
                <div
                    className={cn(
                        isActive
                            ? "text-[var(--secondary)]"
                            : "text-[var(--secondary)] opacity-60"
                    )}
                >
                    {item.icon}
                </div>
                <div
                    className={cn(
                        isActive
                            ? "text-[var(--secondary)]"
                            : "text-[var(--secondary)] opacity-60"
                    )}
                >
                    {item.name}
                </div>
            </li>
        </Link>
    );
}
