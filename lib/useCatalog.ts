"use client";

import { useEffect, useState } from "react";
import type { DBCategory, DBProduct } from "@/lib/db";

export interface CatalogData {
  categories: DBCategory[];
  products: DBProduct[];
}

// Module-level cache so Header/Navbar/Footer/pages share one fetch
let cache: CatalogData | null = null;
let inflight: Promise<CatalogData> | null = null;

// Fetch with a hard timeout so a hung request can never trap the UI
// on skeletons (e.g. phone on LAN hitting a dead dev-server port).
async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

async function loadCatalog(): Promise<CatalogData> {
  if (cache) return cache;
  if (!inflight) {
    // One retry after a timeout — covers the "server restarting" case.
    inflight = fetchWithTimeout("/api/catalog")
      .catch(() => fetchWithTimeout("/api/catalog"))
      .then((r) => r.json())
      .then((d) => {
        cache = {
          categories: d.categories ?? [],
          products: d.products ?? [],
        };
        return cache;
      })
      .catch(() => ({ categories: [], products: [] }));
  }
  return inflight;
}

export function useCatalog(): CatalogData | null {
  const [data, setData] = useState<CatalogData | null>(cache);

  useEffect(() => {
    let alive = true;
    loadCatalog().then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
