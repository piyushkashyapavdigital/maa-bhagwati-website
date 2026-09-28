"use client";

import React from "react";

/**
 * Skeleton loaders that mirror the real shop components' shapes,
 * shown while /api/catalog is in flight. Shimmer class from
 * globals.css (.skeleton).
 */

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[#E8DED5] p-2 flex flex-col">
      <div className="skeleton w-full aspect-square rounded mb-2" />
      <div className="skeleton h-2.5 w-3/4 rounded" />
      <div className="skeleton h-2 w-1/3 rounded mt-1" />
      <div className="skeleton h-2.5 w-1/4 rounded mt-1.5" />
      <div className="skeleton h-7 w-full rounded-md mt-2" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div
      aria-hidden
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return <div aria-hidden className="skeleton w-full aspect-[4/3] sm:aspect-[16/7] lg:aspect-[2017/780] rounded-lg" />;
}

export function CategorySectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section aria-hidden>
      <div className="skeleton h-6 w-48 rounded" />
      <div className="skeleton h-3 w-64 rounded mt-1.5 mb-4" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-[#E8DED5] overflow-hidden">
            <div className="skeleton w-full aspect-[4/3] rounded-none" />
            <div className="px-3 py-2.5">
              <div className="skeleton h-3.5 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
