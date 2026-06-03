# FoodLens 🥗📸

A **Progressive Web App** that scans food via camera, barcode, or photo upload and returns an honest **Good & Bad** nutritional review — powered by Gemini Vision and DeepSeek AI.

**Live**: https://foodlens-pwa-1780465145.web.app

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Camera Scan** | Point your camera at any food product — WebRTC + canvas capture |
| **Barcode Scan** | Scan product barcodes via `html5-qrcode` — looks up Open Food Facts |
| **Photo Upload** | Drag & drop or pick a food label image |
| **Health Score** | 0–100 score with color-coded circular gauge |
| **Nutri-Score** | A–E badge based on EU nutritional standards |
| **NOVA Class** | 1–4 processing level indicator |
| **Good & Bad Analysis** | Factor breakdown with ±score badges |
| **Allergen Alerts** | Red/warning banners for detected allergens and risk flags |
| **Offline Support** | Service worker with Serwist, offline fallback page |
| **PWA Installable** | Manifest, icons, standalone mode |

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, static export) |
| **PWA** | @serwist/next — manifest, SW, offline page |
| **Styling** | Tailwind CSS v4 |
| **UI Icons** | Lucide React |
| **Hosting** | Firebase Hosting |
| **Database** | Firestore (Native, us-central1) |
| **Auth** | Firebase Authentication (Anonymous) |
| **Backend** | Firebase Cloud Functions (Node.js 22) |
| **Barcode API** | Open Food Facts |
| **Vision AI** | Gemini 2.5 Flash |
| **Review AI** | DeepSeek V4 |

---

## 📁 Project Structure

```
food-scanner-app/
├── functions/                    # Firebase Cloud Functions (TypeScript)
│   └── src/
│       ├── index.ts              # Function exports (3 callable functions)
│       ├── scan.ts               # lookUpBarcode + analyzeFoodImage handlers
│       ├── scoring.ts            # Health score engine (pure function)
│       └── review.ts             # DeepSeek AI review generation
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── offline.html              # Offline fallback
│   ├── sw.js                     # Service worker (generated)
│   └── icons/                    # PWA icons (192px, 512px, maskable)
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Home page
│   │   ├── scan/page.tsx         # Scanner page (camera, barcode, upload)
│   │   ├── results/page.tsx      # Results page (score, factors, alerts)
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── scanner/              # CameraScanner, BarcodeScanner, PhotoUpload
│   │   └── results/              # HealthScoreGauge, NutriScoreBadge, NovaBadge, AllergenAlert
│   ├── hooks/                    # useCamera, useBarcode
│   ├── lib/                      # firebase, functions, firestore, scoring (client)
│   └── types/                    # Shared TypeScript types
├── firestore.rules               # Per-user data isolation
├── firebase.json                 # Firebase config
└── .firebaserc                   # Project alias
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- npm
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Blaze billing plan

### Setup

```bash
# 1. Install dependencies
npm install
cd functions && npm install && cd ..

# 2. Set Firebase project
firebase use foodlens-pwa-1780465145

# 3. Set API keys as Firebase Secrets
echo "YOUR_GEMINI_API_KEY" | firebase functions:secrets:set GEMINI_API_KEY
echo "YOUR_DEEPSEEK_API_KEY" | firebase functions:secrets:set DEEPSEEK_API_KEY

# 4. Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase project config values

# 5. Run locally
npm run dev -- --webpack
```

### Deploy

```bash
# Build client
npm run build

# Deploy everything
firebase deploy

# Or deploy individually
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
```

---

## ☁️ Cloud Functions

| Function | Trigger | Description |
|----------|---------|-------------|
| `lookUpBarcode` | `onCall` | Looks up a product by barcode via Open Food Facts API, runs scoring engine |
| `analyzeFoodImage` | `onCall` | Analyzes a food image via Gemini 2.5 Flash, extracts nutrition data |
| `generateFoodReview` | `onCall` | Generates Good & Bad review via DeepSeek V4, including alternatives |

### Client Usage

```typescript
import { lookUpBarcode, analyzeFoodImage, generateFoodReview } from "@/lib/functions";

// Barcode lookup
const result = await lookUpBarcode("3017620422003");

// Image analysis
const result = await analyzeFoodImage(base64Data, "image/jpeg");

// DeepSeek review
const review = await generateFoodReview({
  product_name: "Chocolate Chip Cookie",
  ingredients: ["wheat flour", "sugar", "palm oil"],
  nutriments: { sugars_100g: 22, fiber_100g: 1.2 },
  nova_group: 4,
  additives: ["emulsifier"],
  allergens: ["gluten", "milk"],
});
```

---

## 🧮 Scoring Engine

The health score (0–100) is calculated from:

| Factor | Range | Source |
|--------|-------|--------|
| Fiber content | 0 to +15 | Per 100g |
| Protein quality | 0 to +10 | Per 100g |
| Sugar penalty | 0 to -15 | Per 100g |
| Saturated fat penalty | 0 to -10 | Per 100g |
| Sodium penalty | 0 to -10 | Per 100g |
| NOVA processing | 0 to -15 | Processing level |
| Additives | 0 to -10 | Count |

Nutri-Score (A–E) is calculated per EU standards based on fiber, protein, sugar, saturated fat, and sodium.

---

## 🔐 Firestore Security Rules

```
users/{userId}/scans/{scanId}   — Auth required, same UID, required fields
users/{userId}/profile/{path}   — Auth required, same UID, size limit, field whitelist
```

---

## 🧪 QA

QA sign-off documents are in `docs/qa/`. Each sprint has a sign-off report with bug list and pass/fail status.

Current status: **Sprint 4 ✅ PASS**

---

## 📋 Roadmap

| Sprint | Phase | Status |
|--------|-------|--------|
| 1 | PWA Foundation | ✅ Complete |
| 2 | Scanning | ✅ Complete |
| 3 | Backend (Cloud Functions) | ✅ Complete |
| 4 | Results & Scoring UI | ✅ Complete |
| 5 | User Features | Upcoming |

---

## 📄 License

MIT
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
