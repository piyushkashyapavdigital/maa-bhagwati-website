"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function StickyCartBar() {
  const { cartCount, totalAmount } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const hiddenOn =
    pathname === "/cart" || pathname === "/checkout" || pathname === "/order-success";
  if (cartCount === 0 || hiddenOn) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="bg-[#6B1D1D] border-t border-[#4a1010] shadow-[0_-2px_12px_rgba(60,10,10,0.4)]">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-white/70 leading-tight truncate">
                {cartCount} {cartCount === 1 ? "item" : "items"} in cart
              </p>
              <p className="text-sm font-bold leading-tight">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/cart"
              className="text-[11px] font-bold px-3 py-2 rounded border border-white/30 hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              View Cart
            </Link>
            <button
              onClick={() => router.push("/checkout")}
              className="bg-[#FAF5EF] hover:bg-white text-[#4E1212] text-[11px] font-bold px-3 py-2 rounded transition-colors whitespace-nowrap active:scale-[0.97] cursor-pointer"
            >
              Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
