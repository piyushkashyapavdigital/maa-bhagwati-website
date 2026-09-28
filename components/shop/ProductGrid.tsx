"use client";

import React from "react";
import type { DBCategory, DBProduct } from "@/lib/db";
import { ProductGridCard } from "./ProductCard";

interface ProductGridProps {
  categories: DBCategory[];
  products: DBProduct[];
}

/**
 * Category section grid: white compact cards, 5-up on wide
 * screens exactly like the design reference.
 */
export default function ProductGrid({ categories, products }: ProductGridProps) {
  const sections = categories
    .map((c) => ({
      category: c,
      items: products.filter((p) => p.categoryId === c.id),
    }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="space-y-8">
      {sections.map(({ category, items }) => (
        <section key={category.id}>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((p) => (
              <ProductGridCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}

      {sections.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E8DED5] p-12 text-center">
          <span className="text-4xl block mb-2">🪔</span>
          <p className="text-sm font-bold text-[#2C1B17]">No products yet</p>
          <p className="text-xs text-[#7A6458] mt-1">
            Samagri will appear here once added.
          </p>
        </div>
      )}
    </div>
  );
}
