"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/shop/ProductGrid";
import { useCatalog } from "@/lib/useCatalog";
import { ProductGridSkeleton } from "@/components/shop/Skeletons";

export default function ProductsPage() {
  const catalog = useCatalog();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) setSearchQuery(q);
    }
  }, []);

  const categories = (catalog?.categories ?? []).filter((c) => !c.comingSoon);
  const q = searchQuery.trim().toLowerCase();

  const filtered = (catalog?.products ?? []).filter((p) =>
    q ? p.name.toLowerCase().includes(q) : true
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF] pb-20">
      <TopAnnouncementBar />
      <Header />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-4 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#7A6458] mb-3 font-medium">
          <Link href="/" className="hover:text-[#6B1D1D]">Home</Link>
          <span>›</span>
          <span className="text-[#6B1D1D] font-bold">Pooja Samagri</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6B1D1D] tracking-tight">
              Pooja Samagri
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6458] mt-1">
              Har Pooja ke liye aavashyak samagri ek hi jagah
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items…"
              className="w-full bg-white border border-[#E8DED5] rounded-full py-2 pl-4 pr-9 text-xs text-[#2C1B17] placeholder:text-[#948177] focus:outline-none focus:border-[#6B1D1D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#948177] hover:text-[#6B1D1D] text-xs cursor-pointer"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {catalog === null ? (
          <ProductGridSkeleton count={10} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DED5] p-12 text-center">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="text-sm font-bold text-[#2C1B17]">
              No items found{q ? ` for "${searchQuery}"` : ""}
            </p>
            <p className="text-xs text-[#7A6458] mt-1">Try a different search.</p>
          </div>
        ) : (
          <ProductGrid categories={categories} products={filtered} />
        )}
      </main>

      <Footer />
    </div>
  );
}
