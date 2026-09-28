"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      default:
        "bg-[#6B1D1D] text-white hover:bg-[#4E1212] focus:ring-[#6B1D1D] shadow-xs",
      outline:
        "bg-white text-[#6B1D1D] border border-[#E8DED5] hover:bg-[#FAF5EF] hover:border-[#6B1D1D]",
      secondary:
        "bg-[#EFE6DC] text-[#4E3B32] hover:bg-[#E4D8CC]",
      ghost:
        "text-[#2C1B17] hover:bg-[#FAF5EF] hover:text-[#6B1D1D]",
      gold:
        "bg-gradient-to-r from-[#D4AF37] to-[#B89327] text-white hover:brightness-110 shadow-xs",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 min-h-[32px]",
      md: "text-xs sm:text-sm px-4 py-2 min-h-[40px]",
      lg: "text-sm sm:text-base px-6 py-3 min-h-[48px]",
      icon: "w-9 h-9 p-0 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
