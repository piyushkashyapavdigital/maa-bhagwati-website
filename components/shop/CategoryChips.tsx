"use client";

import React from "react";
import Link from "next/link";
import type { DBCategory } from "@/lib/db";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  categories: DBCategory[];
  activeSlug?: string;
  onSelect?: (slug: string | null) => void;
}

/** Horizontal scrollable category chips (Blinkit-style). */
export default function CategoryChips({
  categories,
  activeSlug,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {onSelect ? (
        <>
          <button
            onClick={() => onSelect(null)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
              !activeSlug
                ? "bg-[#6B1D1D] text-white border-[#6B1D1D] shadow-sm"
                : "bg-white text-[#4E3B32] border-[#E8DED5] hover:border-[#6B1D1D] hover:text-[#6B1D1D]"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.slug)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border",
                activeSlug === cat.slug
                  ? "bg-[#6B1D1D] text-white border-[#6B1D1D] shadow-sm"
                  : "bg-white text-[#4E3B32] border-[#E8DED5] hover:border-[#6B1D1D] hover:text-[#6B1D1D]"
              )}
            >
              {cat.name}
            </button>
          ))}
        </>
      ) : (
        <>
          <Link
            href="/products"
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
              !activeSlug
                ? "bg-[#6B1D1D] text-white border-[#6B1D1D]"
                : "bg-white text-[#4E3B32] border-[#E8DED5] hover:border-[#6B1D1D] hover:text-[#6B1D1D]"
            )}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                activeSlug === cat.slug
                  ? "bg-[#6B1D1D] text-white border-[#6B1D1D]"
                  : "bg-white text-[#4E3B32] border-[#E8DED5] hover:border-[#6B1D1D] hover:text-[#6B1D1D]"
              )}
            >
              {cat.name}
            </Link>
          ))}
        </>
      )}
    </div>
  );
}
