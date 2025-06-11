import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    anchorElement?: HTMLElement | null;
    className?: string;
    placement?: "top" | "bottom" | "left" | "right";
}

export default function Popover({ 
    isOpen, 
    onClose, 
    children, 
    anchorElement, 
    className,
    placement = "bottom",
}: PopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isPositioned, setIsPositioned] = useState(false);

    useEffect(() => {
        if (isOpen && anchorElement && popoverRef.current) {
            const anchorRect = anchorElement.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();

            let top = 0;
            let left = 0;

            switch (placement) {
                case "bottom":
                    top = anchorRect.bottom + 8;
                    left =
                        anchorRect.left +
                        anchorRect.width / 2 -
                        popoverRect.width / 2;
                    break;
                case "top":
                    top = anchorRect.top - popoverRect.height - 8;
                    left =
                        anchorRect.left +
                        anchorRect.width / 2 -
                        popoverRect.width / 2;
                    break;
                case "right":
                    top =
                        anchorRect.top +
                        anchorRect.height / 2 -
                        popoverRect.height / 2;
                    left = anchorRect.right + 8;
                    break;
                case "left":
                    top =
                        anchorRect.top +
                        anchorRect.height / 2 -
                        popoverRect.height / 2;
                    left = anchorRect.left - popoverRect.width - 8;
                    break;
            }

            // Keep popover within viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (left < 8) left = 8;
            if (left + popoverRect.width > viewportWidth - 8) {
                left = viewportWidth - popoverRect.width - 8;
            }
            if (top < 8) top = 8;
            if (top + popoverRect.height > viewportHeight - 8) {
                top = viewportHeight - popoverRect.height - 8;
            }

            setPosition({ top, left });
            setIsPositioned(true);
        }
    }, [isOpen, anchorElement, placement]);

    useEffect(() => {
        if (!isOpen) {
            setIsPositioned(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={popoverRef}
            className={cn(
                "fixed z-50 bg-[var(--background)] border border-[var(--container-border)] rounded-xl shadow-lg",
                !isPositioned && "invisible",
                className
            )}
            style={{
                top: position.top,
                left: position.left,
            }}
        >
            {children}
        </div>
    );
}
