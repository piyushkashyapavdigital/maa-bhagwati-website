"use client";

import React from "react";
import Link from "next/link";
import TopAnnouncementBar from "@/components/TopAnnouncementBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { DELIVERY_CHARGE, FREE_DELIVERY_ABOVE } from "@/lib/pricing";

export default function CartPage() {
  const {
    cartItems,
    increase,
    decrease,
    removeFromCart,
    totalAmount,
    cartCount,
    clearCart,
  } = useCart();

  const deliveryCharge =
    totalAmount === 0 || totalAmount >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  const grandTotal = totalAmount + deliveryCharge;

  // Group items by category for a tidy review
  const groups = new Map<string, typeof cartItems>();
  for (const item of cartItems) {
    const catId = item.categoryId ?? "uncategorized";
    const list = groups.get(catId) ?? [];
    list.push(item);
    groups.set(catId, list);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF]">
      <TopAnnouncementBar />
      <Header />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="flex items-center gap-2 text-xs text-[#7A6458] mb-4">
          <Link href="/" className="hover:text-[#6B1D1D]">Home</Link>
          <span>/</span>
          <span className="font-bold text-[#6B1D1D]">Your Cart</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1B17] mb-6 tracking-tight">
          Your Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DED5] p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="text-5xl block mb-3">🛒</span>
            <h2 className="text-lg font-bold text-[#2C1B17] mb-1">Your cart is empty</h2>
            <p className="text-xs text-[#7A6458] mb-6">
              Tap ADD on samagri items to build your pooja list
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#6B1D1D] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-xs hover:bg-[#4E1212]"
            >
              Browse Samagri →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items grouped by category */}
            <div className="lg:col-span-2 space-y-6">
              {[...groups.entries()].map(([categoryId, items]) => (
                <div key={categoryId}>
                  <h3 className="text-[11px] font-bold text-[#948177] uppercase tracking-wider mb-2">
                    {items[0].categoryId === "cat-1"
                      ? "Mukhya Pooja Samagri"
                      : `Category ${categoryId}`}
                  </h3>
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="bg-white rounded-2xl border border-[#E8DED5] p-3 flex items-center gap-3 shadow-2xs"
                      >
                        <div className="w-14 h-14 rounded-xl bg-[#FAF5EF] border border-[#E8DED5] flex items-center justify-center shrink-0 overflow-hidden">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{item.emoji}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#2C1B17] truncate">{item.name}</h4>
                          <p className="text-[11px] text-[#7A6458]">{item.unit}</p>
                          <p className="text-sm font-extrabold text-[#6B1D1D] mt-0.5">
                            ₹{item.priceSnapshot * item.quantity}
                          </p>
                        </div>

                        <div className="inline-flex items-center rounded-xl border-2 border-[#6B1D1D] bg-[#6B1D1D] text-white overflow-hidden shrink-0">
                          <button
                            onClick={() => decrease(item.productId)}
                            className="w-8 h-9 flex items-center justify-center font-bold hover:bg-[#4E1212] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="min-w-7 text-center text-sm font-extrabold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increase(item.productId)}
                            className="w-8 h-9 flex items-center justify-center font-bold hover:bg-[#4E1212] cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-xs text-[#948177] hover:text-[#6B1D1D] font-bold p-1 shrink-0 cursor-pointer"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-xs text-[#948177] hover:text-[#6B1D1D] font-semibold cursor-pointer"
              >
                Clear cart
              </button>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-[#E8DED5] p-6 shadow-sm h-fit lg:sticky lg:top-24">
              <h3 className="text-base font-bold text-[#2C1B17] mb-4 pb-2 border-b border-[#FAF5EF]">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-[#4E3B32] mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-bold">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className={`font-bold ${deliveryCharge === 0 ? "text-[#2E7D32]" : ""}`}>
                    {deliveryCharge === 0 ? "FREE 🎉" : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-[10px] text-[#948177] italic">
                    Add ₹{(FREE_DELIVERY_ABOVE - totalAmount).toLocaleString("en-IN")} more for free delivery
                  </p>
                )}
                <div className="border-t border-[#FAF5EF] pt-2 flex justify-between text-sm font-extrabold text-[#2C1B17]">
                  <span>Total</span>
                  <span className="text-[#6B1D1D]">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-[#6B1D1D] hover:bg-[#4E1212] text-white py-3.5 rounded-xl text-xs font-bold shadow-md transition-colors text-center block"
              >
                🔒 Proceed to Checkout →
              </Link>
              <Link
                href="/products"
                className="w-full mt-2 border border-[#E8DED5] text-[#4E3B32] hover:text-[#6B1D1D] hover:border-[#6B1D1D] py-2 rounded-xl text-xs font-semibold transition-colors text-center block"
              >
                + Add more items
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
