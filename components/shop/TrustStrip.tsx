"use client";

import React from "react";

const ITEMS = [
  { icon: "✓", title: "Pure & Authentic", sub: "Quality Assured" },
  { icon: "🚚", title: "Fast Home Delivery", sub: "Within 2-5 km (Zirakpur)" },
  { icon: "UPI", title: "Secure Payments", sub: "Razorpay & UPI" },
  { icon: "♥", title: "Trusted by 1000+", sub: "Happy Devotees" },
];

export default function TrustStrip() {
  return (
    <section className="bg-[#6B1D1D] rounded-lg text-white px-5 py-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#E5C07B]">
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold leading-tight truncate">{item.title}</p>
              <p className="text-[9px] text-white/60 leading-tight truncate">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
