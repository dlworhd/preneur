import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number; // 밀리초 단위
    onClose?: () => void;
}

export default function Toast({
    message,
    type = "info",
    duration = 3000,
    onClose,
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const getBgColor = () => {
        switch (type) {
            case "success":
                return "bg-[var(--icon-success)]";
            case "error":
                return "bg-[var(--icon-error)]";
            default:
                return "bg-[var(--icon-info)]";
        }
    };

    return (
        <div
            className={cn(
                "fixed bottom-4 right-4 p-4 rounded-md  shadow-lg z-50",
                "animate-in slide-in-from-right-5 fade-in",
                "animate-out slide-out-to-right-5 fade-out",
                getBgColor()
            )}
        >
            <div className="flex items-center gap-2">
                <span>{message}</span>
            </div>
        </div>
    );
}
