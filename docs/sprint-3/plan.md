# Sprint 3: Backend — Cloud Functions

**Duration**: June 3 – June 9, 2026
**Goal**: Firebase Cloud Functions for barcode lookup (Open Food Facts), image analysis (Gemini API), AI-powered review (DeepSeek API), function orchestration, and Firestore security rules.
**Branch**: `feature/sprint-3`

---

## 📋 Prioritized Task List

| Priority | Task | Effort | Dependencies |
|----------|------|--------|-------------|
| **P0** | 3.1 — `firebase init functions` (TypeScript) | S | 1.3 (Firebase project + Blaze billing) |
| **P0** | 3.2 — `lookUpBarcode` — Open Food Facts API | M | 3.1 |
| **P0** | 3.3 — `analyzeFoodImage` — Gemini API (vision) | M | 3.1 |
| **P0** | 3.4 — `generateReview` — DeepSeek API (scoring) | M | 3.1 |
| **P1** | 3.5 — Cloud Function orchestration (chain Gemini → DeepSeek) | M | 3.3, 3.4 |
| **P1** | 3.6 — Firestore security rules (per-user) | S | 1.3 |

**Legend**: P0 = Blocking, P1 = Important

---

## ✅ Success Criteria

- [ ] `firebase init functions` creates a TypeScript functions project under `functions/`
- [ ] `lookUpBarcode({ barcode })` returns product data from Open Food Facts
- [ ] `analyzeFoodImage({ imageBase64 })` returns structured food data via Gemini API
- [ ] `generateReview({ productData })` returns health score, good/bad points, Nutri-Score, alternatives via DeepSeek API
- [ ] `analyzeFood` orchestrator chains Gemini → DeepSeek, merges results into a single response
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

### 3.4 — `generateReview` — DeepSeek API

**File**: `functions/src/review.ts`

- Callable function: `generateReview`
- Input: structured product data (from either `lookUpBarcode` or `analyzeFoodImage`)
- Calls DeepSeek API with a prompt engineered for balanced Good & Bad analysis
- Returns JSON:
  ```typescript
  {
    health_score: number;        // 0–100
    nutriscore: string;          // "A" | "B" | "C" | "D" | "E"
    good_factors: { title: string; description: string; score_contribution: number }[];
    bad_factors: { title: string; description: string; score_contribution: number }[];
    allergen_warnings: string[];
    alternatives: { name: string; reason: string }[];
  }
  ```
- Prompt template (see PROJECT_BRIEF.md → AI Architecture section for full prompt)
- Error handling: API timeout, malformed response parsing, rate limiting

**Acceptance**: Calling with cookie ingredients returns a balanced review with score, good/bad points, and alternatives.

---

### 3.5 — Cloud Function Orchestration (Gemini → DeepSeek)

**File**: `functions/src/orchestrator.ts`

- Callable function: `analyzeFood` — the single endpoint the PWA calls
- Flow:
  1. Receive image or barcode from client
  2. **If barcode**: call `lookUpBarcode` → get product data → skip to step 5
  3. **If image**: upload to Firebase Storage, call `analyzeFoodImage` (Gemini)
  4. Parse Gemini response into normalized product data
  5. Call `generateReview` (DeepSeek) with normalized data
  6. Merge Gemini output + DeepSeek output into final response
  7. Save final result to Firestore
  8. Return merged result to client
- Fallback: if DeepSeek fails, return Gemini data with a scoring fallback

**Acceptance**: A single `analyzeFood({ imageBase64 })` call returns a complete review with scores.

---

### 3.6 — Firestore Security Rules

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
