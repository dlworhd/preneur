import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Activity, Calendar, Heart } from "lucide-react";
import Modal from "@/components/common/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import PageContent from "@/components/dashboard/PageContent";
import MetricCard from "@/components/dashboard/MetricCard";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ActivityData {
    day: number;
    value: number;
}

function ActivityChart({ data }: { data: ActivityData[] }) {
    const chartData = {
        labels: data.map((_, idx) => `${idx + 1}`),
        datasets: [
            {
                label: 'Activity',
                data: data.map(d => d.value),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 16, 25, 0.9)',
                titleColor: '#e1dffa',
                bodyColor: '#e1dffa',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: function(context: any) {
                        return `Day ${parseInt(context[0].label)}`;
                    },
                    label: function(context: any) {
                        return `Activity: ${context.parsed.y}%`;
                    },
                },
            },
        },
        scales: {
            x: {
                display: false,
                grid: {
                    display: false,
                },
            },
            y: {
                display: false,
                grid: {
                    display: false,
                },
                beginAtZero: false,
            },
        },
        elements: {
            point: {
                hoverBorderWidth: 2,
            },
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    return (
        <div className="h-[100px] px-2">
            <Line data={chartData} options={options} />
        </div>
    );
}

export default function DashboardPage() {
    const [isClient, setIsClient] = useState(false);
    const [activityData, setActivityData] = useState<ActivityData[]>([]);
    const [isHovered, setIsHovered] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [lifeSeconds, setLifeSeconds] = useState(0);
    const [currentQuote, setCurrentQuote] = useState("");
    const [displayedQuote, setDisplayedQuote] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        setIsClient(true);
        const data = Array.from({ length: 30 }, (_, idx) => ({
            day: idx + 1,
            value: Math.floor(Math.random() * 100),
        }));
        setActivityData(data);

        // 시간 관련 명언 배열
        const timeQuotes = [
            "시간은 생명이다",
            "오늘이 인생의 첫날이다",
            "시간을 아끼는 자가 성공한다",
            "매 순간이 새로운 시작이다",
            "시간은 가장 소중한 자원이다",
            "지금 이 순간을 살아라",
            "시간은 돌아오지 않는다",
            "오늘 할 수 있는 일을 내일로 미루지 마라",
            "시간이 모든 상처를 치유한다",
            "시간은 평등하게 주어진 유일한 것",
            "과거에 연연하지 말고 미래를 준비하라",
            "시간은 흘러가지만 추억은 남는다",
        ];

        // 초기 명언 설정
        setCurrentQuote(timeQuotes[0]);

        // 생년월일 설정 (예: 1990년 1월 1일)
        const birthDate = new Date("1990-01-01");
        const updateLifeTimer = () => {
            const now = new Date();
            const livedMs = now.getTime() - birthDate.getTime();
            const livedSeconds = Math.floor(livedMs / 1000);

            // 100년을 초로 환산 (100년 * 365.25일 * 24시간 * 60분 * 60초)
            const hundredYearsInSeconds = 100 * 365.25 * 24 * 60 * 60;
            const remainingSeconds = Math.floor(
                hundredYearsInSeconds - livedSeconds
            );

            setLifeSeconds(Math.max(0, remainingSeconds)); // 음수 방지
        };

        updateLifeTimer();
        const lifeTimerInterval = setInterval(updateLifeTimer, 1000);

        return () => {
            clearInterval(lifeTimerInterval);
        };
    }, []);

    // 타이핑 효과를 위한 useEffect
    useEffect(() => {
        const timeQuotes = [
            "시간은 생명이다",
            "오늘이 인생의 첫날이다",
            "시간을 아끼는 자가 성공한다",
            "매 순간이 새로운 시작이다",
            "시간은 가장 소중한 자원이다",
            "지금 이 순간을 살아라",
            "시간은 돌아오지 않는다",
            "오늘 할 수 있는 일을 내일로 미루지 마라",
            "시간이 모든 상처를 치유한다",
            "시간은 평등하게 주어진 유일한 것",
            "과거에 연연하지 말고 미래를 준비하라",
            "시간은 흘러가지만 추억은 남는다",
        ];

        const typingSpeed = 50; // 타이핑 속도
        const deletingSpeed = 30; // 삭제 속도
        const pauseTime = 2000; // 완성 후 대기 시간

        const typingTimer = setTimeout(
            () => {
                if (
                    !isDeleting &&
                    displayedQuote.length < currentQuote.length
                ) {
                    // 타이핑 중
                    setDisplayedQuote(
                        currentQuote.slice(0, displayedQuote.length + 1)
                    );
                } else if (
                    !isDeleting &&
                    displayedQuote.length === currentQuote.length
                ) {
                    // 타이핑 완료 후 잠시 대기
                    setTimeout(() => setIsDeleting(true), pauseTime);
                } else if (isDeleting && displayedQuote.length > 0) {
                    // 삭제 중
                    setDisplayedQuote(displayedQuote.slice(0, -1));
                } else if (isDeleting && displayedQuote.length === 0) {
                    // 삭제 완료 후 다음 명언으로 이동
                    setIsDeleting(false);
                    const nextIndex = (quoteIndex + 1) % timeQuotes.length;
                    setQuoteIndex(nextIndex);
                    setCurrentQuote(timeQuotes[nextIndex]);
                }
            },
            isDeleting ? deletingSpeed : typingSpeed
        );

        return () => clearTimeout(typingTimer);
    }, [currentQuote, displayedQuote, isDeleting, quoteIndex]);

    const formatLifeSeconds = (seconds: number) => {
        return seconds.toLocaleString();
    };

    const metrics = [
        {
            label: (
                <span>
                    Life Timer - {displayedQuote}
                    <span className="cursor-blink">|</span>
                </span>
            ),
            value: formatLifeSeconds(lifeSeconds),
            icon: (
                <Heart
                    width={16}
                    height={16}
                    className="text-[var(--icon-error)] fill-[var(--icon-error)]"
                />
            ),
            trend: "seconds remaining",
        },
        {
            label: "Tasks Completed",
            value: "24",
            icon: <Activity width={20} height={20} />,
            trend: "+20%",
        },
        {
            label: "Focus Time",
            value: "6.5h",
            icon: <Calendar width={20} height={20} />,
            trend: "평균",
        },
    ];

    return (
        <div className={cn("bg-[var(--background)] flex flex-col h-full")}>
            <PageHeader title="Dashboard Overview" />

            <PageContent>
                {/* 카드 형식 섹션 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {metrics.map((metric, index) => (
                        <MetricCard
                            key={index}
                            label={metric.label}
                            value={metric.value}
                            icon={metric.icon}
                            trend={metric.trend}
                            onClick={
                                metric.label === "Life Timer"
                                    ? () => setShowPopup(true)
                                    : undefined
                            }
                            className={cn(
                                isHovered &&
                                    metric.label === "Life Timer" &&
                                    "opacity-80"
                            )}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        />
                    ))}
                </div>

                {/* 활동 차트 섹션 */}
                <div className="border-t border-[var(--container-border)] mt-4 pt-4 mx-4">
                    <div className="p-2 text-xs font-medium text-[var(--secondary)] opacity-60">
                        ACTIVITY (30 DAYS)
                    </div>
                    <div className="p-2">
                        {isClient && activityData.length > 0 ? (
                            <ActivityChart data={activityData} />
                        ) : (
                            <div className="h-[100px] flex items-center justify-center">
                                <span className="m text-[var(--secondary)] opacity-60">
                                    Loading...
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between text-xs text-[var(--secondary)] opacity-60 px-2 pb-2">
                        <span>30일 전</span>
                        <span>오늘</span>
                    </div>
                </div>

                {/* 주간 요약 섹션 */}
                <div className="border-t border-[var(--container-border)] mt-4 pt-4 mx-4">
                    <div className="p-2 text-xs font-medium text-[var(--secondary)] opacity-60">
                        WEEKLY SUMMARY
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                        <div className="border border-[var(--container-border)] rounded-lg p-3 bg-[var(--background)] hover:shadow-md transition-shadow">
                            <div className="m text-[var(--secondary)] mb-1">
                                완료된 작업
                            </div>
                            <div className="text-xl font-bold text-[var(--primary)]">
                                24
                            </div>
                        </div>
                        <div className="border border-[var(--container-border)] rounded-lg p-3 bg-[var(--background)] hover:shadow-md transition-shadow">
                            <div className="m text-[var(--secondary)] mb-1">
                                생산성 점수
                            </div>
                            <div className="text-xl font-bold text-[var(--primary)]">
                                87%
                            </div>
                        </div>
                    </div>
                </div>
            </PageContent>

            {showPopup && (
                <Modal
                    className="bg-[var(--background)]"
                    width="400px"
                    height="150px"
                    isOpen={showPopup}
                    onClose={() => setShowPopup(false)}
                >
                    <div className="p-4 enter">
                        <h3 className="text-lg font-medium mb-2 text-[var(--secondary)]">
                            Life Timer
                        </h3>
                        <p className="text-base text-[var(--secondary)]">
                            100년 수명 기준 {formatLifeSeconds(lifeSeconds)}초가
                            남았습니다.
                        </p>
                    </div>
                </Modal>
            )}
        </div>
    );
}
