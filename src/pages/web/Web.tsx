import React, { useEffect, useRef } from "react";

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

    return (
        <div
            ref={containerRef}
            className="h-screen overflow-hidden snap-y snap-mandatory"
        >
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
                    <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-20">
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
                                <button className="group px-8 py-4 rounded-full font-medium text-lg hover:bg-[var(--gray-800)] transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2">
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
                                </button>

                                <button className="bg-transparent border-2 border-gray-300 px-8 py-4 rounded-full font-medium text-lg hover:text-[var(--background)] hover:bg-[var(--foreground)] transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                                    Try demo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}
