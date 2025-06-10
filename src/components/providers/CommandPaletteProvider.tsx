import React, { createContext, useContext, useState, useEffect } from "react";
import CommandPalette from "../common/CommandPalette";

interface CommandPaletteContextType {
    isOpen: boolean;
    openCommandPalette: () => void;
    closeCommandPalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined);

export const useCommandPalette = () => {
    const context = useContext(CommandPaletteContext);
    if (context === undefined) {
        throw new Error('useCommandPalette must be used within a CommandPaletteProvider');
    }
    return context;
};

interface CommandPaletteProviderProps {
    children: React.ReactNode;
}

export default function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openCommandPalette = () => setIsOpen(true);
    const closeCommandPalette = () => setIsOpen(false);

    // 전역 키보드 단축키 처리
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+/ 또는 Ctrl+/ 단축키
            if ((e.metaKey || e.ctrlKey) && e.key === "K") {
                e.preventDefault();
                if (!isOpen) {
                    openCommandPalette();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    const contextValue: CommandPaletteContextType = {
        isOpen,
        openCommandPalette,
        closeCommandPalette,
    };

    return (
        <CommandPaletteContext.Provider value={contextValue}>
            {children}
            <CommandPalette isOpen={isOpen} onClose={closeCommandPalette} />
        </CommandPaletteContext.Provider>
    );
} 