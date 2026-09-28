"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import type { DBProduct } from "@/lib/db";

export interface CartItem {
  productId: string;
  quantity: number;
  // priceSnapshot — price at the time it was added (display only;
  // the server re-quotes from the DB at checkout)
  priceSnapshot: number;
  name: string;
  unit: string;
  emoji: string;
  image: string | null;
  categoryId: string;
}

interface CartContextType {
  cartItems: CartItem[];
  // PRIMARY interaction: set an absolute quantity.
  // 0 → 1 adds to cart; → 0 removes from cart. Instant.
  setQuantity: (product: DBProduct, quantity: number) => void;
  // Convenience +/- helper built on setQuantity
  changeQuantity: (product: DBProduct, delta: number) => void;
  // Id-based +/- for cart UIs (uses the stored priceSnapshot)
  increase: (productId: string) => void;
  decrease: (productId: string) => void;
  getQuantity: (productId: string) => number;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number; // total units
  cartLines: number; // distinct products
  totalAmount: number; // from priceSnapshots (display only)
  // Bare "add" (used by wishlist-style quick add) — sets qty 1 if absent
  addToCart: (product: DBProduct) => void;
  // Cart drawer visibility (shared by header button etc.)
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "mbpb_cart_v2";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) =>
        typeof i?.productId === "string" &&
        Number.isFinite(i?.quantity) &&
        i.quantity > 0
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Start EMPTY — no dummy pre-filled items. Cart hydrates from
  // localStorage after mount (server & client render match).
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    setCartItems(loadCart());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // storage full/unavailable — cart stays in memory
    }
  }, [cartItems, isHydrated]);

  const setQuantity = (product: DBProduct, quantity: number) => {
    const qty = Math.max(0, Math.floor(Number(quantity) || 0));
    setCartItems((prev) => {
      if (qty === 0) {
        // quantity reached 0 → remove from active cart
        return prev.filter((i) => i.productId !== product.id);
      }
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: qty } : i
        );
      }
      // 0 → 1 (or any direct set) → item enters the cart
      return [
        ...prev,
        {
          productId: product.id,
          quantity: qty,
          priceSnapshot: product.price,
          name: product.name,
          unit: product.unit,
          emoji: product.emoji,
          image: product.image,
          categoryId: product.categoryId,
        },
      ];
    });
  };

  const changeQuantity = (product: DBProduct, delta: number) => {
    setCartItems((prev) => {
      const current = prev.find((i) => i.productId === product.id)?.quantity ?? 0;
      const qty = Math.max(0, current + delta);
      if (qty === 0) return prev.filter((i) => i.productId !== product.id);
      if (current === 0) {
        return [
          ...prev,
          {
            productId: product.id,
            quantity: qty,
            priceSnapshot: product.price,
            name: product.name,
            unit: product.unit,
            emoji: product.emoji,
            image: product.image,
            categoryId: product.categoryId,
          },
        ];
      }
      return prev.map((i) =>
        i.productId === product.id ? { ...i, quantity: qty } : i
      );
    });
  };

  const increase = (productId: string) =>
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );

  const decrease = (productId: string) =>
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );

  const getQuantity = (productId: string) =>
    cartItems.find((i) => i.productId === productId)?.quantity ?? 0;

  const removeFromCart = (productId: string) =>
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));

  const clearCart = () => setCartItems([]);

  const addToCart = (product: DBProduct) => {
    const current = cartItems.find((i) => i.productId === product.id);
    if (!current) setQuantity(product, 1);
  };

  const { cartCount, cartLines, totalAmount } = useMemo(
    () => ({
      cartCount: cartItems.reduce((s, i) => s + i.quantity, 0),
      cartLines: cartItems.length,
      totalAmount: cartItems.reduce((s, i) => s + i.priceSnapshot * i.quantity, 0),
    }),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setQuantity,
        changeQuantity,
        increase,
        decrease,
        getQuantity,
        removeFromCart,
        clearCart,
        addToCart,
        cartCount,
        cartLines,
        totalAmount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
