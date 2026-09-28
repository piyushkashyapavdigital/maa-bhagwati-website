"use client";

import React from "react";
import Link from "next/link";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/shop/HeroSlider";
import CategorySection from "@/components/shop/CategorySection";
import PoojaKitsSection from "@/components/shop/PoojaKitsSection";
import TrustStrip from "@/components/shop/TrustStrip";
import ProductGrid from "@/components/shop/ProductGrid";
import { ProductGridCard } from "@/components/shop/ProductCard";
import { useCatalog } from "@/lib/useCatalog";
import { ProductGridSkeleton } from "@/components/shop/Skeletons";

export default function Home() {
  const catalog = useCatalog();

  const categories = catalog?.categories ?? [];
  const products = catalog?.products ?? [];
  const popular = products.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF] overflow-x-hidden pb-16">
      <TopAnnouncementBar />
      <Header />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-3 space-y-6">
        {/* Hero */}
        <HeroSlider />

        {/* Categories */}
        {catalog === null ? (
          <div aria-hidden>
            <div className="skeleton h-6 w-48 rounded" />
            <div className="skeleton h-3 w-64 rounded mt-1.5 mb-4" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-[#E8DED5] overflow-hidden">
                  <div className="skeleton w-full aspect-[4/3] rounded-none" />
                  <div className="px-3 py-2.5">
                    <div className="skeleton h-3.5 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <CategorySection categories={categories} />
        )}

        {/* Complete Pooja Kits */}
        <PoojaKitsSection />

        {/* Trust strip */}
        <TrustStrip />

        {/* Popular products */}
        {popular.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#2C1B17]">
                  Popular Products
                </h2>
                <p className="text-[10px] text-[#948177]">
                  Bhakton ki pasand
                </p>
              </div>
              <Link
                href="/products"
                className="text-[10px] font-semibold text-[#6B1D1D] border border-[#6B1D1D]/30 hover:bg-[#6B1D1D] hover:text-white px-3 py-1 rounded transition-all"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {popular.map((p) => (
                <ProductGridCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Full shop */}
        <section id="shop" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2C1B17]">
                Shop Samagri
              </h2>
              <p className="text-[10px] text-[#948177]">
                Select items & quantities — sab ek hi cart mein
              </p>
            </div>
            <Link
              href="/products"
              className="text-[10px] font-semibold text-[#6B1D1D] border border-[#6B1D1D]/30 hover:bg-[#6B1D1D] hover:text-white px-3 py-1 rounded transition-all"
            >
              View More &gt;&gt;
            </Link>
          </div>

          {catalog === null ? (
            <ProductGridSkeleton count={5} />
          ) : (
            <ProductGrid
              categories={categories}
              products={products.slice(0, 8)}
            />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
