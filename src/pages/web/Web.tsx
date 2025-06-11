import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";
import Button from "@/components/common/Button";

const Section = ({
    id,
    children,
}: {
    id: string;
    children?: React.ReactNode;
}) => {
    return (
        <section id={id} className="relative min-h-screen snap-start">
            {children}
        </section>
    );
};

export default function Page() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef(false);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (isScrolling.current) return;

            const sections = container.querySelectorAll("section");
            const currentSection = Array.from(sections).find((section) => {
                const rect = section.getBoundingClientRect();
                return Math.abs(rect.top) < window.innerHeight / 2;
            });

            if (currentSection) {
                const currentIndex =
                    Array.from(sections).indexOf(currentSection);
                const nextIndex =
                    e.deltaY > 0
                        ? Math.min(currentIndex + 1, sections.length - 1)
                        : Math.max(currentIndex - 1, 0);

                isScrolling.current = true;
                const targetSection = sections[nextIndex];

                targetSection.scrollIntoView({ behavior: "smooth" });

                setTimeout(() => {
                    isScrolling.current = false;
                }, 1000);
            }
        };

        window.addEventListener("wheel", handleWheel, { passive: false });
        return () => window.removeEventListener("wheel", handleWheel);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // @를 제거하고 사용자명만 추출
            const username = searchQuery.replace(/^@/, '').trim();
            if (username) {
                navigate(`/@${username}`);
            }
        }
    };

    // 외부 클릭으로 검색 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (showSearch && !target.closest('.search-dropdown')) {
                setShowSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showSearch]);

    return (
        <div
            ref={containerRef}
            className="h-screen overflow-hidden snap-y snap-mandatory"
        >
            {/* Fixed Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--container-border)]">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-[var(--secondary)]">
                            Preneur
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* Profile Search */}
                            <div className="relative search-dropdown">
                                <Button
                                    onClick={() => setShowSearch(!showSearch)}
                                    className="p-2 text-[var(--secondary)]/60 hover:text-[var(--secondary)] hover:bg-[var(--container-border)]/20 rounded-lg transition-colors"
                                    title="Search profiles"
                                >
                                    <Search className="w-5 h-5" />
                                </Button>
                                
                                {showSearch && (
                                    <div className="absolute right-0 top-12 w-80 bg-[var(--background)] border border-[var(--container-border)] rounded-xl shadow-xl p-4">
                                        <form onSubmit={handleSearch} className="space-y-3">
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--secondary)]/40" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="@username"
                                                    className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border border-[var(--container-border)] rounded-lg text-[var(--secondary)] placeholder:text-[var(--secondary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                                                    autoFocus
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                className="w-full px-4 py-3 bg-[var(--primary)]  rounded-lg hover:bg-[var(--primary)]/90 transition-colors font-medium"
                                            >
                                                Visit Profile
                                            </Button>
                                        </form>
                                        <div className="mt-3 pt-3 border-t border-[var(--container-border)]">
                                            <p className="text-xs text-[var(--secondary)]/60 mb-2">Try these profiles:</p>
                                            <div className="flex flex-wrap gap-2">
                                                                                            <Button
                                                onClick={() => navigate("/@bankusy")}
                                                className="px-2 py-1 text-xs bg-[var(--container-border)]/20 text-[var(--secondary)]/70 rounded hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-colors"
                                            >
                                                @bankusy
                                            </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <Button className="px-4 py-2 text-[var(--secondary)] hover:bg-[var(--container-border)]/20 rounded-lg transition-colors">
                                Sign In
                            </Button>
                            <Button className="px-4 py-2 bg-[var(--primary)]  rounded-lg hover:bg-[var(--primary)]/90 transition-colors">
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-10 right-20 w-96 h-96 bg-gradient-to-br from-cyan-300/60 to-teal-400/40 rounded-full blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-pink-300/50 to-rose-400/30 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
                <div className="absolute top-1/3 left-10 w-64 h-64 bg-gradient-to-br from-purple-300/40 to-indigo-400/30 rounded-full blur-3xl opacity-50 animate-pulse delay-2000"></div>
                <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-gradient-to-br from-blue-200/30 to-cyan-300/20 rounded-full blur-2xl opacity-40 animate-pulse delay-500"></div>
                <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-gradient-to-br from-orange-200/30 to-pink-300/20 rounded-full blur-2xl opacity-40 animate-pulse delay-1500"></div>
            </div>
            <Section id="section1">
                <div className="flex items-center justify-center h-screen">
                    {/* 메인 콘텐츠 */}
                    <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-20 pt-32">
                        <div className="text-center max-w-5xl mx-auto">
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-6 animate-fade-in-up">
                                The creative project management suite
                            </h1>

                            <p className="text-5xl md:text-6xl lg:text-7xl font-light mb-12 leading-tight animate-fade-in-up animation-delay-200">
                                for modern teams
                            </p>

                            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-400">
                                Saga transforms how creative teams collaborate.
                                From concept to completion, manage projects with
                                intuitive workflows designed specifically for
                                designers, marketers, and creative professionals
                                who value simplicity over complexity.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
                                <Button className="group px-8 py-4 rounded-full font-medium text-lg hover:bg-[var(--gray-800)] transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2">
                                    Start your saga
                                    <svg
                                        className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                                        />
                                    </svg>
                                </Button>

                                <Button className="bg-transparent border border-[var(--border)] px-8 py-4 rounded-full font-medium text-lg hover:text-[var(--background)] hover:bg-[var(--foreground)] transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                                    Try demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}
