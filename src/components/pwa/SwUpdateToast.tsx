"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// SwUpdateToast — notifies the user when a new service worker is waiting.
// Shown once per updated version; clicking "Refresh" skips the waiting SW
// and reloads the page so the update takes effect immediately.
// ---------------------------------------------------------------------------

export default function SwUpdateToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      // Already have a waiting worker (e.g. page reloaded after install)
      if (reg.waiting) {
        setShow(true);
        return;
      }

      // Watch for a new worker installing
      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setShow(true);
          }
        });
      });
    });
  }, []);

  if (!show) return null;

  const handleRefresh = () => {
    navigator.serviceWorker.ready.then((reg) => {
      reg.waiting?.postMessage({ type: "SKIP_WAITING" });
    });
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true },
    );
  };

  return (
    <div
      className="fixed z-50 pointer-events-auto"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)", right: "16px" }}
    >
      <div className="flex items-center gap-3 rounded-xl border border-[rgba(44,111,116,0.35)] bg-[rgba(9,9,11,0.95)] backdrop-blur-xl px-4 py-3 shadow-drawer">
        <span className="text-[12.5px] text-zinc-300">Update available</span>
        <button
          onClick={handleRefresh}
          className="text-[12.5px] font-semibold text-[#89CDD1] hover:text-[#B0E5E8] transition-colors whitespace-nowrap"
        >
          Refresh →
        </button>
        <button
          onClick={() => setShow(false)}
          className="text-zinc-600 hover:text-zinc-400 transition-colors ml-1"
          aria-label="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
