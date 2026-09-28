"use client";

import React, { useState } from "react";
import Link from "next/link";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Message could not be sent, please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
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
          <span className="font-bold text-[#6B1D1D]">Contact Us</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Info */}
          <div className="bg-[#6B1D1D] text-white p-8 rounded-2xl shadow-md border border-[#E5C07B]/40 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4">Maa Bhagwati Pooja Bhandar</h2>
              <p className="text-xs text-[#E8DED5] leading-relaxed mb-6">
                For any product, wholesale order, or puja kit inquiries, contact us.
              </p>

              <div className="space-y-4 text-xs font-semibold">
                <a href="tel:7986820055" className="flex items-center gap-3 hover:underline">
                  <span className="text-lg">📞</span>
                  <span>79868-20055</span>
                </a>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📍</span>
                  <span>Maa Bhagwati Pooja Bhandar, Main Market, India</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🕒</span>
                  <span>Hours: 9:00 AM – 8:00 PM</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/20 text-[11px] text-[#E5C07B]">
              100% secure delivery & Razorpay payment support available.
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl border border-[#E8DED5] shadow-xs">
            <h3 className="text-xl font-bold text-[#2C1B17] mb-4">Send Us a Message</h3>

            {sent ? (
              <div className="bg-[#E8F5E9] text-[#2E7D32] p-4 rounded-xl text-xs font-bold text-center">
                ✓ Your message has been sent! We'll contact you at 79868-20055 shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#2C1B17] block mb-1">Name</label>
                  <input required type="text" name="name" placeholder="Your name" className="w-full bg-[#FAF5EF] border border-[#E8DED5] rounded-xl px-4 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#2C1B17] block mb-1">Phone Number</label>
                  <input required type="tel" name="phone" placeholder="Phone number" className="w-full bg-[#FAF5EF] border border-[#E8DED5] rounded-xl px-4 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#2C1B17] block mb-1">Message</label>
                  <textarea required rows={4} name="message" placeholder="Your message or query..." className="w-full bg-[#FAF5EF] border border-[#E8DED5] rounded-xl px-4 py-2 text-xs" />
                </div>
                {error && (
                  <div className="bg-[#FDECEA] text-[#C0392B] p-3 rounded-xl text-xs font-bold text-center">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#6B1D1D] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#4E1212] disabled:opacity-60"
                >
                  {submitting ? "Sending…" : "Send Message →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
