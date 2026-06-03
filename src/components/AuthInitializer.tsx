"use client";

import { useEffect } from "react";
import { initAuth } from "@/lib/firebase";

/**
 * This component handles silent anonymous authentication on page load.
 * It renders nothing — fires once and cleans up.
 */
export function AuthInitializer() {
  useEffect(() => {
    initAuth();
  }, []);

  return null;
}
