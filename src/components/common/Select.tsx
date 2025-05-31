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
                "border border-[var(--border-1)] bg-[var(--container-background)] rounded-sm",
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
                "text-sm flex gap-4 items-center h-[32px] cursor-pointer hover:opacity-40",
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
