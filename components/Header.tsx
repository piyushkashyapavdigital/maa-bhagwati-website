"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

function LotusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path
        d="M32 8c3 8 8 13 14 15-6 3-10 8-14 16-4-8-8-13-14-16 6-2 11-7 14-15z"
        fill="#D4AF37"
        stroke="#6B1D1D"
        strokeWidth="1.5"
      />
      <path
        d="M14 22c-3 7-3 14 1 20 4-5 9-9 15-11-6-2-11-5-16-9z"
        fill="#B89327"
        stroke="#6B1D1D"
        strokeWidth="1.5"
      />
      <path
        d="M50 22c3 7 3 14-1 20-4-5-9-9-15-11 6-2 11-5 16-9z"
        fill="#B89327"
        stroke="#6B1D1D"
        strokeWidth="1.5"
      />
      <path d="M20 44c3 6 8 9 12 9s9-3 12-9" stroke="#6B1D1D" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  const { cartCount, setIsCartDrawerOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      searchQuery.trim()
        ? `/products?q=${encodeURIComponent(searchQuery.trim())}`
        : "/products"
    );
  };

  return (
    <header className="bg-[#FAF5EF] border-b border-[#E8DED5] py-2.5 px-4 lg:px-8 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-[#E5C07B]/60 flex items-center justify-center p-0.5 shadow-sm group-hover:scale-105 transition-transform">
            <LotusMark className="w-full h-full" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-bold text-[#6B1D1D] leading-none tracking-tight">
              Maa Bhagwati
            </h1>
            <p className="text-[13px] sm:text-sm font-semibold text-[#6B1D1D] leading-tight">
              Pooja Bhandar
            </p>
            <p className="text-[8px] text-[#948177] font-medium tracking-wide mt-px">
              Shuddh Samagri · Aapki Bhakti · Hamara Sankalp
            </p>
          </div>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-4"
        >
          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pooja samagri, havan samagri..."
              className="w-full bg-white border border-[#E8DED5] rounded-md py-2 pl-4 pr-10 text-xs text-[#2C1B17] placeholder:text-[#A8988D] focus:outline-none focus:border-[#6B1D1D]/40 focus:ring-1 focus:ring-[#6B1D1D]/10 transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 w-7 h-7 rounded-md bg-[#6B1D1D] hover:bg-[#4E1212] text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Search"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/orders"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-md hover:bg-white text-[#4E3B32] hover:text-[#6B1D1D] transition-colors"
            title="My Orders"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-white text-[#4E3B32] hover:text-[#6B1D1D] transition-colors cursor-pointer"
            title="Cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#6B1D1D] text-white text-[9px] font-bold flex items-center justify-center border border-[#FAF5EF]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden mt-2">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pooja samagri..."
            className="w-full bg-white border border-[#E8DED5] rounded-md py-2 pl-3 pr-9 text-xs text-[#2C1B17] placeholder:text-[#A8988D] focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 w-6 h-6 rounded bg-[#6B1D1D] text-white flex items-center justify-center cursor-pointer"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}
