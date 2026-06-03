# Sprint 3: Backend — Cloud Functions

**Duration**: June 3 – June 9, 2026
**Goal**: Firebase Cloud Functions for barcode lookup (Open Food Facts), image analysis (Gemini API), scoring engine, and Firestore security rules.
**Branch**: `feature/sprint-3`

---

## 📋 Prioritized Task List

| Priority | Task | Effort | Dependencies |
|----------|------|--------|-------------|
| **P0** | 3.1 — `firebase init functions` (TypeScript) | S | 1.3 (Firebase project + Blaze billing) |
| **P0** | 3.2 — `lookUpBarcode` — Open Food Facts API | M | 3.1 |
| **P0** | 3.3 — `analyzeFoodImage` — Gemini API | M | 3.1 |
| **P1** | 3.4 — Scoring engine (pure function) | M | 3.2, 3.3 |
| **P1** | 3.5 — Firestore security rules (per-user) | S | 1.3 |

**Legend**: P0 = Blocking, P1 = Important

---

## ✅ Success Criteria

- [ ] `firebase init functions` creates a TypeScript functions project under `functions/`
- [ ] `lookUpBarcode({ barcode })` returns product data from Open Food Facts
- [ ] `analyzeFoodImage({ imageBase64 })` returns structured food data via Gemini API
- [ ] Scoring engine produces health_score, nutriscore, good/bad factors
- [ ] Firestore rules lock data to the authenticated user only
- [ ] `firebase deploy --only functions` succeeds (requires Blaze billing)
- [ ] Client-side callable function wrappers in `src/lib/functions.ts` work

---

## 🧩 Task Breakdown

### 3.1 — Firebase Init Functions

**Command**:
```bash
firebase init functions
```
- Language: TypeScript
- ESLint: Yes
- Dependencies: `node-fetch` (for Open Food Facts), `@google-cloud/vertexai`
- Location: `us-central1` (same as Firestore)

**Files created**:
- `functions/src/index.ts` — Function exports
- `functions/src/scan.ts` — `lookUpBarcode`, `analyzeFoodImage`
- `functions/src/scoring.ts` — Scoring engine
- `functions/package.json`
- `functions/tsconfig.json`

---

### 3.2 — lookUpBarcode

**File**: `functions/src/scan.ts`

- Callable function: `lookUpBarcode`
- Calls Open Food Facts API: `https://world.openfoodfacts.org/api/v2/product/{barcode}`
- Returns: `{ product_name, brands, nutriments, ingredients, nova_group, additives, allergens, ecoscore, nutriscore }`
- Error handling: invalid barcode, network failure, rate limiting
- Caching: cache results in Firestore for 24h

**Acceptance**: Calling `lookUpBarcode("3017620422003")` returns Nutella data.

---

### 3.3 — analyzeFoodImage

**File**: `functions/src/scan.ts`

- Callable function: `analyzeFoodImage`
- Takes base64-encoded image
- Uses Gemini API (`@google-cloud/vertexai` or direct REST) to analyze the food image
- Returns structured JSON: `{ product_name, estimated_nutriments, ingredients_detected, packaging_info }`
- Error handling: invalid image, API failure, content moderation rejection

**Acceptance**: Calling with a food photo returns structured nutritional data.

---

### 3.4 — Scoring Engine

**File**: `functions/src/scoring.ts`

- Pure function (no I/O): `calculateHealthScore(product)`
- Input: normalized product data from either barcode or image analysis
- Output:
  ```typescript
  {
    health_score: number;     // 0–100
    nutriscore: string;       // "A" | "B" | "C" | "D" | "E"
    ecoscore?: string;        // "A"–"E" or null
    nova_group?: number;      // 1–4 or null
    good_factors: Factor[];
    bad_factors: Factor[];
  }
  ```
- Algorithm: per PROJECT_BRIEF.md pseudocode

**Acceptance**: Given known nutritional values, the function returns the correct health score.

---

### 3.5 — Firestore Security Rules

**File**: `firestore.rules`

- Update from locked-down to per-user data isolation:
  ```
  match /users/{userId}/scans/{scanId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```
- Deny all other paths

**Acceptance**: Only authenticated users can read/write their own scan data.

---

## 📦 Dependencies

```bash
# In functions/
npm install node-fetch@2 @google-cloud/vertexai firebase-admin firebase-functions
npm install -D typescript @types/node
```

---

## 📁 Files to Create/Modify

```
functions/
├── src/
│   ├── index.ts          # Function exports
│   ├── scan.ts           # lookUpBarcode, analyzeFoodImage
│   └── scoring.ts        # Scoring engine
├── package.json
├── tsconfig.json
└── .eslintrc.js

firestore.rules            # Updated with per-user rules
src/lib/functions.ts       # Client-side callable wrappers
src/lib/scoring.ts         # Client-side display helpers (for results page)
```

---

## 🤖 Dev Team Briefing

### Sage (Backend — primary)
- `firebase init functions` with TypeScript
- Build `lookUpBarcode` with Open Food Facts + Firestore caching
- Build `analyzeFoodImage` with Gemini API
- Build scoring engine as pure function
- Update Firestore security rules
- Create client-side wrappers in `src/lib/functions.ts`

### Nova (Frontend — supporting)
- Create `src/lib/functions.ts` — callable Cloud Function wrappers
- Create `src/lib/scoring.ts` — client-side display helpers (labels, colors)

### Milo (Visual — supporting)
- Review and add visual polish to error states from Cloud Functions

## Constraints
- All Cloud Functions are `onCall` (not `onRequest`) for auth context
- No hardcoded API keys — use Firebase Secrets or env vars
- Gemini API key stored in Firebase Secrets
- Static export still required — client calls functions via `firebase/functions`
