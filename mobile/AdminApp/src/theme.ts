export const colors = {
  cream: '#FAF5EF',
  paper: '#FFFFFF',
  ink: '#1C1917',
  muted: '#78716C',
  line: '#EADDCB',
  maroon: '#6B1D1D',
  maroonDark: '#4A1010',
  maroonLight: '#8B3A3A',
  gold: '#D4AF37',
  goldLight: '#E8C96A',
  ruby: '#E11D48',
  mango: '#F59E0B',
  teal: '#0D9488',
  violet: '#7C3AED',
  sky: '#0284C7',
  leaf: '#16A34A',
} as const;

export const GRADIENT_HEADER: [string, string] = [colors.maroon, colors.maroonDark];

export const CATEGORY_PALETTE = [
  '#B91C1C',
  '#EA580C',
  '#0D9488',
  '#7C3AED',
  '#DB2777',
  '#0284C7',
  '#65A30D',
  '#D97706',
] as const;

export function colorForIndex(index: number): string {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]!;
}

export function categoryColorIndex(
  categoryId: string,
  categories: { id: string }[]
): number {
  const i = categories.findIndex((c) => c.id === categoryId);
  return i === -1 ? CATEGORY_PALETTE.length - 1 : i;
}

export const statusColors: Record<string, string> = {
  Pending: colors.mango,
  Confirmed: colors.sky,
  Shipped: colors.violet,
  Delivered: colors.leaf,
  Failed: colors.ruby,
};

export const INR = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Compact rupees for chart labels: ₹1L, ₹45K, ₹800. Never overflows. */
export function shortINR(n: number): string {
  if (n >= 100000) {
    const v = n / 100000;
    return `₹${Number.isInteger(v) ? v : v.toFixed(1)}L`;
  }
  if (n >= 1000) {
    const v = n / 1000;
    return `₹${Number.isInteger(v) ? v : v.toFixed(1)}K`;
  }
  return INR(n);
}
