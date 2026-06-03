# Sprint 1 QA Sign-off — PWA Foundation

**QA Engineer**: Ivy  
**Date**: June 3, 2026  
**Branch**: `feature/sprint-1`  
**Deploy URL**: https://foodlens-pwa-1780465145.web.app

---

## Test Results

| Category | Count | Passing | Failing |
|----------|-------|---------|---------|
| Build (TypeScript + Next.js) | 1 | 1 | 0 |
| PWA Assets (manifest, icons, SW) | 3 | 3 | 0 |
| Firebase Configuration | 3 | 2 | 1 |
| Environment Configuration | 1 | 0 | 1 |
| Static Export Output | 1 | 1 | 0 |
| **Total** | **9** | **7** | **2** |

---

## Manual Playthrough Checklist

- [x] `npm run dev` starts on localhost:3000
- [x] Home page renders with "FoodLens — Tap to Scan" branding
- [x] Dark mode works (prefers-color-scheme: dark)
- [x] Scan button is disabled (expected — placeholder for Sprint 2)
- [x] Feature teasers (Camera, Barcode, Upload) render as icons
- [x] `npm run build` compiles clean — 0 TypeScript errors, 0 warnings
- [x] Static export generates all required files in `out/`
- [x] Manifest JSON is valid (name, icons, theme_color, shortcuts)
- [x] 3 icon sizes present (192px, 512px, maskable 512px)
- [x] Offline HTML page renders with retry button
- [x] Service worker script is generated (via Serwist)
- [x] Anonymous auth fires silently (code is ready, needs console enable)
- [ ] Lighthouse PWA audit ≥ 90 (not yet verified in browser)

---

## Issues Found

### 🔴 BUG-001: Manifest shortcuts point to non-existent routes

**Component:** PWA Manifest  
**Severity:** major  
**Steps to reproduce:**
1. Install the PWA to home screen
2. Long-press the icon to see shortcuts
3. Tap "Scan Food" or "History"

**Expected:** Navigator opens the `/scan` or `/history` page
**Actual:** Home page loads (Firebase catch-all rewrite serves `index.html` for all routes). Those pages don't even exist in the app yet.

**Root cause:** `public/manifest.json` defines shortcuts to `/scan` and `/history` which are not implemented. Additionally, `firebase.json` rewrites all routes to `/index.html`.

**Labels:** `bug`, `severity:major`

---

### 🔴 BUG-002: Firebase Hosting catch-all rewrite breaks future routing

**Component:** Firebase Configuration  
**Severity:** major  
**Steps to reproduce:**
1. Deploy to Firebase Hosting
2. Navigate to any path other than `/` (e.g., `/scan`)
3. Observe which page is served

**Expected:** If the page exists in `out/`, Firebase serves it
**Actual:** The catch-all rewrite `"**" → "/index.html"` serves the home page for ALL routes

**Impact:** With `output: 'export'`, Next.js generates individual HTML files per route (e.g., `out/scan.html` for `/scan`). The current rewrite rule prevents those pages from ever being served. The rewrite should be removed or replaced with a more specific rule (or use `cleanUrls: true` and `trailingSlash: true` in hosting config).

**Labels:** `bug`, `severity:major`

---

### 🟡 BUG-003: `esbuild` listed as production dependency

**Component:** package.json  
**Severity:** minor  
**Description:** `"esbuild": "^0.28.0"` is listed in `dependencies` in `package.json`. This is a build tool and should either be in `devDependencies` or removed entirely (it's likely pulled in transitively by Serwist/Next.js).

**Labels:** `bug`, `severity:minor`

---

### 🟡 BUG-004: `public/index.html` is dead code

**Component:** Public Assets  
**Severity:** minor  
**Description:** The file `public/index.html` is the default Firebase Hosting boilerplate, but it's never served — the app builds to `out/` which contains the real `index.html`. This file will confuse future developers and should be deleted.

**Labels:** `bug`, `severity:minor`

---

### 🟡 BUG-005: `firebase.json` references non-existent `functions/` directory

**Component:** Firebase Configuration  
**Severity:** minor  
**Description:** `firebase.json` has a `functions` section pointing to source `"functions"`, but no `functions/` directory exists. Running `firebase deploy` will fail with a missing source error. Either create the directory or remove the functions config until Sprint 2.

**Labels:** `bug`, `severity:minor`

---

### 🟡 BUG-006: No `.env.example` file

**Component:** Developer Experience  
**Severity:** minor  
**Description:** The app requires 6 environment variables (`NEXT_PUBLIC_FIREBASE_*`) to function. The `.env.local` file is gitignored, but there's no `.env.example` documenting which variables are needed. A new developer cloning the repo has no way to know what to configure.

**Labels:** `bug`, `severity:minor`

---

## Observations (Not Bugs)

| # | Observation | Detail |
|---|-------------|--------|
| O-001 | No automated tests | No `tests/` directory, no test framework configured. Sprint 1 is foundation so this is expected, but tests should be planned for Sprint 2+. |
| O-002 | Lighthouse audit not run | Success criterion "Lighthouse PWA audit ≥ 90" is unchecked in done.md. Should be verified against the live Firebase URL. |
| O-003 | `measurementId` omitted from firebase.ts | The planned code sample included `measurementId`, but the actual implementation omits it — fine since analytics is handled via `isSupported()` check. |
| O-004 | Firestore rules fully locked down | `allow read, write: if false` — documented as intentional for Sprint 1, but Sprint 2 scanning features will require updating these rules. |
| O-005 | Build compiles with 0 errors | TypeScript strict mode is on, and no type errors exist. Code quality is solid. |

---

## Sign-off Decision

| Check | Status |
|-------|--------|
| Build passes | ✅ Pass |
| No TypeScript errors | ✅ Pass |
| PWA assets valid | ✅ Pass |
| Critical bugs filed | ✅ 2 major, 4 minor |
| Blockers for sprint goal | ❌ No — Sprint 1 goal is "standing PWA shell" which is deployed and working |
| Blockers for Sprint 2 | ⚠️ Yes — BUG-001 and BUG-002 must be fixed before Sprint 2 routes exist |

### ✅ SIGNED OFF — Sprint 1 (with caveats)

The Sprint 1 goal ("standing PWA shell deployed to Firebase Hosting") is achieved. The app builds, deploys, and serves the home page with PWA assets.

**However**, BUG-001 and BUG-002 must be resolved **before Sprint 2 deliverable routes** (`/scan`, `/history`, etc.) are implemented, otherwise those pages will not be accessible.

Recommended action: Fix BUG-001, BUG-002, and BUG-005 at the start of Sprint 2 before adding new features.

---

*End of QA report*
