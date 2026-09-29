import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, Product } from './types';

const STORAGE_KEY = 'mbpb_client_cart_v1';

function sanitize(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return (raw as CartItem[]).filter(
    (i) =>
      typeof i?.productId === 'string' &&
      Number.isFinite(i?.quantity) &&
      (i.quantity as number) > 0,
  );
}

interface CartContextType {
  items: CartItem[];
  setQuantity: (product: Product, quantity: number) => void;
  increase: (productId: string) => void;
  decrease: (productId: string) => void;
  getQuantity: (productId: string) => number;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          setItems(sanitize(JSON.parse(raw)));
        } catch {
          // corrupt cart → start empty
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items]);

  const setQuantity = useCallback((product: Product, quantity: number) => {
    const qty = Math.max(0, Math.floor(Number(quantity) || 0));
    setItems((prev) => {
      const rest = prev.filter((i) => i.productId !== product.id);
      if (qty === 0) return rest;
      return [
        ...rest,
        {
          productId: product.id,
          quantity: qty,
          priceSnapshot: product.price,
          name: product.name,
          unit: product.unit,
          emoji: product.emoji ?? '',
          image: product.image ?? null,
        },
      ];
    });
  }, []);

  const increase = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  }, []);

  const decrease = useCallback((productId: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }, []);

  const getQuantity = useCallback(
    (productId: string) =>
      items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items],
  );

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextType>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.priceSnapshot * i.quantity, 0);
    return {
      items,
      setQuantity,
      increase,
      decrease,
      getQuantity,
      remove,
      clear,
      count,
      subtotal,
    };
  }, [items, setQuantity, increase, decrease, getQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
