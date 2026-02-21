"use client";

import type { SnapPoint } from "@/hooks/useBottomSheet";

// ---------------------------------------------------------------------------
// FloatingControls — FABs for mobile map overlay
// ---------------------------------------------------------------------------

export default function FloatingControls({
  onOpenFeed,
  onOpenTime,
  onSurpriseMe,
  sheetSnap,
  hasActiveFilters,
  hasCards,
}: {
  onOpenFeed: () => void;
  onOpenTime: () => void;
  onSurpriseMe: () => void;
  sheetSnap: SnapPoint;
  hasActiveFilters: boolean;
  hasCards: boolean;
}) {
  // Hide when sheet is expanded — controls are inside the sheet
  if (sheetSnap !== "collapsed") return null;

  return (
    <div className="fixed bottom-[108px] right-3 z-20 flex flex-col gap-2">
      {/* List toggle */}
      <button
        onClick={onOpenFeed}
        className="w-11 h-11 rounded-full border border-[rgba(255,255,255,0.09)] bg-[rgba(9,9,11,0.95)] backdrop-blur-xl shadow-drawer flex items-center justify-center text-zinc-300 transition active:scale-95"
        aria-label="Open feed list"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Time/filters toggle */}
      <button
        onClick={onOpenTime}
        className="relative w-11 h-11 rounded-full border border-[rgba(255,255,255,0.09)] bg-[rgba(9,9,11,0.95)] backdrop-blur-xl shadow-drawer flex items-center justify-center text-zinc-300 transition active:scale-95"
        aria-label="Open time and filter controls"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {hasActiveFilters && (
          <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2C6F74]" />
        )}
      </button>

      {/* Surprise me */}
      {hasCards && (
        <button
          onClick={onSurpriseMe}
          className="w-11 h-11 rounded-full border border-[rgba(255,255,255,0.09)] bg-[rgba(9,9,11,0.95)] backdrop-blur-xl shadow-drawer flex items-center justify-center text-zinc-300 transition active:scale-95"
          aria-label="Surprise me — show a random place"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      )}
    </div>
  );
}
