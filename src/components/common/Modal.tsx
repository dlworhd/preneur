import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    width?: string;
    height?: string;
}

export default function Modal({ isOpen, onClose, children, className, width = 'max-w-[90%] md:max-w-[70%]', height = 'max-h-[80vh]' }: ModalProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !isClient) return null;

    return (
        <div
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className={cn(
                    'bg-[var(--background)] border border-[var(--container-border)] rounded-3xl p-8 overflow-y-auto mx-4',
                    
                    className
                )}
                style={{ width: `${width}`, height: `${height}`}}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}

