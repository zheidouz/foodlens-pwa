import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  enableMultiTabIndexedDbPersistence,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SavedScan } from "@/types";

/**
 * Enable offline persistence for Firestore (call once on app init).
 */
export async function enableOfflinePersistence(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await enableMultiTabIndexedDbPersistence(db);
  } catch (err: unknown) {
    // Persistence can only be enabled once per tab
    const code = (err as { code?: string })?.code;
    if (code !== "failed-precondition" && code !== "unimplemented") {
      console.warn("Firestore persistence error:", code);
    }
  }
}

/**
 * Save a scan result to Firestore under the user's collection.
 */
export async function saveScan(
  userId: string,
  data: Omit<SavedScan, "id" | "userId" | "createdAt">
): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!userId) return null;

  try {
    const scansRef = collection(db, "users", userId, "scans");
    const docRef = await addDoc(scansRef, {
      ...data,
      userId,
      scannedAt: data.scannedAt instanceof Date ? data.scannedAt : new Date(data.scannedAt),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Failed to save scan:", err);
    return null;
  }
}

/**
 * Get scan history for a user, ordered by most recent.
 */
export async function getScanHistory(
  userId: string,
  maxResults = 50
): Promise<SavedScan[]> {
  if (typeof window === "undefined") return [];
  if (!userId) return [];

  try {
    const scansRef = collection(db, "users", userId, "scans");
    const q = query(scansRef, orderBy("scannedAt", "desc"), limit(maxResults));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as SavedScan[];
  } catch (err) {
    console.error("Failed to fetch scan history:", err);
    return [];
  }
}

/**
 * Get a single scan by ID.
 */
export async function getScanById(
  userId: string,
  scanId: string
): Promise<SavedScan | null> {
  if (typeof window === "undefined") return null;

  try {
    const scanRef = doc(db, "users", userId, "scans", scanId);
    const snapshot = await getDoc(scanRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as SavedScan;
  } catch (err) {
    console.error("Failed to fetch scan:", err);
    return null;
  }
}
