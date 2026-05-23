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

  const navItems = [
    "Home",
    "Upload",
    "Notices",
    "Quiz",
    "Profile",
  ];

  return (
    <>
      {/* Navbar */}

      <nav
        className="
        fixed
        top-0
        left-0
        right-0
        z-50
        h-[90px]
        px-6
        lg:px-[60px]
        flex
        items-center
        backdrop-blur-md
        bg-[rgba(15,17,21,0.72)]
        border-b
        border-[rgba(182,140,36,0.08)]
        "
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

          {/* Logo */}

          <button
            onClick={onHistoryClick}
            className="flex flex-col items-start leading-none"
          >
            <span className="text-[2.15rem] font-bold tracking-[0.16em] text-[#b68c24]">
              ORION
            </span>

            <span className="text-[9px] uppercase tracking-[0.32em] text-[var(--foreground-soft)] mt-1">
              Academic Assistant
            </span>
          </button>

          {/* Desktop Navigation */}

          <div className="hidden md:flex items-center gap-12">

            <div className="flex items-center gap-11 text-[15px]">

              {navItems.map((item) => (

                <Link
                  key={item}
                  href={
                    item === "Home"
                      ? "/"
                      : `/${item.toLowerCase()}`
                  }
                  className="
                  relative
                  text-[var(--foreground-soft)]
                  transition-all
                  duration-300
                  hover:text-[#d4af37]

                  after:absolute
                  after:left-0
                  after:-bottom-[6px]
                  after:h-[2px]
                  after:w-0
                  after:bg-[#d4af37]
                  after:transition-all
                  after:duration-300
                  hover:after:w-full
                  "
                >
                  {item}
                </Link>

              ))}

            </div>

            <div className="flex items-center gap-5 pl-6 border-l border-[rgba(182,140,36,0.08)]">

              <button
                onClick={onLogout}
                className="
                flex
                items-center
                gap-2
                text-red-500/90
                hover:text-red-500
                text-xs
                uppercase
                tracking-[0.18em]
                transition-colors
                "
              >
                <LogOut size={14}/>
                Log Out
              </button>

              <ThemeToggle />

            </div>

          </div>

          {/* Mobile Menu Button */}

          <div className="flex md:hidden items-center gap-4">

            <ThemeToggle />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[var(--foreground)]"
            >
              {isMenuOpen
                ? <X size={28}/>
                : <Menu size={28}/>
              }
            </button>

          </div>

        </div>

        {/* Mobile Menu */}

        {isMenuOpen && (

          <div
            className="
            absolute
            top-full
            left-0
            right-0
            bg-[var(--card-bg)]
            backdrop-blur-xl
            border-b
            border-[var(--card-border)]
            md:hidden
            "
          >
            <div className="flex flex-col p-6 gap-4">

              {navItems.map((item) => (

                <Link
                  key={item}
                  href={
                    item === "Home"
                    ? "/"
                    : `/${item.toLowerCase()}`
                  }
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="
                  py-2
                  text-lg
                  border-b
                  border-[var(--card-border)]
                  "
                >
                  {item}
                </Link>

              ))}

              <button
                onClick={onLogout}
                className="
                text-red-500
                text-xs
                uppercase
                tracking-[0.18em]
                pt-3
                "
              >
                Log Out
              </button>

            </div>

          </div>

        )}

      </nav>

      {/* Global Spacer */}

      <div className="h-[90px]" />
    </>
  );
}