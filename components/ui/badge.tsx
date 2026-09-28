"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "gold" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#6B1D1D] text-white",
    secondary: "bg-[#FAF5EF] text-[#6B1D1D] border border-[#E8DED5]",
    gold: "bg-[#E5C07B] text-[#4E1212]",
    outline: "border border-[#6B1D1D] text-[#6B1D1D]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-2xs tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
