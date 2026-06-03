# Sprint 4: Results & Scoring UI

**Duration**: June 3 – June 9, 2026
**Goal**: Build the results page with Good & Bad card layout, score visualization, and wire up the "Analyze" button to live Cloud Functions.
**Branch**: `feature/sprint-4`

---

## 📋 Prioritized Task List

| Priority | Task | Effort | Dependencies |
|----------|------|--------|-------------|
| **P0** | 4.1 — Build Results page route + layout | M | 3.2, 3.3 (Cloud Functions) |
| **P0** | 4.2 — Wire "Analyze" button on scan page to live Cloud Functions | M | 4.1 |
| **P0** | 4.3 — Score visualization (Health gauge, Nutri-Score, NOVA) | S | 4.1 |
| **P1** | 4.4 — Good & Bad card layout with factors list | M | 4.3 |
| **P1** | 4.5 — Allergen & red flag alerts | S | 4.4 |
| **P2** | 4.6 — Save scan to Firestore with offline persistence | M | 4.4 |

---

## ✅ Success Criteria

- [ ] `/results` page renders health score, Nutri-Score, NOVA, good/bad factors
- [ ] "Analyze Food" button calls `lookUpBarcode` (barcode) or `analyzeFoodImage` (camera/upload)
- [ ] Health score gauge animates (0–100, color-coded)
- [ ] Nutri-Score badge shows A–E with correct color
- [ ] Good factors list with green +score badges
- [ ] Bad factors list with red -score badges
- [ ] Allergen warnings shown if detected
- [ ] Loading states and error handling for API calls
- [ ] Build + deploy succeeds

---

## 🧩 Task Breakdown

### 4.1 — Results Page Route

**File**: `src/app/results/page.tsx`

- Accepts scan data via router state or a lightweight store (Zustand)
- Reads from `ScanResult` from the scan page
- Renders: product name, image, health score gauge, Nutri-Score, NOVA, good/bad factors, allergen alerts

### 4.2 — Wire "Analyze" Button

**File**: `src/app/scan/page.tsx` (update)

- Remove `disabled` from Analyze button
- On click: call `lookUpBarcode(result.raw)` for barcode, or `analyzeFoodImage(result.raw)` for camera/upload
- Navigate to `/results` with the response data on success
- Show loading spinner while analyzing
- Show error message on failure

### 4.3 — Score Visualization Components

**File**: `src/components/results/HealthScoreGauge.tsx`
- Circular/conic gradient gauge showing 0–100 score
- Color: red → orange → amber → green → emerald based on score
- Label: "Excellent", "Good", "Average", "Poor", "Very Poor"

**File**: `src/components/results/NutriScoreBadge.tsx`
- Colored badge: A (green) → E (red)
- Scale of 5 letters with the active one highlighted

**File**: `src/components/results/NovaBadge.tsx`
- NOVA 1–4 with color and description

### 4.4 — Good & Bad Card Layout

**File**: `src/app/results/page.tsx` (extends 4.1)

- Two-column or stacked list of factors
- Good factors: green background, +score, checkmark icon
- Bad factors: red background, -score, warning icon
- Each factor shows label and numeric score

### 4.5 — Allergen & Red Flag Alerts

**File**: `src/components/results/AllergenAlert.tsx`

- Red banner if allergens detected in product data
- Yellow warning for high-risk flags (ultra-processed, excess sugar/sodium)

### 4.6 — Save to Firestore (P2)

**File**: `src/lib/firestore.ts`

- `saveScan(userId, scanData)` — writes to `users/{uid}/scans/{scanId}`
- `getScanHistory(userId)` — queries scans ordered by date
- Offline persistence via Firestore `enableMultiTabIndexedDbPersistence`

---

## 📁 Files to Create/Modify

```
src/
├── app/
│   ├── scan/page.tsx            # [MODIFY] Wire Analyze button
│   └── results/
│       └── page.tsx             # [CREATE] Results page
├── components/
│   └── results/
│       ├── HealthScoreGauge.tsx  # [CREATE] Score gauge
│       ├── NutriScoreBadge.tsx   # [CREATE] Nutri-Score badge
│       ├── NovaBadge.tsx         # [CREATE] NOVA indicator
│       └── AllergenAlert.tsx     # [CREATE] Allergen alerts
├── lib/
│   └── firestore.ts             # [CREATE] Firestore scan CRUD
└── types/
    └── index.ts                 # [MODIFY] Add results types
```

---

## 🤖 Dev Team Briefing

### Nova (Frontend — primary)
- Build Results page layout and routing
- Wire Analyze button to Cloud Functions with loading/error states
- Create all result components (gauge, badges, cards)

### Milo (Visual — primary)
- Design the health score gauge (conic gradient, animation)
- Color system for Nutri-Score, NOVA, good/bad factors
- Responsive layout for results page
- Dark mode for all new components

### Sage (Backend — supporting)
- Create Firestore helpers (`src/lib/firestore.ts`)
- Add offline persistence support
- Handle Cloud Function error responses gracefully

## Constraints
- Results page is client-side only ("use client")
- "Analyze" must show loading state immediately (don't freeze UI)
- Handle Function errors: "not-found" for unknown barcodes, "unavailable" for network issues
- All new components must support dark mode
