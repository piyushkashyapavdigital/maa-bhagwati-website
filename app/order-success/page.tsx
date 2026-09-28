"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SavedOrder {
  id: string;
  rzpOrderId: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    notes: string;
  };
  items: {
    id: string;
    name: string;
    image: string;
    price: number;
    qty: number;
  }[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const [order, setOrder] = useState<SavedOrder | null>(null);

  useEffect(() => {
    if (!paymentId) return;
    const saved = JSON.parse(localStorage.getItem("mbpb_orders") || "[]") as SavedOrder[];
    const found = saved.find((o) => o.id === paymentId);
    setOrder(found || null);
  }, [paymentId]);

  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 lg:px-8 py-12 w-full">
      {/* Success Banner */}
      <div className="bg-white rounded-3xl border border-[#E8DED5] shadow-lg overflow-hidden mb-8">
        {/* Top maroon strip */}
        <div className="bg-gradient-to-r from-[#6B1D1D] to-[#8B2828] px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
            ऑर्डर सफलतापूर्वक प्राप्त हुआ!
          </h1>
          <p className="text-white/80 text-sm">
            Order Confirmed · धन्यवाद 🙏
          </p>
          {paymentId && (
            <p className="text-[#E5C07B] text-xs font-mono mt-2">
              Payment ID: {paymentId}
            </p>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="p-6 space-y-5">
            {/* Customer info */}
            <div className="bg-[#FAF5EF] rounded-2xl p-4">
              <h3 className="text-xs font-extrabold text-[#6B1D1D] uppercase tracking-wider mb-3">
                📦 डिलीवरी विवरण
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4E3B32]">
                <div>
                  <span className="font-bold text-[#2C1B17]">नाम:</span>{" "}
                  {order.customer.name}
                </div>
                <div>
                  <span className="font-bold text-[#2C1B17]">मोबाइल:</span>{" "}
                  +91 {order.customer.phone}
                </div>
                {order.customer.email && (
                  <div className="sm:col-span-2">
                    <span className="font-bold text-[#2C1B17]">ईमेल:</span>{" "}
                    {order.customer.email}
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="font-bold text-[#2C1B17]">पता:</span>{" "}
                  {order.customer.address1}
                  {order.customer.address2 && `, ${order.customer.address2}`}
                  {`, ${order.customer.city}, ${order.customer.state} — ${order.customer.pincode}`}
                  {order.customer.landmark && ` (${order.customer.landmark} के पास)`}
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-xs font-extrabold text-[#6B1D1D] uppercase tracking-wider mb-3">
                🛒 ऑर्डर की गई वस्तुएँ
              </h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2 border-b border-[#FAF5EF] last:border-0"
                  >
                    <div className="w-10 h-10 bg-[#FAF5EF] rounded-lg border border-[#E8DED5] flex items-center justify-center shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2C1B17] line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-[#7A6458]">{item.qty} × ₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                    <span className="text-xs font-extrabold text-[#6B1D1D]">
                      ₹{(item.price * item.qty).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="border-t border-[#FAF5EF] pt-3 space-y-1.5 text-xs text-[#4E3B32]">
              <div className="flex justify-between">
                <span>उप-कुल</span>
                <span className="font-bold">₹{order.subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>डिलीवरी</span>
                <span className={`font-bold ${order.deliveryCharge === 0 ? "text-[#2E7D32]" : ""}`}>
                  {order.deliveryCharge === 0 ? "मुफ्त" : `₹${order.deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#2C1B17] border-t border-[#FAF5EF] pt-1.5">
                <span>कुल भुगतान</span>
                <span className="text-[#6B1D1D] text-base">₹{order.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}

        {/* No order found but payment ID present */}
        {!order && paymentId && (
          <div className="p-6 text-center text-sm text-[#7A6458]">
            <p>भुगतान सफल रहा। ऑर्डर विवरण जल्द ही आपके मोबाइल पर भेजा जाएगा।</p>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="bg-[#FFF8F0] border border-[#E5C07B] rounded-2xl p-4 mb-6 flex gap-3">
        <span className="text-xl shrink-0">🪔</span>
        <div className="text-xs text-[#4E3B32]">
          <p className="font-bold text-[#2C1B17] mb-0.5">ऑर्डर की पुष्टि</p>
          <p>
            आपके ऑर्डर की पुष्टि WhatsApp / SMS द्वारा भेजी जाएगी।
            डिलीवरी आमतौर पर <strong>3-7 कार्यदिवस</strong> में होती है।
            किसी भी सहायता के लिए: <a href="tel:7986820055" className="font-bold underline underline-offset-2">79868-20055</a>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/products"
          className="flex-1 bg-[#6B1D1D] hover:bg-[#4E1212] text-white text-center py-3.5 rounded-xl font-bold text-sm transition-all"
        >
          🛍️ और खरीदारी करें
        </Link>
        <Link
          href="/orders"
          className="flex-1 border border-[#E8DED5] bg-white hover:bg-[#FAF5EF] text-[#2C1B17] text-center py-3.5 rounded-xl font-bold text-sm transition-all"
        >
          📋 मेरे ऑर्डर देखें
        </Link>
        <Link
          href="/"
          className="flex-1 border border-[#E8DED5] bg-white hover:bg-[#FAF5EF] text-[#2C1B17] text-center py-3.5 rounded-xl font-bold text-sm transition-all"
        >
          🏠 होम पर जाएं
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF]">
      <TopAnnouncementBar />
      <Header />
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl block mb-3 animate-bounce">🙏</span>
            <p className="text-sm font-bold text-[#6B1D1D]">ऑर्डर विवरण लोड हो रहा है…</p>
          </div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
