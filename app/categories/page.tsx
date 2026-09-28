"use client";

import React from "react";
import Link from "next/link";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCatalog } from "@/lib/useCatalog";

export default function CategoriesPage() {
  const catalog = useCatalog();
  const categories = catalog?.categories ?? [];

  const countFor = (categoryId: string) =>
    (catalog?.products ?? []).filter((p) => p.categoryId === categoryId).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF] pb-16">
      <TopAnnouncementBar />
      <Header />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-2 text-xs text-[#7A6458] mb-4">
          <Link href="/" className="hover:text-[#6B1D1D]">Home</Link>
          <span>/</span>
          <span className="font-bold text-[#6B1D1D]">Categories</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1B17] mb-2 tracking-tight">
          Shop by Category
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6458] mb-8">
          One shared cart across all categories — pick items from anywhere in the store.
        </p>

        {catalog === null ? (
          <div className="py-20 text-center text-sm font-semibold text-[#7A6458]">
            Loading categories…
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group bg-white rounded-2xl border border-[#E8DED5] p-5 hover:shadow-md hover:border-[#6B1D1D]/40 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF5EF] border border-[#E5C07B] flex items-center justify-center shrink-0 text-2xl">
                    🪔
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-[#2C1B17] group-hover:text-[#6B1D1D] transition-colors truncate">
                      {cat.name}
                    </h2>
                    <p className="text-[11px] text-[#8C766B] font-semibold">
                      {countFor(cat.id)} items
                    </p>
                  </div>
                  <span className="ml-auto text-[#6B1D1D] font-bold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
