"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// InstallPrompt — Android/Chrome "Add to Home Screen" prompt.
//
// iOS does not fire beforeinstallprompt; those users reach the same outcome
// via Safari's Share → Add to Home Screen flow, so we only show this on
// platforms that support the Web Install API.
//
// Shown once per session. Renders a compact strip inside the time/filters
// panel — non-intrusive and contextually appropriate.
// ---------------------------------------------------------------------------

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Avoid showing if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Only once per session
    if (sessionStorage.getItem("install-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!prompt || dismissed) return null;

  const handleInstall = async () => {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      setDismissed(true);
      sessionStorage.setItem("install-dismissed", "1");
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("install-dismissed", "1");
  };

  return (
    <div className="mx-4 mb-3 rounded-xl border border-[rgba(44,111,116,0.22)] bg-[rgba(31,90,92,0.10)] px-3.5 py-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-[12px] font-medium text-zinc-300 leading-snug">
          Install Substrata
        </p>
        <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
          Add to your home screen for a faster, app-like experience.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#1F5A5C] hover:bg-[#2C6F74] text-zinc-50 transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-zinc-600 hover:text-zinc-400 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
