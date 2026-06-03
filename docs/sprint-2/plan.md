# Sprint 2: Scanning

**Duration**: June 3 – June 9, 2026
**Goal**: Build the scanner page with camera, barcode, and photo upload input modes.
**Branch**: `feature/sprint-2`

---

## 📋 Prioritized Task List

| Priority | Task | Effort | Dependencies |
|----------|------|--------|-------------|
| **P0** | 2.1 — Build CameraScanner component (WebRTC + canvas capture) | M | 1.1 |
| **P0** | 2.2 — Build BarcodeScanner component (`html5-qrcode`) | M | 1.1 |
| **P1** | 2.3 — Build PhotoUpload component (drag & drop + file picker) | S | 1.1 |
| **P1** | 2.4 — Create Scan page with all three input modes | M | 2.1, 2.2, 2.3 |

**Legend**: P0 = Blocking, P1 = Important

---

## ✅ Success Criteria

By end of Sprint 2:

- [ ] Camera feed displays on `/scan` (permission prompt handled gracefully)
- [ ] Canvas capture takes a snapshot when user taps "Capture"
- [ ] Barcode scanner decodes a test barcode via `html5-qrcode`
- [ ] Photo upload lets user select/drop an image file
- [ ] All three modes toggle cleanly on the Scan page
- [ ] Error states handled: camera denied, no camera, invalid file type
- [ ] No console errors, no regressions in existing PWA functionality
- [ ] Build + deploy succeeds

---

## 🧩 Task Breakdown

### 2.1 — CameraScanner Component

**File**: `src/components/scanner/CameraScanner.tsx`

- Uses `navigator.mediaDevices.getUserMedia` for WebRTC camera access
- `useCamera` hook (`src/hooks/useCamera.ts`) — manages stream lifecycle
- Canvas capture: renders video to hidden canvas, returns base64 snapshot
- States: `idle`, `requesting`, `streaming`, `error`, `captured`
- Graceful fallback if camera is denied or unavailable

**Acceptance**: Camera feed visible, tap "Capture" gets a snapshot, errors are user-friendly.

### 2.2 — BarcodeScanner Component

**File**: `src/components/scanner/BarcodeScanner.tsx`

- Uses `html5-qrcode` library
- `useBarcode` hook (`src/hooks/useBarcode.ts`) — manages scanner lifecycle
- Scans from camera feed; returns decoded barcode string
- States: `idle`, `scanning`, `found`, `error`
- Cleanup: stops scanner on unmount

**Acceptance**: Points camera at a barcode, decodes it, returns the string.

### 2.3 — PhotoUpload Component

**File**: `src/components/scanner/PhotoUpload.tsx`

- Drag & drop zone with file picker fallback
- Accepts: `image/*` only
- Validates: file type, file size (max 10MB)
- Returns: base64 data URL or `File` object
- States: `idle`, `selected`, `error`

**Acceptance**: User can drag an image or click to pick; invalid files show error.

### 2.4 — Scan Page

**File**: `src/app/scan/page.tsx`

- Tabs or buttons to switch between: Camera, Barcode, Upload
- Shows the selected scanner component
- Displays the captured/decoded result below
- "Analyze" button (placeholder — will connect to Cloud Functions in Sprint 3)
- Navigation from home page to scan page

**Acceptance**: All three modes work, results display, responsive layout.

---

## 📦 Dependencies to Install

```bash
npm install html5-qrcode lucide-react zustand
```

---

## 📁 Files to Create

```
src/
├── components/
│   └── scanner/
│       ├── CameraScanner.tsx
│       ├── BarcodeScanner.tsx
│       └── PhotoUpload.tsx
├── hooks/
│   ├── useCamera.ts
│   └── useBarcode.ts
├── app/
│   └── scan/
│       └── page.tsx
└── types/
    └── index.ts
```

---

## 🤖 Dev Team Briefing

### Nova (Frontend)
- Build CameraScanner, BarcodeScanner, PhotoUpload as focused components
- Create `useCamera` and `useBarcode` hooks for lifecycle management
- Build the Scan page with tab switching and result display

### Sage (Backend)
- Install `html5-qrcode`, `lucide-react`, `zustand`
- Create `src/types/index.ts` with scan-related types
- Wire up the scanner components to work with the existing Firebase setup

### Milo (Visual)
- Ensure scanner UI is responsive and works on mobile viewports
- Add camera permission overlay, error states with clear messaging
- Dark mode support for scanner components
- Smooth transitions between scan modes

## Constraints
- All scanner components are client-side only ("use client")
- Assume no backend for now — results are local/UI only this sprint
- Camera permission must be requested on user gesture (not on page load)
- Must handle iOS Safari quirks (no `userMedia` without `https` or localhost)
