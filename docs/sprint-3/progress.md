# Sprint 3 — Progress

**Period**: June 3 – June 9, 2026
**Goal**: Firebase Cloud Functions for barcode lookup (Open Food Facts), image analysis (Gemini), AI-powered review (DeepSeek), function orchestration, and Firestore security rules.

---

## Daily Log

### June 3

| Task | Status | Notes |
|------|--------|-------|
| 3.1 Init Cloud Functions | ✅ Done | TypeScript project under functions/, dependencies installed, compiles clean |
| 3.2 lookUpBarcode | ✅ Done | Open Food Facts API integration, deployed & live |
| 3.3 analyzeFoodImage | ✅ Done | Gemini API (gemini-2.5-flash-v2-0), deployed & live |
| 3.4 generateReview (DeepSeek) | 🔄 Refining | Replacing old scoring engine with DeepSeek AI review |
| 3.5 Orchestration (Gemini → DeepSeek) | ⏳ Pending | Chain analyzeFoodImage → generateReview, merge results |
| 3.6 Firestore security rules | ✅ Done | Per-user data isolation (users/{uid}/scans, users/{uid}/profile) |

**Blockers**: None. Blaze billing enabled, Gemini API key set as Firebase secret, functions deployed.

**Deploy URL**: https://foodlens-pwa-1780465145.web.app

---

## Overall Status

**Progress**: ▰▰▰▰▰▰▰▰▰▰ 65%

**RAG Status**: 🟡 Yellow — scope refined (DeepSeek integration replaces pure scoring engine)

## Key Decisions Made During Sprint

- Used native Node.js fetch (global) instead of node-fetch — works in Node 22+
- Gemini model: gemini-2.5-flash-v2-0 (fast + cheap for image analysis)
- Scoring engine is a pure function (zero I/O) — testable, portable
- Client-side wrappers use firebase/functions callables (onCall) for auth context
- All Cloud Functions are `onCall` with region us-central1

## Deviations from Plan

- (to be filled)
