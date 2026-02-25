"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";

export function Navbar({
    onHistoryClick,
    user,
    onLogout
}: {
    onHistoryClick?: () => void,
    user?: string | null,
    onLogout?: () => void
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = ["Home", "Upload", "Quiz", "Profile"];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-12 md:py-6 w-full">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo & Mobile History Toggle */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onHistoryClick}
                        className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] hover:opacity-80 transition-opacity"
                    >
                        ORION
                    </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
                    {navItems.map((item) => (
                        <Link
                            key={item}
                            href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                            className="text-slate-400 hover:text-cyan-400 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                        >
                            {item}
                        </Link>
                    ))}
                    {user && (
                        <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                            <span className="text-slate-500 text-xs truncate max-w-[120px]">{user}</span>
                            <button
                                onClick={onLogout}
                                className="text-red-400/70 hover:text-red-400 transition-colors text-xs uppercase tracking-widest"
                            >
                                <LogOut size={14} className="inline mr-1" /> Log Out
                            </button>
                        </div>
                    )}
                    <ThemeToggle />
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-slate-300 hover:text-white transition-colors"
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 animate-in slide-in-from-top-4 duration-300 md:hidden">
                    <div className="flex flex-col p-6 space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item}
                                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-lg font-medium text-slate-300 hover:text-cyan-400 transition-colors py-2 border-b border-white/5 last:border-0"
                            >
                                {item}
                            </Link>
                        ))}
                        {user && (
                            <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <UserIcon size={16} />
                                    <span className="text-xs truncate max-w-[150px]">{user}</span>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="text-red-400 text-xs uppercase tracking-widest font-bold"
                                >
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
