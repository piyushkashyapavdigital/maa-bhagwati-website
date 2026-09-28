"use client";

import React from "react";
import Link from "next/link";
import { useCatalog } from "@/lib/useCatalog";

export default function Footer() {
  const catalog = useCatalog();

  return (
    <footer className="bg-[#3B0E0E] text-[#C2B2A7] pt-10 pb-5 px-4 lg:px-8 border-t border-[#6B1D1D]/40 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Brand */}
        <div>
          <h3 className="text-sm font-bold text-white mb-2">
            Maa Bhagwati Pooja Bhandar
          </h3>
          <p className="text-[11px] text-[#A8988D] leading-relaxed mb-3">
            Shuddh Samagri · Aapki Shraddha · Hamara Sankalp.
            100% authentic samagri for every pooja, havan and anushthan.
          </p>
          <a href="tel:7986820055" className="text-[11px] text-[#E5C07B] font-semibold hover:underline">
            📞 79868-20055
          </a>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-3">
            Quick Links
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li><Link href="/" className="hover:text-[#E5C07B] transition-colors">Home</Link></li>
            <li><Link href="/products" className="hover:text-[#E5C07B] transition-colors">Shop All Samagri</Link></li>
            <li><Link href="/categories" className="hover:text-[#E5C07B] transition-colors">Categories</Link></li>
            <li><Link href="/about" className="hover:text-[#E5C07B] transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-[#E5C07B] transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-3">
            Categories
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            {(catalog?.categories ?? []).map((cat) => (
              <li key={cat.id}>
                <Link href={`/category/${cat.slug}`} className="hover:text-[#E5C07B] transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-3">
            Support
          </h4>
          <p className="text-[11px] text-[#A8988D] mb-2">
            Helpline: 9:00 AM – 8:00 PM, all days
          </p>
          <div className="bg-[#4E1212] p-2.5 rounded border border-[#6B1D1D]/50 text-[10px]">
            <span className="text-[#E5C07B] font-bold block mb-0.5">Secure Online Payment</span>
            <span className="text-[#A8988D]">Razorpay · UPI · Cards · Net Banking</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-4 border-t border-[#6B1D1D]/30 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#7A6458] gap-2">
        <p>© 2026 Maa Bhagwati Pooja Bhandar. All Rights Reserved.</p>
        <p>Designed & Developed for Maa Bhagwati Pooja Bhandar</p>
      </div>
    </footer>
  );
}
