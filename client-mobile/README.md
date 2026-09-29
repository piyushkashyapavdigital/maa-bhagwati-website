# Maa Bhagwati — Client App (Android)

Bare React Native (no Expo) shopping app for customers. Mirrors the Next.js
website. Talks to the live Vercel APIs — no local server needed.

- Package: `com.maabhagwati.client`
- API: `https://maa-bhagwati.vercel.app` (`src/config.ts`)
- Auth: Supabase magic link (email OTP link)
- Pay: Razorpay native SDK (TEST key in dev)

## Prereqs (one-time)

1. Supabase Dashboard → Authentication → enable **Email** provider +
   **Magic Link**, add redirect URL `maabhagwati://auth/callback`.
2. Supabase Dashboard → Settings → API → copy the **anon / publishable**
   key into `src/config.ts` → `SUPABASE_ANON_KEY`.
3. Supabase Dashboard → SQL Editor → run
   `supabase/migrations/20260929000000_client_orders.sql`
   (adds `orders.user_id`). Deploy the website so
   `app/api/client/*` routes go live.

## Everyday commands (run from `client-mobile/`)

```bash
npm install          # first time only
npm test             # jest suites (must stay green)
npx tsc --noEmit -p tsconfig.json
```

## Build + install on phone

```bash
cd android
./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

APK path: `android/app/build/outputs/apk/release/app-release.apk`
(ignored by git — share via WhatsApp / Drive).

## Release checklist

- [ ] `src/config.ts`: live `RAZORPAY_KEY_ID` (currently TEST)
- [ ] Version bump: `android/app/build.gradle` (`versionCode`, `versionName`)
- [ ] Test: login via magic link → shop → cart → test payment →
      order appears in Orders + admin app
