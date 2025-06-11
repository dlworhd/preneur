import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect, createContext, useContext } from "react";

export interface SelectItem {
    id: number;
    value: string;
    icon: React.ReactNode;
    className?: string;
}

interface SelectContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedValue: string;
    setSelectedValue: (value: string) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

const useSelectContext = () => {
    const context = useContext(SelectContext);
    if (!context) {
        throw new Error('Select components must be used within a Select');
    }
    return context;
};

interface SelectProps {
    className?: string;
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
}

interface SelectTriggerProps {
    className?: string;
    children: React.ReactNode;
}

interface SelectItemProps {
    value: string;
    align?: 'start' | 'center' | 'end';
    className?: string;
    children: React.ReactNode;
}

export function Select({ className, children, onValueChange, defaultValue = "" }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultValue);
    const selectRef = useRef<HTMLDivElement>(null);
    const onValueChangeRef = useRef(onValueChange);

    // Always keep the latest onValueChange reference
    useEffect(() => {
        onValueChangeRef.current = onValueChange;
    });

    // Update selectedValue when defaultValue changes (for controlled components)
    useEffect(() => {
        setSelectedValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Only call if selectedValue is different from defaultValue to avoid calling on initial render
        if (selectedValue !== defaultValue && onValueChangeRef.current) {
            onValueChangeRef.current(selectedValue);
        }
    }, [selectedValue, defaultValue]);

    return (
        <SelectContext.Provider value={{ isOpen, setIsOpen, selectedValue, setSelectedValue }}>
            <div
                ref={selectRef}
                className={cn("relative rounded-sm hover:bg-[#101010]", className)}
            >
                {children}
            </div>
        </SelectContext.Provider>
    );
}

export function SelectContent({ className, children }: { className?: string; children: React.ReactNode }) {
    const { isOpen } = useSelectContext();

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "border border-[var(--border)] bg-[var(--background)] rounded-sm",
                "absolute top-full left-0 items-center w-full mt-2 p-2 z-50",
                className
            )}
        >
            {children}
        </div>
    );
}

export function SelectTrigger({
    className,
    children,
}: SelectTriggerProps) {
    const { isOpen, setIsOpen } = useSelectContext();

    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div
            className={cn(
                "flex items-center p-2 h-[36px] cursor-pointer",
                className
            )}
            onClick={handleClick}
        >
            {children}
        </div>
    );
}

export function SelectValue({ className, placeholder }: { className?: string; placeholder?: string }) {
    const { selectedValue } = useSelectContext();

    return (
        <div className={cn("", className)}>
            <span>{selectedValue || placeholder}</span>
        </div>
    );
}

export function SelectItem({
    value,
    align='start',
    className,
    children,
}: SelectItemProps) {
    const { setIsOpen, setSelectedValue } = useSelectContext();

    const handleItemClick = () => {
        setSelectedValue(value);
        setIsOpen(false);
    };

    return (
        <div
            className={cn(
                `w-full text-sm text-${align} items-center h-[32px] cursor-pointer hover:opacity-40`,
                align !== 'center' ? 'flex gap-4' : '', // 배열이 가운데인 경우는 아이콘이 없을 것이라고 판단하여 중앙 정렬을 위해 flex 적용 => 추후 리팩토링 필요
                className
            )}
            onClick={handleItemClick}
        >
            {children}
        </div>
    );
}

Select.Item = SelectItem;
Select.Value = SelectValue;
Select.Trigger = SelectTrigger;
Select.Content = SelectContent;
