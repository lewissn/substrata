"use client";

import { useEffect } from "react";

// ---------------------------------------------------------------------------
// ServiceWorkerRegistrar — registers /sw.js once on mount (client-only).
// Wrapped in a client component so the server-side root layout can import it.
// ---------------------------------------------------------------------------

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    )
      return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Periodically check for SW updates (every 60 min)
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch((err) => console.warn("[SW] Registration failed:", err));
  }, []);

  return null;
}
