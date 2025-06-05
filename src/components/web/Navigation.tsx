"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface NavLink {
    href: string;
    label: string;
}

const desktopLinks: NavLink[] = [
    { href: "/", label: "Overview" },
    { href: "/pricing", label: "Pricing" },
    { href: "/docs", label: "Docs" },
    { href: "/sign-up", label: "Sign Up" },
    { href: "/login", label: "Login" },
    // { href: "https://github.com", label: "Github", isExternal: true },
];

export default function Navigation() {
    let index = 0;
    const characters = ["✻", "✢", "✧", "☻", "✦", "✶"];
    const [currentChar, setCurrentChar] = useState(characters[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            index = (index + 1) % characters.length;
            setCurrentChar(characters[index]);
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <header className="flex items-center h-[var(--navbar-height)] text-[var(--foreground)] fixed top-4 left-1/2 -translate-x-1/2 transform z-50 rounded-xl shadow-lg">
            <nav className="h-full flex items-center justify-between px-8">
                <ul className="flex justify-between items-center flex-shrink-0 gap-6">
                    <li>
                        <Link className="flex items-center gap-2" href="/">
                            <span className="w-2">{currentChar}</span>
                            <Image
                                src="/images/logo-light.png"
                                alt="Logo"
                                width={60}
                                height={20}
                                priority
                            />
                        </Link>
                    </li>
                    <li>
                        <div className="hidden md:flex items-center gap-6">
                            {desktopLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-[var(--button-foreground)] hover:text-[var(--primary)] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
