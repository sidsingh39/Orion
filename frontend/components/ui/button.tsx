import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * ORION button system
 * Premium restrained interaction language
 */
const buttonVariants = cva(
    [
        "inline-flex items-center justify-center whitespace-nowrap",
        "rounded-xl text-sm font-medium",
        "transition-all duration-300",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-[rgba(182,140,36,0.28)]",
        "focus-visible:ring-offset-2",
        "ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
    ].join(" "),
    {
        variants: {
            variant: {
                default:
                    "bg-[#b68c24] text-black hover:bg-[#d4af37] shadow-none",

                destructive:
                    "bg-red-600 text-white hover:bg-red-500",

                outline:
                    "border border-[rgba(182,140,36,0.18)] bg-transparent hover:bg-[rgba(182,140,36,0.06)] text-foreground",

                secondary:
                    "bg-[rgba(182,140,36,0.08)] text-[#8a6a22] dark:text-[#d4af37] hover:bg-[rgba(182,140,36,0.12)]",

                ghost:
                    "hover:bg-[rgba(182,140,36,0.05)] text-foreground",

                link:
                    "text-[#8a6a22] dark:text-[#d4af37] underline-offset-4 hover:underline",
            },

            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3 rounded-lg",
                lg: "h-11 px-8 rounded-xl",
                icon: "h-10 w-10 rounded-xl",
            },
        },

        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

/**
 * Shared ORION button component
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };