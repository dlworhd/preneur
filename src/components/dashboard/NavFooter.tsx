import React, { useState, useEffect } from "react";
import { Timer, Play, Pause, Square } from "lucide-react";
import Toast from "@/components/common/Toast";

export default function NavFooter() {
    const [time, setTime] = useState(25 * 60);
    const [inputTime, setInputTime] = useState(25);
    const [isRunning, setIsRunning] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            const savedTime = localStorage.getItem("pomodoroTime");
            if (savedTime) {
                setTime(parseInt(savedTime) * 60);
                setInputTime(parseInt(savedTime));
            }
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && time > 0) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime - 1);
            }, 1000);
        } else if (time === 0) {
            setIsRunning(false);
            setTime(inputTime * 60); // 초기 값으로 다시 설정
            setShowToast(true); // Toast 메시지 표시
            console.log('Timer completed, showing toast');
            // 알림음 또는 효과 추가 가능
        }
        return () => clearInterval(interval);
    }, [isRunning, time, inputTime]);

    const startTimer = () => {
        setIsRunning(true);
        localStorage.setItem("pomodoroTime", inputTime.toString());
    };

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const stopTimer = () => {
        setIsRunning(false);
        setTime(inputTime * 60);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0) {
            setInputTime(value);
            setTime(value * 60);
        }
    };

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    if (!isClient) return <div className="h-16 flex-1 flex flex-col justify-end items-center"></div>;

    return (
        <div className="h-16 flex-1 flex flex-col justify-end items-center text-[var(--secondary)] opacity-60 text-sm hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            <div className="flex items-center gap-1 mb-1">
                <Timer width={14} height={14} />
                <span className="font-mono text-base font-bold">
                    {minutes.toString().padStart(2, '0')}:
                    {seconds.toString().padStart(2, '0')}
                </span>
            </div>
            <div className="flex gap-1 text-[10px] bg-[var(--background)]/80 p-1 rounded border border-[var(--container-border)]/50">
                <input
                    type="number"
                    value={inputTime}
                    onChange={handleTimeChange}
                    className="w-12 bg-transparent text-center focus:outline-none"
                    min="1"
                    disabled={isRunning}
                />
                <button
                    onClick={startTimer}
                    disabled={isRunning}
                    className="p-0.5 rounded hover:bg-[var(--primary)]/10 disabled:opacity-30"
                >
                    <Play width={10} height={10} />
                </button>
                <button
                    onClick={pauseTimer}
                    disabled={!isRunning}
                    className="p-0.5 rounded hover:bg-[var(--primary)]/10 disabled:opacity-30"
                >
                    <Pause width={10} height={10} />
                </button>
                <button
                    onClick={stopTimer}
                    className="p-0.5 rounded hover:bg-[var(--primary)]/10"
                >
                    <Square width={10} height={10} />
                </button>
            </div>
            {isClient && showToast && (
                <Toast
                    message="뽀모도로 타이머가 완료되었습니다!"
                    type="success"
                    onClose={() => {
                        setShowToast(false);
                        console.log('Toast closed');
                    }}
                />
            )}
        </div>
    );
}

