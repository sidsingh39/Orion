"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";

export function Navbar({
  onHistoryClick,
  onLogout,
}: {
  onHistoryClick?: () => void;
  user?: string | null;
  onLogout?: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = ["Home", "Upload", "Quiz", "Profile"];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[90px] px-[60px] flex items-center bg-transparent">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <button
            onClick={onHistoryClick}
            className="flex flex-col items-start leading-none"
          >
            <span className="text-[2.15rem] font-bold tracking-[0.16em] text-[#b68c24]">
              ORION
            </span>

            <span className="text-[9.5px] uppercase tracking-[0.32em] text-[var(--foreground-soft)] mt-1">
              Academic Assistant
            </span>
          </button>
        </div>

        {/* Right Cluster */}
        <div className="hidden md:flex items-center gap-12">
          {/* Navigation */}
          <div className="flex items-center gap-11 text-[15px] font-normal">
            {navItems.map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="
                  relative
                  text-[var(--foreground-soft)]
                  tracking-[0.06em]
                  transition-colors duration-300
                  hover:text-[#b68c24]
                  after:absolute
                  after:left-0
                  after:-bottom-1
                  after:h-[2px]
                  after:w-0
                  after:bg-[#b68c24]
                  after:transition-all
                  after:duration-300
                  hover:after:w-full
                "
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Fixed Right Controls */}
          <div className="flex items-center gap-5 pl-5 border-l border-[rgba(182,140,36,0.08)]">
            <button
              onClick={onLogout}
              className="flex items-center items-center
leading-none gap-1 text-[11px] uppercase tracking-[0.22em] text-red-500/90 hover:text-red-500 transition-colors"
            >
              <LogOut size={13} />
              Log Out
            </button>

            <ThemeToggle />
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[var(--foreground)]"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[var(--card-bg)] backdrop-blur-xl border-b border-[var(--card-border)] md:hidden">
          <div className="flex flex-col p-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium py-2 border-b border-[var(--card-border)]"
              >
                {item}
              </Link>
            ))}

            <button
              onClick={onLogout}
              className="text-red-500 text-xs uppercase tracking-[0.16em] pt-3"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
