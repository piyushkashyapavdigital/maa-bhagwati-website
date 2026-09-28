"use client";

import React, { useState } from "react";
import Link from "next/link";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AstrologyPage() {
  const [booked, setBooked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF] pb-16">
      <TopAnnouncementBar />
      <Header />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-2 text-xs text-[#7A6458] mb-4">
          <Link href="/" className="hover:text-[#6B1D1D]">Home</Link>
          <span>/</span>
          <span className="font-bold text-[#6B1D1D]">Jyotish Consultation</span>
        </div>

        <div className="bg-[#4E1212] text-white rounded-2xl p-6 sm:p-10 mb-8 border border-[#E5C07B]/40 shadow-lg text-center relative overflow-hidden">
          <span className="text-[#E5C07B] text-2xl font-serif block mb-1">🔮</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-2">
            Jyotish Consultation
          </h1>
          <p className="text-xs sm:text-sm text-[#E8DED5] max-w-2xl mx-auto">
            Book a consultation — kundali, grah dosh, vastu & anushthan guidance.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8DED5] p-6 sm:p-8 max-w-2xl mx-auto shadow-md">
          <h3 className="text-xl sm:text-2xl font-bold text-[#2C1B17] mb-1 text-center">
            Book a Consultation Slot
          </h3>
          <p className="text-xs text-[#7A6458] text-center mb-6">
            Fill in your details — our jyotishacharya will contact you shortly.
          </p>

          {booked ? (
            <div className="bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] p-4 rounded-xl text-center font-bold text-sm">
              ✓ Your consultation request has been received! We will contact you at <a href="tel:7986820055" className="underline underline-offset-2">79868-20055</a>.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2C1B17] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="w-full bg-[#FAF5EF] border border-[#E8DED5] rounded-xl px-4 py-2.5 text-xs text-[#2C1B17] focus:outline-none focus:border-[#6B1D1D]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C1B17] block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  className="w-full bg-[#FAF5EF] border border-[#E8DED5] rounded-xl px-4 py-2.5 text-xs text-[#2C1B17] focus:outline-none focus:border-[#6B1D1D]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C1B17] block mb-1">
                  Date & Time of Birth
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-[#FAF5EF] border border-[#E8DED5] rounded-xl px-4 py-2.5 text-xs text-[#2C1B17] focus:outline-none focus:border-[#6B1D1D]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#6B1D1D] hover:bg-[#4E1212] text-white py-3.5 rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer"
              >
                Book Consultation →
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
