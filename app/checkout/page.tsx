"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { DELIVERY_CHARGE, FREE_DELIVERY_ABOVE } from "@/lib/pricing";

// Razorpay window type
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh",
];

interface FormData {
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
}

const initialForm: FormData = {
  name: "",
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "Uttar Pradesh",
  pincode: "",
  landmark: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, totalAmount, cartCount, clearCart } = useCart();

  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [rzpLoaded, setRzpLoaded] = useState(false);

  // Display-only estimate from priceSnapshots; the server re-quotes
  const deliveryCharge =
    totalAmount === 0 || totalAmount >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  const grandTotal = totalAmount + deliveryCharge;

  // Load Razorpay checkout.js
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.Razorpay) { setRzpLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRzpLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay script");
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace("/cart");
    }
  }, [cartItems, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone))
      newErrors.phone = "Enter a valid 10-digit mobile number";
    if (!form.address1.trim()) newErrors.address1 = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "Select a state";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode))
      newErrors.pincode = "Enter a valid 6-digit pincode";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;
    if (!rzpLoaded) {
      alert("Razorpay failed to load. Please refresh the page.");
      return;
    }

    setIsProcessing(true);

    // Only product ids + quantities leave the browser — amounts are
    // computed on the server from the database.
    const cartLines = cartItems.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));

    try {
      // Step 1: Create Razorpay order on server (server re-prices the cart)
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: cartLines,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Order creation failed");
      }

      const order = await orderRes.json();
      const serverTotal = order.amount / 100; // paise → rupees

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Maa Bhagwati Pooja Bhandar",
        description: `Order of ${cartCount} item(s)`,
        image: "/logo.png",
        order_id: order.id,
        prefill: {
          name: form.name,
          contact: form.phone,
          email: form.email,
        },
        notes: {
          address: `${form.address1}, ${form.address2}, ${form.city}, ${form.state} - ${form.pincode}`,
          landmark: form.landmark,
          special_instructions: form.notes,
        },
        theme: { color: "#6B1D1D" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3: Verify payment (server re-quotes authoritatively)
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cartLines,
            }),
          });

          const verify = await verifyRes.json();
          if (verify.success) {
            // Save order to localStorage for the orders page
            const savedOrders = JSON.parse(localStorage.getItem("mbpb_orders") || "[]");
            savedOrders.unshift({
              id: response.razorpay_payment_id,
              rzpOrderId: response.razorpay_order_id,
              date: new Date().toISOString(),
              customer: form,
              items: cartItems.map((i) => ({
                id: i.productId,
                name: i.name,
                image: i.image,
                price: i.priceSnapshot,
                qty: i.quantity,
              })),
              subtotal: order.quote?.subtotal ?? totalAmount,
              deliveryCharge: order.quote?.deliveryCharge ?? deliveryCharge,
              total: serverTotal,
              status: "Confirmed",
            });
            localStorage.setItem("mbpb_orders", JSON.stringify(savedOrders));
            clearCart();
            router.push(`/order-success?payment_id=${response.razorpay_payment_id}`);
          } else {
            alert("Payment verification failed. Please contact support.");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: { error: { description: string } }) => {
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const inputClass = (field: keyof FormData) =>
    `w-full border rounded-xl px-4 py-3 text-sm font-medium text-[#2C1B17] bg-white focus:outline-none transition-all ${
      errors[field]
        ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
        : "border-[#E8DED5] focus:border-[#6B1D1D] focus:ring-2 focus:ring-[#6B1D1D]/15"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF]">
      <TopAnnouncementBar />
      <Header />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#7A6458] mb-6">
          <Link href="/" className="hover:text-[#6B1D1D]">Home</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-[#6B1D1D]">Cart</Link>
          <span>/</span>
          <span className="font-bold text-[#6B1D1D]">Checkout</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1B17] mb-2">
          Checkout
        </h1>
        <p className="text-xs text-[#7A6458] mb-8">
          Enter your delivery address & complete payment
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer details */}
            <div className="bg-white rounded-2xl border border-[#E8DED5] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#FAF5EF]">
                <span className="w-7 h-7 rounded-full bg-[#6B1D1D] text-white text-xs font-bold flex items-center justify-center">1</span>
                <h2 className="text-base font-extrabold text-[#2C1B17]">Customer Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#4E3B32] block mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramkumar Sharma"
                    className={inputClass("name")}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4E3B32] block mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-[#E8DED5] bg-[#FAF5EF] rounded-l-xl text-xs font-bold text-[#7A6458]">
                      +91
                    </span>
                    <input
                      id="checkout-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`flex-1 border rounded-r-xl px-3 py-3 text-sm font-medium text-[#2C1B17] bg-white focus:outline-none transition-all ${
                        errors.phone
                          ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
                          : "border-[#E8DED5] focus:border-[#6B1D1D] focus:ring-2 focus:ring-[#6B1D1D]/15"
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.phone}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4E3B32] block mb-1.5">
                    Email <span className="text-[#948177] font-normal">(optional)</span>
                  </label>
                  <input
                    id="checkout-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={inputClass("email")}
                  />
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-[#E8DED5] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#FAF5EF]">
                <span className="w-7 h-7 rounded-full bg-[#6B1D1D] text-white text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-base font-extrabold text-[#2C1B17]">Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#4E3B32] block mb-1.5">
                    House No. / Street / Mohalla <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-address1"
                    name="address1"
                    type="text"
                    value={form.address1}
                    onChange={handleChange}
                    placeholder="e.g. House 45, Ram Nagar Colony"
                    className={inputClass("address1")}
                  />
                  {errors.address1 && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.address1}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#4E3B32] block mb-1.5">
                    Area / Sector <span className="text-[#948177] font-normal">(optional)</span>
                  </label>
                  <input
                    id="checkout-address2"
                    name="address2"
                    type="text"
                    value={form.address2}
                    onChange={handleChange}
                    placeholder="e.g. Sector-12"
                    className={inputClass("address2")}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4E3B32] block mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Lucknow"
                    className={inputClass("city")}
                  />
                  {errors.city && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.city}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4E3B32] block mb-1.5">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-pincode"
                    name="pincode"
                    type="text"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="226001"
                    maxLength={6}
                    className={inputClass("pincode")}
                  />
                  {errors.pincode && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.pincode}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4E3B32] block mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="checkout-state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className={`${inputClass("state")} cursor-pointer`}
                  >
                    <option value="">— Select state —</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.state}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4E3B32] block mb-1.5">
                    Nearby Landmark <span className="text-[#948177] font-normal">(optional)</span>
                  </label>
                  <input
                    id="checkout-landmark"
                    name="landmark"
                    type="text"
                    value={form.landmark}
                    onChange={handleChange}
                    placeholder="e.g. Near Shiv Mandir"
                    className={inputClass("landmark")}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#4E3B32] block mb-1.5">
                    Special Instructions / Note <span className="text-[#948177] font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="checkout-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g. Deliver after 2 PM"
                    className={`${inputClass("notes")} resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-[#E8DED5] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#FAF5EF]">
                <span className="w-7 h-7 rounded-full bg-[#6B1D1D] text-white text-xs font-bold flex items-center justify-center">3</span>
                <h2 className="text-base font-extrabold text-[#2C1B17]">Payment Method</h2>
              </div>

              <div className="flex items-center gap-3 p-4 border-2 border-[#6B1D1D] bg-[#FAF5EF] rounded-xl">
                <div className="w-5 h-5 rounded-full border-4 border-[#6B1D1D] shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#2C1B17]">Razorpay — Online Payment</p>
                  <p className="text-[10px] text-[#7A6458]">
                    UPI · Credit/Debit Card · Net Banking · Wallets
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[10px] text-[#7A6458]">
                <span>🔒</span>
                <span>Your payment is protected by 256-bit SSL encryption.</span>
              </div>
            </div>
          </div>

          {/* RIGHT: order summary */}
          <div className="h-fit lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8DED5] p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-[#2C1B17] mb-4 pb-2 border-b border-[#FAF5EF]">
                Order Summary ({cartCount} items)
              </h3>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto no-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#FAF5EF] rounded-lg border border-[#E8DED5] flex items-center justify-center shrink-0 overflow-hidden">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">{item.emoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2C1B17] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#7A6458]">
                        {item.quantity} × ₹{item.priceSnapshot.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-[#6B1D1D] shrink-0">
                      ₹{(item.priceSnapshot * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#FAF5EF] pt-3 space-y-2 text-xs text-[#4E3B32]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className={`font-bold ${deliveryCharge === 0 ? "text-[#2E7D32]" : ""}`}>
                    {deliveryCharge === 0 ? "FREE 🎉" : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="border-t border-[#FAF5EF] pt-2 flex justify-between text-sm font-extrabold text-[#2C1B17]">
                  <span>Total</span>
                  <span className="text-[#6B1D1D] text-base">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={isProcessing || !rzpLoaded}
              className={`w-full py-4 rounded-2xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                isProcessing || !rzpLoaded
                  ? "bg-[#948177] cursor-not-allowed text-white/80"
                  : "bg-[#6B1D1D] hover:bg-[#4E1212] text-white cursor-pointer active:scale-95"
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  <span>Processing…</span>
                </>
              ) : (
                <>
                  <span>🔒</span>
                  <span>Pay ₹{grandTotal.toLocaleString("en-IN")}</span>
                </>
              )}
            </button>

            <Link
              href="/cart"
              className="block text-center text-xs text-[#7A6458] hover:text-[#6B1D1D] font-semibold py-2"
            >
              ← Back to cart
            </Link>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "🔒", label: "Secure Pay" },
                { icon: "🔄", label: "7-day Return" },
                { icon: "🚚", label: "Fast Delivery" },
              ].map((b) => (
                <div key={b.label} className="bg-white border border-[#E8DED5] rounded-xl p-2 text-center">
                  <span className="text-lg block">{b.icon}</span>
                  <span className="text-[9px] font-bold text-[#7A6458]">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
