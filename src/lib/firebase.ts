import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only on the client side and only once
export const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Lazily initialize analytics. Returns null on the server or if unsupported.
 */
let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

export async function getAnalyticsInstance(): Promise<ReturnType<typeof getAnalytics> | null> {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;
  const supported = await isSupported();
  if (supported) {
    analyticsInstance = getAnalytics(app);
  }
  return analyticsInstance;
}

/**
 * Initialize anonymous authentication silently on page load.
 * Call this once in a useEffect or in a root component layout.
 * Returns an unsubscribe function to clean up the listener.
 */
export function initAuth(): () => void {
  if (typeof window === "undefined") return () => {};

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      signInAnonymously(auth).catch((error) => {
        // Silent fail — anonymous auth may not be enabled yet
        console.warn("Anonymous auth failed:", error.code);
      });
    }
  });

  return unsubscribe;
}
