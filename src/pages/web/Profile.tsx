import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import WebPage from "./Web";
import Button from "@/components/common/Button";
interface UserProfile {
    id: string;
    username: string;
    displayName: string;
    bio: string;
    avatar: string;
    location?: string;
    website?: string;
    email?: string;
    github?: string;
    twitter?: string;
    joinedAt: Date;
    followers: number;
    following: number;
    projects: Project[];
}

interface Project {
    id: string;
    title: string;
    description: string;
    image: string;
    tags: string[];
    stars: number;
    views: number;
    createdAt: Date;
    isPublic: boolean;
}

// 임시 데이터 (실제로는 API에서 가져올 것)
const fetchedUser = {
    id: "1",
    username: "bankusy",
    displayName: "Bankusy",
    bio: "Creative developer & designer. Building beautiful digital experiences with modern technologies. Always learning, always creating.",
    avatar: "/images/profile.jpg",
    location: "Seoul, South Korea",
    website: "https://bankusy.dev",
    email: "hello@bankusy.dev",
    github: "bankusy",
    twitter: "bankusy",
    joinedAt: new Date("2023-01-15"),
    followers: 1234,
    following: 567,
    projects: [
        {
            id: "1",
            title: "Preneur Dashboard",
            description:
                "A modern project management dashboard for creative teams",
            image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop",
            tags: ["React", "TypeScript", "Tailwind"],
            stars: 89,
            views: 2341,
            createdAt: new Date("2024-12-01"),
            isPublic: true,
        },
        {
            id: "2",
            title: "Design System",
            description: "Comprehensive design system with reusable components",
            image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop",
            tags: ["Design", "Figma", "React"],
            stars: 156,
            views: 4567,
            createdAt: new Date("2024-11-15"),
            isPublic: true,
        },
        {
            id: "3",
            title: "AI Chat Interface",
            description: "Beautiful chat interface for AI conversations",
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
            tags: ["AI", "Chat", "UI/UX"],
            stars: 234,
            views: 8901,
            createdAt: new Date("2024-10-20"),
            isPublic: true,
        },
    ],
};

export default function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"projects" | "about">(
        "projects"
    );
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        // URL에서 @username 형태 파싱
        const pathname = location.pathname;

        // 홈페이지인 경우는 처리하지 않음
        if (pathname === "/") {
            return;
        }

        // /@username 형태인지 확인
        const match = pathname.match(/^\/@(.+)$/);
        if (match) {
            const extractedUsername = match[1];
            setUsername(extractedUsername);

            // 실제로는 API 호출
            const foundUser = fetchedUser;
            if (foundUser) {
                setUser(foundUser);
            }
        }
        setLoading(false);
    }, [location.pathname]);

    // 홈페이지인 경우 WebPage 렌더링
    if (location.pathname === "/") {
        return <WebPage />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="enter">
                    <h1 className="text-2xl font-bold text-[var(--secondary)] mb-4">
                        User not found
                    </h1>
                    <p className="text-[var(--secondary)]/60 mb-6">
                        The user @{username} doesn't exist.
                    </p>
                    <Button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-[var(--primary)]  rounded-xl hover:bg-[var(--primary)]/90 transition-colors"
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[var(--background)] relative overflow-hidden">
            <div className="absolute top-[-10px] left-[-180px] w-[240px] h-[240px] rounded-full bg-[#3d9fba] opacity-70 blur-3xl z-0 float-bounce-1" />
            <div className="absolute bottom-[20px] right-[-60px] w-[320px] h-[320px] rounded-full bg-[#fe4f7b] opacity-60 blur-3xl z-0 float-bounce-2" />
            <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#b7d06b] opacity-60 blur-2xl z-0 float-bounce-3" />
            <div className="absolute top-[20%] right-[30%] w-[90px] h-[80px] rounded-full bg-[#000a73] opacity-60 blur-2xl z-0 float-bounce-3" />

            {/* 프로필 카드 */}
            <div className="flex items-center justify-center min-h-screen w-full relative z-10">
                <div className="cursor-pointer group transform transition-all duration-500 w-[280px]">
                    <div className=" rounded-3xl border border-[var(--border)]/40 bg-gradient-to-br from-[#6b61b64a] via-[#ffffff23] to-[#424242] shadow-2xl duration-700 z-10 relative backdrop-blur-xl hover:border-[var(--border)]/60 overflow-hidden hover:shadow-[var(--foreground)]/5 hover:shadow-3xl">
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--foreground)]/10 to-[var(--foreground)]/40 opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

                            <div
                                style={{ animationDelay: "0.5s" }}
                                className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-gradient-to-tr from-[var(--foreground)]/10 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transform transition-all duration-75 animate-bounce"
                            ></div>

                            <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-[var(--foreground)]/5 blur-xl animate-ping"></div>
                            <div
                                style={{ animationDelay: "1s" }}
                                className="absolute bottom-16 right-16 w-12 h-12 rounded-full bg-[var(--foreground)]/5 blur-lg animate-ping"
                            ></div>

                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--foreground)]/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                        </div>

                        <div className="p-12 relative z-10">
                            <div className="flex flex-col items-center enter">
                                <div className="relative mb-10">
                                    <div className="absolute inset-0 rounded-full animate-ping"></div>
                                    <div
                                        style={{ animationDelay: "0.5s" }}
                                        className="absolute inset-0 rounded-full animate-pulse"
                                    ></div>

                                    <div className="rounded-full backdrop-blur-lg shadow-2xl border border-[#d9d9d9]/50 transform -rotate-45 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500">
                                        <div className="transform transition-transform duration-700">
                                            <img
                                                className="object-cover rounded-full w-[80px] h-[80px] blur-sm group-hover:blur-none transition-all duration-300"
                                                src={ fetchedUser.avatar }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 transform transition-transform duration-300">
                                    <p className="text-2xl font-bold bg-gradient-to-r from-[#44f57f] via-[#000000] to-[var(--primary)] bg-clip-text text-transparent animate-pulse">
                                        @{ fetchedUser.displayName }
                                    </p>
                                </div>

                                <div className="space-y-1 max-w-sm">
                                    <div className="h-[120px] text-[var(--foreground-muted)] m font-semibold leading-relaxed transform transition-colors duration-300">
                                     
                                    </div>
                                </div>

                                <div className="mt-6 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-[var(--foreground)] to-transparent rounded-full transform group-hover:w-1/2 group-hover:h-1 transition-all duration-500 animate-pulse"></div>

                                <div className="flex space-x-2 mt-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-2 h-2 bg-[var(--foreground)] rounded-full animate-bounce"></div>
                                    <div
                                        style={{ animationDelay: "0.1s" }}
                                        className="w-2 h-2 bg-[var(--foreground)] rounded-full animate-bounce"
                                    ></div>
                                    <div
                                        style={{ animationDelay: "0.2s" }}
                                        className="w-2 h-2 bg-[var(--foreground)] rounded-full animate-bounce"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
