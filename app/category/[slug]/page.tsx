"use client";

import React, { use, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProductGridCard } from "@/components/shop/ProductCard";
import { useCatalog } from "@/lib/useCatalog";
import { ProductGridSkeleton } from "@/components/shop/Skeletons";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Category hero banner images (uploaded by the client)
const BANNER_IMAGES: Record<string, string> = {
  "mukhya-pooja-samagri": "/images/BANNER2.png",
  "rudrabhishek-samagri": "/images/BANNER3.png",
  "havan-samagri": "/images/BANNER4.png",
  "pooja-bartan-aavashyak-saman": "/images/BANNER5.png",
};

const SUBTITLES: Record<string, string> = {
  "mukhya-pooja-samagri": "Har Pooja ke liye aavashyak samagri ek hi jagah",
  "rudrabhishek-samagri": "Rudrabhishek ke liye zaroori samagri ek hi jagah",
  "havan-samagri": "Havan ke liye zaroori samagri",
  "pooja-bartan-aavashyak-saman": "Puja ke liye zaroori bartan aur samaan",
};

export default function CategorySlugPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const catalog = useCatalog();

  const categories = catalog?.categories ?? [];
  const category = categories.find((c) => c.slug === resolvedParams.slug);

  if (catalog !== null && !category) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF5EF]">
        <TopAnnouncementBar />
        <Header />
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-20 w-full text-center">
          <h1 className="text-lg font-bold text-[#2C1B17] mb-2">Category not found</h1>
          <Link
            href="/products"
            className="inline-block mt-2 bg-[#6B1D1D] hover:bg-[#4E1212] text-white px-5 py-2 rounded text-xs font-semibold"
          >
            Browse all samagri →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const products = category
    ? (catalog?.products ?? []).filter((p) => p.categoryId === category.id)
    : [];

  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name">("default");
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF] pb-16">
      <TopAnnouncementBar />
      <Header />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-3 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[10px] text-[#948177] mb-2">
          <Link href="/" className="hover:text-[#6B1D1D]">Home</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-[#6B1D1D]">Pooja Samagri</Link>
          <span>›</span>
          <span className="text-[#6B1D1D] font-semibold">{category?.name ?? "…"}</span>
        </div>

        {/* Hero Banner — BANNER2 photo on the right, like the design mock */}
        <div className="relative overflow-hidden rounded-lg border border-[#E8DED5] bg-gradient-to-r from-[#FDF8EE] via-[#FBF1DF] to-[#F6E4C4] mb-5">
          <div className="flex flex-col-reverse md:flex-row md:items-stretch">
            {/* Text side */}
            <div className="flex-1 px-5 sm:px-8 pt-4 pb-5 md:py-8 relative z-10">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#6B1D1D] leading-tight">
                {category?.name ?? "Loading…"}
                {category?.comingSoon && (
                  <span className="ml-2 align-middle bg-[#6B1D1D]/10 text-[#6B1D1D] text-[9px] font-semibold px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                )}
              </h1>
              <p className="text-[13px] text-[#5C4A3D] mt-1.5">
                {SUBTITLES[resolvedParams.slug] ?? "Har Pooja ke liye aavashyak samagri ek hi jagah"}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { icon: "🕉", label: "Shuddh Samagri" },
                  { icon: "🚚", label: "Ghar Tak Delivery" },
                  { icon: "🤝", label: "Vishwas ka Saath" },
                ].map((f) => (
                  <span
                    key={f.label}
                    className="flex items-center gap-2 bg-white/80 border border-[#E8DED5] rounded-full pl-1 pr-3 py-1"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#6B1D1D] text-white flex items-center justify-center text-[11px]">
                      {f.icon}
                    </span>
                    <span className="text-[11px] font-semibold text-[#2C1B17]">{f.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Image side */}
            <div className="relative h-40 sm:h-48 md:h-auto md:w-[38%] shrink-0">
              <Image
                src={BANNER_IMAGES[resolvedParams.slug] ?? "/images/BANNER2.png"}
                alt={category?.name ?? "Pooja samagri"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40rem"
                className="object-cover object-center"
              />
              {/* soft blend into the cream banner on desktop */}
              <div className="hidden md:block absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FBF1DF] to-transparent" />
            </div>
          </div>
        </div>

        {/* Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar */}
          <aside className="w-full lg:w-56 shrink-0 space-y-3">
            {/* Categories */}
            <div className="bg-white rounded-lg border border-[#E8DED5] p-3">
              <h3 className="text-[11px] font-bold text-[#2C1B17] mb-2 uppercase tracking-wide">Categories</h3>
              <div className="space-y-px">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={cn(
                      "flex items-center justify-between px-2.5 py-2 rounded text-[11px] font-medium transition-colors",
                      cat.id === category?.id
                        ? "bg-[#6B1D1D] text-white"
                        : "text-[#2C1B17] hover:bg-[#FAF5EF]"
                    )}
                  >
                    <span>{cat.name}</span>
                    {cat.comingSoon && (
                      <span className={cn(
                        "text-[8px] font-medium",
                        cat.id === category?.id ? "text-white/60" : "text-[#948177]"
                      )}>Soon</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-lg border border-[#E8DED5] p-3">
              <p className="text-[11px] font-bold text-[#2C1B17] mb-1">Need Help?</p>
              <p className="text-[10px] text-[#948177]">Call us on</p>
              <a
                href="tel:7986820055"
                className="text-xs font-bold text-[#6B1D1D] mt-0.5 hover:underline"
              >
                79868-20055
              </a>
              <p className="text-[9px] text-[#948177]">(10 AM - 8 PM)</p>
            </div>

            {/* Bulk Order */}
            <Link
              href="/contact"
              className="block bg-white rounded-lg border border-[#E8DED5] p-3 hover:border-[#6B1D1D]/40 hover:shadow-sm transition-all"
            >
              <p className="text-[11px] font-bold text-[#2C1B17] mb-0.5">Bulk Order?</p>
              <p className="text-[10px] text-[#948177]">Contact us for special pricing</p>
            </Link>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#2C1B17]">
                {category?.name ?? "Products"}
                {products.length > 0 && (
                  <span className="ml-1.5 text-[11px] font-medium text-[#948177]">
                    ({products.length} items)
                  </span>
                )}
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-[11px] font-medium text-[#2C1B17] bg-white border border-[#E8DED5] rounded px-2 py-1 focus:outline-none focus:border-[#6B1D1D]/40"
              >
                <option value="default">Sort by: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {catalog === null ? (
              <ProductGridSkeleton count={10} />
            ) : category?.comingSoon ? (
              <div className="bg-white rounded-lg border border-[#E8DED5] p-10 text-center">
                <p className="text-sm font-bold text-[#2C1B17]">
                  {category.name} — coming soon!
                </p>
                <p className="text-[11px] text-[#948177] mt-1">
                  Meanwhile, shop from our available samagri.
                </p>
                <Link
                  href="/products"
                  className="inline-block mt-3 bg-[#6B1D1D] hover:bg-[#4E1212] text-white px-5 py-2 rounded text-xs font-semibold"
                >
                  Shop Available Samagri →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {sortedProducts.map((p) => (
                  <ProductGridCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
