// ── Client app configuration ─────────────────────────────
// Swap TEST values for production when going live on Play Store.

export const SITE_URL = 'https://maa-bhagwati.vercel.app';

// Supabase project (same as website). The ANON (publishable) key is safe
// to embed — it only allows what RLS/policies permit. NEVER put the
// SECRET key in this file.
export const SUPABASE_URL = 'https://cdldqqsrfxopidgalrlf.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbGRxcXNyZnhvcGlkZ2FscmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MjExMjQsImV4cCI6MjEwNTI5NzEyNH0.xH-RRZyHod3g1ZUQ4p5tB8JcWeIOs9w6Gl5P-3nFfoI';

// Razorpay TEST key id. Replace with the live key id at release.
export const RAZORPAY_KEY_ID = 'rzp_test_TdO22IAoPMkRO5';

// Display-only estimate. The server re-quotes authoritatively at checkout
// (see /api/quote) — these must match lib/db.ts quoteCart.
export const DELIVERY_CHARGE = 70;
export const FREE_DELIVERY_ABOVE = 500;

// OAuth-style deep link for Supabase magic-link callback. Must also be
// added in Supabase Dashboard → Authentication → Redirect URLs.
export const AUTH_CALLBACK_SCHEME = 'maabhagwati';
export const AUTH_CALLBACK_URL = 'maabhagwati://auth/callback';
