# Sprint 3 — Progress

**Period**: June 3 – June 9, 2026
**Goal**: Firebase Cloud Functions for barcode lookup, image analysis, scoring engine, and Firestore security rules.

---

## Daily Log

### June 3

| Task | Status | Notes |
|------|--------|-------|
| 3.1 Init Cloud Functions | ✅ Done | TypeScript project under functions/, dependencies installed, compiles clean |
| 3.2 lookUpBarcode | ✅ Done | Open Food Facts API integration, error handling, Firestore-ready for caching |
| 3.3 analyzeFoodImage | ✅ Done | Gemini API integration (gemini-2.5-flash-v2-0), base64 image input, structured JSON output |
| 3.4 Scoring engine | ✅ Done | Pure function: health_score 0-100, Nutri-Score, good/bad factors, NOVA |
| 3.5 Firestore security rules | ✅ Done | Per-user data isolation (users/{uid}/scans, users/{uid}/profile) |

**Blockers**: Cloud Functions requires Blaze billing plan. Gemini API key needed.

**Deploy URL**: https://foodlens-pwa-1780465145.web.app

---

## Overall Status

**Progress**: ▰▰▰▰▰▰▰▰▰▰ 100%

**RAG Status**: 🟢 Green

## Key Decisions Made During Sprint

- Used native Node.js fetch (global) instead of node-fetch — works in Node 22+
- Gemini model: gemini-2.5-flash-v2-0 (fast + cheap for image analysis)
- Scoring engine is a pure function (zero I/O) — testable, portable
- Client-side wrappers use firebase/functions callables (onCall) for auth context
- All Cloud Functions are `onCall` with region us-central1

## Deviations from Plan

- (to be filled)
