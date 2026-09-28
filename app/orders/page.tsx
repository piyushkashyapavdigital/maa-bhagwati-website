"use client";

import React from "react";
import Link from "next/link";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function OrdersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF] pb-16">
      <TopAnnouncementBar />
      <Header />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-2 text-xs text-[#7A6458] mb-4">
          <Link href="/" className="hover:text-[#6B1D1D]">Home</Link>
          <span>/</span>
          <span className="font-bold text-[#6B1D1D]">My Orders</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#2C1B17] mb-6">
          मेरे ऑर्डर (My Orders)
        </h1>

        <div className="bg-white rounded-2xl border border-[#E8DED5] p-8 text-center max-w-md mx-auto shadow-xs">
          <span className="text-4xl block mb-2">📦</span>
          <h2 className="text-base font-bold text-[#2C1B17] mb-1">हाल में कोई ऑर्डर नहीं है</h2>
          <p className="text-xs text-[#7A6458] mb-6">आपने अभी तक कोई ऑर्डर दर्ज नहीं किया है</p>
          <Link
            href="/products"
            className="inline-block bg-[#6B1D1D] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#4E1212]"
          >
            उत्पाद देखें (Shop Now) →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
