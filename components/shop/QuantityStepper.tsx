"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
  className?: string;
  stopPropagation?: boolean;
}

/**
 * The PRIMARY shopping interaction (Blinkit-style):
 * quantity 0 → shows an "ADD" pill;
 * quantity ≥ 1 → shows [−] qty [+].
 */
export default function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
  className,
  stopPropagation = true,
}: QuantityStepperProps) {
  const handle = (e: React.MouseEvent, fn: () => void) => {
    if (stopPropagation) e.stopPropagation();
    e.preventDefault();
    fn();
  };

  const h = size === "sm" ? "h-8" : "h-9";
  const w = size === "sm" ? "w-8" : "w-9";
  const text = size === "sm" ? "text-xs" : "text-sm";

  if (quantity === 0) {
    return (
      <button
        onClick={(e) => handle(e, onIncrement)}
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-xl border-2 border-[#6B1D1D] bg-white font-extrabold text-[#6B1D1D] transition-all hover:bg-[#6B1D1D] hover:text-white active:scale-95 cursor-pointer shadow-2xs",
          size === "sm" ? "h-8 px-3.5 text-xs" : "h-9 px-5 text-sm",
          className
        )}
        aria-label={`Add to cart`}
      >
        ADD
      </button>
    );

  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border-2 border-[#6B1D1D] bg-[#6B1D1D] text-white overflow-hidden shadow-2xs",
        h,
        className
      )}
    >
      <button
        onClick={(e) => handle(e, onDecrement)}
        className={cn(
          "flex items-center justify-center font-bold transition-colors hover:bg-[#4E1212] active:scale-90 cursor-pointer",
          w,
          text
        )}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={cn(
          "min-w-6 text-center font-extrabold tabular-nums px-0.5",
          text
        )}
      >
        {quantity}
      </span>
      <button
        onClick={(e) => handle(e, onIncrement)}
        className={cn(
          "flex items-center justify-center font-bold transition-colors hover:bg-[#4E1212] active:scale-90 cursor-pointer",
          w,
          text
        )}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
