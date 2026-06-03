# Sprint 1 — Progress

**Period**: June 3 – June 9, 2026
**Goal**: Standing PWA shell deployed to Firebase Hosting

---

## Daily Log

### June 3

| Task | Status | Notes |
|------|--------|-------|
| 1.1 Scaffold Next.js app | ✅ Done | `create-next-app` with TS + Tailwind v4, custom theme (emerald/sky), FoodLens placeholder page |
| 1.2 Configure PWA | ✅ Done | @serwist/next with webpack, manifest.json, offline.html, generated PNG icons, service worker with caching strategies |
| 1.3 Firebase project setup | ✅ Done | Project 'foodlens-pwa-1780465145', Hosting configured, Firestore enabled (nam5), Auth (Anonymous) needs console enable |
| 1.4 Initialize Firebase SDK | ✅ Done | `src/lib/firebase.ts` with auth/db/storage/analytics, `AuthInitializer` component, `.env.local` config |
| 1.5 Deploy to Firebase Hosting | ✅ Done | Deployed to https://foodlens-pwa-1780465145.web.app — verified 200 on all assets |

**Blockers**: None

**Deploy URL**: https://foodlens-pwa-1780465145.web.app
**GitHub URL**: https://github.com/zheidouz/foodlens-pwa

---

## Overall Status

**Progress**: ▰▰▰▰▰▰▰▰▰▰ 100%

**RAG Status**: 🟢 Green

## Key Decisions Made During Sprint

- Used `@serwist/next` with webpack (not Turbopack) since Serwist webpack is more stable
- Configured `output: 'export'` (static export) for Firebase Hosting compatibility
- Created `AuthInitializer` client component pattern to keep root layout as server component
- Generated minimal PNG icons via Node.js script for PWA installability
- App uses `--webpack` flag for dev/build since Serwist requires webpack plugins

## Deviations from Plan

- (to be filled)

## Bug Fixes (June 3)

### Bug 1 — Memory leak: `onAuthStateChanged` not unsubscribed
**File**: `src/lib/firebase.ts`, `src/components/AuthInitializer.tsx`
**Fix**: `initAuth()` now returns the `unsubscribe` function. `AuthInitializer` calls it in the `useEffect` cleanup.

### Bug 2 — Race condition: `analytics` mutable let export
**File**: `src/lib/firebase.ts`
**Fix**: Replaced `export let analytics` with async `getAnalyticsInstance()` getter.

### Bug 3 — Dead manifest shortcuts (404)
**File**: `public/manifest.json`
**Fix**: Removed `/scan` and `/history` shortcuts (pages don't exist yet). Set to `[]`.

### Bug 4 — `parseBody` doesn't unwrap client `{ data: ... }` wrapper
**File**: `functions/src/index.ts`
**Fix**: `parseBody()` now checks for `req.body.data` before returning the raw body. Client sends `{ data: { imageBase64, mimeType } }` (callable-compatible), but server was reading `body.imageBase64` → `undefined` → 500 error.

### Bug 5 — Tiny placeholder icons flagged "not a valid image"
**File**: `public/icons/*.png`
**Fix**: Regenerated all 3 icons (192, 512, 512-maskable) using sharp with an emerald-green camera/lens SVG design. Sizes now 7 KB / 25 KB / 22 KB.

### Bug 6 — Missing `mobile-web-app-capable` meta tag
**File**: `src/app/layout.tsx`
**Fix**: Added `mobile-web-app-capable: "yes"` alongside `apple-mobile-web-app-capable` in `metadata.other`. This is the standards-track PWA meta tag for non-Apple browsers.
