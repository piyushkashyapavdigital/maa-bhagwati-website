"use client";

import React from "react";
import type { DBProduct } from "@/lib/db";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

/* ── Product visual — no gradient blobs ───────────────────── */

const PRODUCT_COLORS: Record<string, { bg: string; text: string }> = {
  "prod-1":  { bg: "bg-red-100", text: "text-red-700" },
  "prod-2":  { bg: "bg-orange-100", text: "text-orange-700" },
  "prod-3":  { bg: "bg-amber-100", text: "text-amber-800" },
  "prod-4":  { bg: "bg-amber-50", text: "text-amber-700" },
  "prod-5":  { bg: "bg-sky-100", text: "text-sky-700" },
  "prod-6":  { bg: "bg-stone-100", text: "text-stone-600" },
  "prod-7":  { bg: "bg-orange-100", text: "text-orange-700" },
  "prod-8":  { bg: "bg-green-100", text: "text-green-700" },
  "prod-9":  { bg: "bg-amber-100", text: "text-amber-700" },
  "prod-10": { bg: "bg-lime-100", text: "text-lime-800" },
  "prod-11": { bg: "bg-stone-100", text: "text-stone-600" },
  "prod-12": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "prod-13": { bg: "bg-green-100", text: "text-green-800" },
  "prod-14": { bg: "bg-amber-50", text: "text-amber-700" },
  "prod-15": { bg: "bg-slate-100", text: "text-slate-600" },
  "prod-16": { bg: "bg-orange-50", text: "text-orange-600" },
  "prod-17": { bg: "bg-stone-50", text: "text-stone-500" },
  "prod-18": { bg: "bg-amber-100", text: "text-amber-700" },
  "prod-19": { bg: "bg-orange-100", text: "text-orange-600" },
  "prod-20": { bg: "bg-yellow-100", text: "text-yellow-700" },
  "prod-21": { bg: "bg-pink-100", text: "text-pink-600" },
  "prod-22": { bg: "bg-rose-100", text: "text-rose-600" },
  "prod-23": { bg: "bg-pink-100", text: "text-pink-700" },
  "prod-24": { bg: "bg-gray-100", text: "text-gray-500" },
  "prod-25": { bg: "bg-amber-100", text: "text-amber-600" },
  "prod-26": { bg: "bg-yellow-100", text: "text-yellow-600" },
  "prod-27": { bg: "bg-amber-100", text: "text-amber-700" },
  "prod-28": { bg: "bg-red-100", text: "text-red-800" },
  "prod-29": { bg: "bg-rose-100", text: "text-rose-600" },
  "prod-30": { bg: "bg-green-100", text: "text-green-700" },
  "prod-31": { bg: "bg-lime-100", text: "text-lime-800" },
  "prod-32": { bg: "bg-amber-100", text: "text-amber-700" },
  "prod-33": { bg: "bg-green-100", text: "text-green-800" },
  "prod-34": { bg: "bg-rose-100", text: "text-rose-600" },
  "prod-35": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "prod-36": { bg: "bg-lime-100", text: "text-lime-700" },
  "prod-37": { bg: "bg-orange-100", text: "text-orange-500" },
  "prod-38": { bg: "bg-neutral-100", text: "text-neutral-800" },
  "prod-39": { bg: "bg-stone-100", text: "text-stone-400" },
  "prod-40": { bg: "bg-sky-100", text: "text-sky-600" },
  "prod-41": { bg: "bg-stone-100", text: "text-stone-600" },
  "prod-42": { bg: "bg-purple-100", text: "text-purple-800" },
  "prod-43": { bg: "bg-neutral-100", text: "text-neutral-500" },
  "prod-44": { bg: "bg-yellow-100", text: "text-yellow-700" },
  "prod-45": { bg: "bg-orange-100", text: "text-orange-700" },
  "prod-46": { bg: "bg-amber-50", text: "text-amber-800" },
  "prod-47": { bg: "bg-amber-100", text: "text-amber-700" },
  "prod-48": { bg: "bg-pink-100", text: "text-pink-700" },
  "prod-49": { bg: "bg-amber-100", text: "text-amber-800" },
  "prod-50": { bg: "bg-yellow-100", text: "text-yellow-800" },
  "prod-51": { bg: "bg-stone-100", text: "text-stone-600" },
  "prod-52": { bg: "bg-purple-100", text: "text-purple-600" },
  "prod-53": { bg: "bg-green-100", text: "text-green-800" },
  "prod-54": { bg: "bg-orange-100", text: "text-orange-700" },
  "prod-55": { bg: "bg-amber-100", text: "text-amber-600" },
  "prod-56": { bg: "bg-blue-100", text: "text-blue-800" },
  "prod-57": { bg: "bg-emerald-100", text: "text-emerald-800" },
  "prod-58": { bg: "bg-sky-100", text: "text-sky-700" },
  "prod-59": { bg: "bg-green-100", text: "text-green-900" },
  "prod-60": { bg: "bg-amber-50", text: "text-amber-900" },
  "prod-61": { bg: "bg-orange-50", text: "text-orange-900" },
  "prod-62": { bg: "bg-amber-100", text: "text-amber-800" },
  "prod-63": { bg: "bg-amber-100", text: "text-amber-800" },
  "prod-64": { bg: "bg-stone-100", text: "text-stone-600" },
  "prod-65": { bg: "bg-sky-100", text: "text-sky-700" },
  "prod-66": { bg: "bg-amber-100", text: "text-amber-700" },
  "prod-67": { bg: "bg-stone-100", text: "text-stone-500" },
  "prod-68": { bg: "bg-blue-100", text: "text-blue-500" },
  "prod-69": { bg: "bg-amber-100", text: "text-amber-700" },
  "prod-70": { bg: "bg-lime-100", text: "text-lime-800" },
  "prod-71": { bg: "bg-amber-50", text: "text-amber-900" },
  "prod-72": { bg: "bg-rose-50", text: "text-rose-500" },
};

const DEFAULT_COLOR = { bg: "bg-stone-100", text: "text-stone-600" };

export function ProductArt({
  product,
  className,
}: {
  product: DBProduct;
  className?: string;
}) {
  const colors = PRODUCT_COLORS[product.id] ?? DEFAULT_COLOR;

  if (product.image) {
    return (
      <div className={cn("relative overflow-hidden bg-white", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden flex flex-col items-center justify-center",
        colors.bg,
        className
      )}
    >
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzIiBoZWlnaHQ9IjMiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')]" />
      <span className={cn("text-3xl select-none relative z-10", colors.text)}>
        {product.emoji}
      </span>
    </div>
  );
}

/* ── Stepper ──────────────────────────────────────────────── */

function Stepper({
  qty,
  onInc,
  onDec,
  compact,
}: {
  qty: number;
  onInc: () => void;
  onDec: () => void;
  compact?: boolean;
}) {
  const h = compact ? "h-7" : "h-8";
  const w = compact ? "w-7" : "w-8";

  if (qty === 0) {
    return (
      <div
        className={cn(
          "w-full flex items-center justify-between rounded-md border border-[#E0CDBB] bg-[#FAF5EF] overflow-hidden opacity-70",
          h
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onInc();
          }}
          className={cn(
            "h-full flex items-center justify-center font-bold text-[#948177] hover:bg-[#F0E6D8] active:scale-90 transition-all cursor-pointer",
            w
          )}
          aria-label="Increase quantity"
        >
          −
        </button>
        <span className={cn("text-center font-bold tabular-nums text-[#948177]", compact ? "text-[10px]" : "text-xs")}>
          0
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onInc();
          }}
          className={cn(
            "h-full flex items-center justify-center font-bold text-[#6B1D1D] hover:bg-[#F0E6D8] active:scale-90 transition-all cursor-pointer",
            w
          )}
          aria-label="Add to cart"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between rounded-md border border-[#6B1D1D] bg-white overflow-hidden",
        h
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDec();
        }}
        className={cn(
          "h-full flex items-center justify-center font-bold text-[#6B1D1D] hover:bg-[#FAF5EF] active:scale-90 transition-all cursor-pointer",
          w
        )}
        aria-label="Decrease"
      >
        −
      </button>
      <span className={cn("text-center font-bold tabular-nums text-[#6B1D1D]", compact ? "text-[10px]" : "text-xs")}>
        {qty}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onInc();
        }}
        className={cn(
          "h-full flex items-center justify-center font-bold text-[#6B1D1D] hover:bg-[#FAF5EF] active:scale-90 transition-all cursor-pointer",
          w
        )}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

/* ── Grid card ────────────────────────────────────────────── */

export function ProductGridCard({ product }: { product: DBProduct }) {
  const { getQuantity, setQuantity } = useCart();
  const qty = getQuantity(product.id);

  return (
    <div
      className={cn(
        "bg-white rounded-lg border p-2 flex flex-col transition-shadow",
        qty > 0
          ? "border-[#6B1D1D]/40 shadow-[0_0_0_1px_rgba(107,29,29,0.1)]"
          : "border-[#E8DED5] hover:shadow-sm"
      )}
    >
      <ProductArt product={product} className="w-full aspect-square rounded mb-2" />

      <h3 className="text-[11px] font-semibold text-[#2C1B17] leading-tight truncate">
        {product.name}
      </h3>
      <p className="text-[9px] text-[#948177] truncate mt-px">{product.unit}</p>

      <p className="text-xs font-bold text-[#6B1D1D] mt-auto pt-1">
        ₹{product.price}
      </p>

      <div className="mt-1.5">
        <Stepper
          qty={qty}
          onInc={() => setQuantity(product, qty + 1)}
          onDec={() => setQuantity(product, qty - 1)}
          compact
        />
      </div>
    </div>
  );
}

/* ── List card ────────────────────────────────────────────── */

export function ProductListCard({ product }: { product: DBProduct }) {
  const { getQuantity, setQuantity } = useCart();
  const qty = getQuantity(product.id);

  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-white rounded-lg border p-2.5 transition-shadow",
        qty > 0
          ? "border-[#6B1D1D]/40 shadow-[0_0_0_1px_rgba(107,29,29,0.1)]"
          : "border-[#E8DED5]"
      )}
    >
      <ProductArt product={product} className="w-14 h-14 rounded shrink-0" />

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#2C1B17] leading-tight truncate">
          {product.name}
        </h3>
        <p className="text-[10px] text-[#948177] truncate">{product.unit}</p>
        <p className="text-sm font-bold text-[#6B1D1D] mt-0.5">₹{product.price}</p>
      </div>

      <div className="w-28 shrink-0">
        <Stepper
          qty={qty}
          onInc={() => setQuantity(product, qty + 1)}
          onDec={() => setQuantity(product, qty - 1)}
        />
      </div>
    </div>
  );
}
