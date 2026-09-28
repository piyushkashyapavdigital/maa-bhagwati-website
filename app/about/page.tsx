"use client";

import React from "react";
import Link from "next/link";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF] pb-16">
      <TopAnnouncementBar />
      <Header />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-2 text-xs text-[#7A6458] mb-4">
          <Link href="/" className="hover:text-[#6B1D1D]">Home</Link>
          <span>/</span>
          <span className="font-bold text-[#6B1D1D]">About Us</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8DED5] p-6 sm:p-10 max-w-4xl mx-auto shadow-xs">
          <div className="text-center mb-8">
            <span className="text-3xl font-serif text-[#6B1D1D] block mb-2">ॐ</span>
            <h1 className="text-3xl font-extrabold text-[#6B1D1D] mb-2">
              माँ भगवती पूजा भंडार
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6458] font-semibold">
              शुद्ध सामग्री • आपकी श्रद्धा • हमारा संकल्प
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#4E3B32] leading-relaxed">
            <p>
              माँ भगवती पूजा भंडार आपके सभी धार्मिक अनुष्ठानों, पूजा-पाठ, हवन एवं वैदिक कार्यों के लिए 100% शुद्ध, पवित्र एवं प्रामाणिक सामग्री उपलब्ध कराने वाला भारत का अग्रणी प्रतिष्ठान है।
            </p>
            <p>
              हमारा मुख्य ध्येय सनातन परंपरा की पवित्रता को बनाए रखना है। हमारी सभी सामग्री—चाहे वह शुद्ध ए2 गाय का घी हो, आयुर्वेदिक हवन सामग्री हो, या प्रमाणित रुद्राक्ष व अष्टधातु मूर्तियाँ हों—सीधे प्रमाणिक स्रोतों से प्राप्त की जाती हैं।
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
