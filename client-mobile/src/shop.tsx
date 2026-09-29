import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from './api';
import type { Banner } from './api';
import type { Category, Product } from './types';

interface ShopState {
  ready: boolean;
  error: string;
  categories: Category[];
  products: Product[];
  banners: Banner[];
  refresh: () => Promise<void>;
  categoryBySlug: (slug: string) => Category | undefined;
  productById: (id: string) => Product | undefined;
  productsIn: (categoryId: string) => Product[];
}

const ShopContext = createContext<ShopState | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  const refresh = useCallback(async () => {
    setError('');
    try {
      const [res, bRes] = await Promise.all([
        api.catalog(),
        api.banners().catch(() => ({ banners: [] as Banner[] })),
      ]);
      setCategories(res.categories ?? []);
      setProducts(res.products ?? []);
      setBanners(bRes.banners ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load shop');
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<ShopState>(() => {
    return {
      ready,
      error,
      categories,
      products,
      banners,
      refresh,
      categoryBySlug: (slug: string) => categories.find((c) => c.slug === slug),
      productById: (id: string) => products.find((p) => p.id === id),
      productsIn: (categoryId: string) =>
        products.filter(
          (p) => (p.category_id ?? p.categoryId) === categoryId,
        ),
    };
  }, [ready, error, categories, products, banners, refresh]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopState {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}
