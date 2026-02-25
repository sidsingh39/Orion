"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar({
    onHistoryClick,
    user,
    onLogout
}: {
    onHistoryClick?: () => void,
    user?: string | null,
    onLogout?: () => void
}) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full pointer-events-none">
            <div className="pointer-events-auto">
                <button
                    onClick={onHistoryClick}
                    className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] hover:opacity-80 transition-opacity"
                >
                    ORION
                </button>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide pointer-events-auto">
                {["Home", "Upload", "Quiz", "Profile"].map((item) => (
                    <Link
                        key={item}
                        href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                        className="
                            text-slate-400 hover:text-cyan-400
                            transition-colors duration-300
                            hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]
                        "
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
                            Log Out
                        </button>
                    </div>
                )}
                <ThemeToggle />
            </div>
        </nav>
    );
}
