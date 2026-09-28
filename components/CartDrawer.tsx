"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

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

/** Load the most recent order so the drawer can show a receipt even
 *  when the cart is empty (right after a successful checkout).
 *  Reads fresh every time the drawer opens so a brand-new order
 *  placed after mount is immediately reflected. */
function useLastOrder(isOpen: boolean): SavedOrder | null {
  const [order, setOrder] = useState<SavedOrder | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = JSON.parse(localStorage.getItem("mbpb_orders") || "[]") as SavedOrder[];
      setOrder(saved[0] ?? null);
    } catch {
      setOrder(null);
    }
  }, [isOpen]);

  return order;
}

export default function CartDrawer() {
  const {
    cartItems,
    increase,
    decrease,
    removeFromCart,
    totalAmount,
    cartCount,
    clearCart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();
  const lastOrder = useLastOrder(isCartDrawerOpen);

  if (!isCartDrawerOpen) return null;
  const onClose = () => setIsCartDrawerOpen(false);

  const showReceipt = cartItems.length === 0 && lastOrder != null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-[#FAF5EF] w-full max-w-md h-full flex flex-col shadow-2xl border-l border-[#E8DED5]">
        {/* Header */}
        <div className="bg-[#6B1D1D] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="font-bold text-base sm:text-lg">
              {showReceipt ? "Your Order Receipt" : `Your Cart (${cartCount})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {showReceipt && lastOrder ? (
            <Receipt order={lastOrder} onClose={onClose} />
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 text-[#8C766B]">
              <span className="text-4xl block mb-2">🛒</span>
              <p className="font-semibold text-sm">Your cart is empty</p>
              <p className="text-xs text-[#948177] mt-1">
                Tap ADD on any samagri item to start your pooja list
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="inline-block mt-5 bg-[#6B1D1D] hover:bg-[#4E1212] text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors"
              >
                Browse Samagri →
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.productId}
                className="bg-white p-3 rounded-xl border border-[#E8DED5] flex items-center gap-3 shadow-sm"
              >
                <div className="w-14 h-14 rounded-lg bg-[#FAF5EF] border border-[#E8DED5] flex items-center justify-center shrink-0 overflow-hidden">
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
                    ₹{(item.priceSnapshot * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-[10px] text-[#948177] hover:text-[#6B1D1D] font-bold p-1 cursor-pointer"
                    title="Remove"
                  >
                    ✕
                  </button>
                  <div className="inline-flex items-center rounded-xl border-2 border-[#6B1D1D] bg-[#6B1D1D] text-white overflow-hidden">
                    <button
                      onClick={() => decrease(item.productId)}
                      className="w-7 h-7 flex items-center justify-center font-bold hover:bg-[#4E1212] cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-xs font-extrabold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increase(item.productId)}
                      className="w-7 h-7 flex items-center justify-center font-bold hover:bg-[#4E1212] cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="bg-white p-4 border-t border-[#E8DED5] space-y-3">
            <div className="flex items-center justify-between text-sm font-bold text-[#2C1B17]">
              <span>Total ({cartCount} items)</span>
              <span className="text-lg text-[#6B1D1D]">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[10px] text-[#948177] -mt-1">
              Final total (incl. delivery) calculated at checkout
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="border-2 border-[#6B1D1D] text-[#6B1D1D] hover:bg-[#6B1D1D] hover:text-white py-2.5 rounded-xl font-bold text-xs transition-all text-center"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="bg-[#6B1D1D] hover:bg-[#4E1212] text-white py-2.5 rounded-xl font-bold text-xs transition-all text-center shadow-sm"
              >
                Checkout →
              </Link>
            </div>
            <button
              onClick={clearCart}
              className="w-full text-[10px] text-[#948177] hover:text-[#6B1D1D] font-semibold cursor-pointer"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function Receipt({
  order,
  onClose,
}: {
  order: SavedOrder;
  onClose: () => void;
}) {
  return (
    <div className="space-y-2.5">
      {/* Status banner */}
      <div className="bg-gradient-to-r from-[#6B1D1D] to-[#8B2828] text-white rounded-2xl p-4 text-center">
        <span className="text-2xl block mb-1">🧾</span>
        <p className="font-extrabold text-sm">Order Confirmed!</p>
        <p className="text-[10px] text-white/80 mt-0.5">
          {order.status} · {formatDate(order.date)}
        </p>
        <p className="text-[10px] font-mono text-[#E5C07B] mt-1.5 break-words">
          Order ID: {order.id}
        </p>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-[#E8DED5] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#FAF5EF]">
          <p className="text-[10px] font-extrabold text-[#6B1D1D] uppercase tracking-wider">
            Paid Items
          </p>
        </div>
        <div className="px-4 py-1.5 space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2.5 py-1.5">
              <div className="w-8 h-8 bg-[#FAF5EF] rounded-md border border-[#E8DED5] flex items-center justify-center shrink-0">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-0.5" />
                ) : (
                  <span className="text-sm text-[#6B1D1D]">🪔</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-[#2C1B17] truncate">{item.name}</p>
                <p className="text-[9px] text-[#948177]">{item.qty} × ₹{item.price.toLocaleString("en-IN")}</p>
              </div>
              <span className="text-[11px] font-extrabold text-[#6B1D1D]">
                ₹{(item.price * item.qty).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-2xl border border-[#E8DED5] p-4 space-y-1 text-[11px] text-[#4E3B32]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-bold">₹{order.subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span className={`font-bold ${order.deliveryCharge === 0 ? "text-[#2E7D32]" : ""}`}>
            {order.deliveryCharge === 0 ? "Free" : `₹${order.deliveryCharge.toLocaleString("en-IN")}`}
          </span>
        </div>
        <div className="flex justify-between text-sm font-extrabold text-[#2C1B17] border-t border-[#FAF5EF] pt-1.5">
          <span>Total Paid</span>
          <span className="text-[#6B1D1D]">₹{order.total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Ship to */}
      <div className="bg-white rounded-2xl border border-[#E8DED5] p-4 text-[11px] text-[#4E3B32]">
        <p className="text-[10px] font-extrabold text-[#6B1D1D] uppercase tracking-wider mb-1.5">
          🚚 Deliver to
        </p>
        <p className="font-bold text-[#2C1B17]">{order.customer.name}</p>
        <p className="text-[#7A6458]">
          {order.customer.address1}
          {order.customer.address2 && `, ${order.customer.address2}`}
          {`, ${order.customer.city}, ${order.customer.state} — ${order.customer.pincode}`}
        </p>
      </div>

      {/* Actions */}
      <div className="pt-1 flex flex-col gap-2">
        <Link
          href="/orders"
          onClick={onClose}
          className="bg-[#6B1D1D] hover:bg-[#4E1212] text-white text-center py-2.5 rounded-xl font-bold text-xs transition-colors"
        >
          🧾 View My Orders
        </Link>
        <Link
          href="/products"
          onClick={onClose}
          className="border border-[#E8DED5] bg-white hover:bg-[#FAF5EF] text-[#2C1B17] text-center py-2.5 rounded-xl font-bold text-xs transition-colors"
        >
          🛍️ Order More Samagri
        </Link>
      </div>
    </div>
  );
}
