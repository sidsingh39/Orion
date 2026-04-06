"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

/**
 * ORION scroll container
 * Subtle premium scrollbar treatment
 */
const ScrollArea = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
    >
        <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
            {children}
        </ScrollAreaPrimitive.Viewport>

        <ScrollBar />

        <ScrollAreaPrimitive.Corner className="bg-transparent" />
    </ScrollAreaPrimitive.Root>
));

ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

/**
 * ORION scrollbar
 * Thin, elegant, visually quiet
 */
const ScrollBar = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={cn(
            "flex touch-none select-none transition-all duration-300",
            orientation === "vertical" &&
                "h-full w-2.5 border-l border-l-transparent p-[2px]",
            orientation === "horizontal" &&
                "h-2.5 flex-col border-t border-t-transparent p-[2px]",
            className
        )}
        {...props}
    >
        <ScrollAreaPrimitive.ScrollAreaThumb
            className="
                relative flex-1 rounded-full
                bg-[rgba(182,140,36,0.18)]
                hover:bg-[rgba(182,140,36,0.28)]
                dark:bg-[rgba(212,175,55,0.18)]
                dark:hover:bg-[rgba(212,175,55,0.28)]
            "
        />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
));

ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };