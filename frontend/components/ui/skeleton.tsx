import { cn } from "@/lib/utils";

/**
 * ORION skeleton loader
 * Soft premium placeholder surface
 */
function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                [
                    "animate-pulse rounded-xl",
                    "bg-[rgba(182,140,36,0.08)]",
                    "dark:bg-[rgba(212,175,55,0.08)]",
                ].join(" "),
                className
            )}
            {...props}
        />
    );
}

export { Skeleton };