"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { DBCategory } from "@/lib/db";

// Uploaded banner photos per category (fallback: dark maroon tile)
const CATEGORY_BANNERS: Record<string, string> = {
  "cat-1": "/images/BANNER2.png", // Mukhya Pooja Samagri
  "cat-2": "/images/BANNER3.png", // Rudrabhishek Samagri
  "cat-3": "/images/BANNER4.png", // Havan Samagri
  "cat-4": "/images/BANNER5.png", // Pooja Bartan & Aavashyak Samaan
};

const CATEGORY_ICONS: Record<string, string> = {
  "cat-1": "🪔",
  "cat-2": "🕉️",
  "cat-3": "🔥",
  "cat-4": "🫖",
};

export default function CategorySection({
  categories,
}: {
  categories: DBCategory[];
}) {
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-bold text-[#2C1B17] tracking-tight">
        Shop by Category
      </h2>
      <p className="text-xs text-[#7A6458] mt-0.5 mb-4">
        Sabhi Pooja aur Dharmik Samagri ek hi jagah
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((cat) => {
          const banner = CATEGORY_BANNERS[cat.id];
          const inner = (
            <div className="bg-white rounded-lg border border-[#E8DED5] overflow-hidden hover:shadow-md transition-shadow">
              {/* Image area — banner photo or coming-soon tile */}
              <div className="relative aspect-[4/3] bg-[#4E1212]">
                {banner ? (
                  <Image
                    src={banner}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl select-none opacity-80">
                      {CATEGORY_ICONS[cat.id] ?? "🪔"}
                    </span>
                  </div>
                )}
                {cat.comingSoon && (
                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-semibold px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
              {/* Label */}
              <div className="px-3 py-2.5">
                <p className="text-[13px] font-bold leading-tight text-[#2C1B17]">
                  {cat.name}
                </p>
              </div>
            </div>
          );

          return cat.comingSoon ? (
            <div key={cat.id} className="opacity-60 cursor-not-allowed">
              {inner}
            </div>
          ) : (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="block">
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
