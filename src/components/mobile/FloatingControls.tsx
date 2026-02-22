"use client";

import { useEffect, useState } from "react";
import type { SnapPoint } from "@/hooks/useBottomSheet";

// ---------------------------------------------------------------------------
// FloatingControls — mobile map FABs
// ---------------------------------------------------------------------------

const DT_HINT_KEY = "substrata_dt_hinted";
const PIN_HINT_KEY = "substrata_pin_hinted";

export default function FloatingControls({
  onOpenPlace,
  onOpenFeed,
  onOpenTime,
  onOpenFinds,
  onOpenArchive,
  onToggleSave,
  onActivateDropPin,
  sheetSnap,
  hasActiveFilters,
  isCardSelected,
  isCardSaved,
  dropPinMode,
  hasActivePlace,
}: {
  onOpenPlace: () => void;
  onOpenFeed: () => void;
  onOpenTime: () => void;
  onOpenFinds: () => void;
  onOpenArchive: () => void;
  onToggleSave: () => void;
  onActivateDropPin: () => void;
  sheetSnap: SnapPoint;
  hasActiveFilters: boolean;
  isCardSelected: boolean;
  isCardSaved: boolean;
  dropPinMode: boolean;
  hasActivePlace: boolean;
}) {
  const [clockPulse, setClockPulse] = useState(false);
  const [showDtHint, setShowDtHint] = useState(false);
  const [showPinHint, setShowPinHint] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DT_HINT_KEY)) {
      setClockPulse(true);
      setShowDtHint(true);
    }
    if (!localStorage.getItem(PIN_HINT_KEY)) {
      setShowPinHint(true);
    }
  }, []);

  const handleOpenTime = () => {
    if (clockPulse) {
      localStorage.setItem(DT_HINT_KEY, "1");
      setClockPulse(false);
      setShowDtHint(false);
    }
    onOpenTime();
  };

  const handleOpenPlace = () => {
    if (showPinHint) {
      localStorage.setItem(PIN_HINT_KEY, "1");
      setShowPinHint(false);
    }
    onOpenPlace();
  };

  const handleBookmark = () => {
    if (isCardSelected) {
      onToggleSave();
    } else {
      onOpenFinds();
    }
  };

  // Hide when sheet is expanded — controls are inside the sheet
  if (sheetSnap !== "collapsed") return null;

  return (
    <div
      className="fixed right-3 z-20 flex flex-col gap-2"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 108px)" }}
    >
      {/* This Place / Drop Pin button */}
      <div className="relative">
        {showPinHint && (
          <div className="absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none z-30">
            <div className="bg-[rgba(9,9,11,0.97)] border border-[rgba(44,111,116,0.35)] rounded-lg px-2.5 py-1.5 shadow-drawer">
              <span className="text-[10px] text-[#89CDD1] font-medium">
                Explore this place through time
              </span>
            </div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 border-y-[4px] border-y-transparent border-l-[5px] border-l-[rgba(44,111,116,0.45)]" />
          </div>
        )}
        <button
          onClick={handleOpenPlace}
          className={[
            "relative w-11 h-11 rounded-full border backdrop-blur-xl shadow-drawer flex items-center justify-center transition active:scale-95",
            hasActivePlace || dropPinMode
              ? "border-[rgba(44,111,116,0.55)] bg-[rgba(9,9,11,0.97)] text-[#89CDD1]"
              : "border-[rgba(255,255,255,0.09)] bg-[rgba(9,9,11,0.95)] text-zinc-300",
          ].join(" ")}
          aria-label="This Place Through Time"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={hasActivePlace ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            {!hasActivePlace && <circle cx="12" cy="9" r="2.5" />}
          </svg>
          {hasActivePlace && (
            <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#3A9096]" />
          )}
        </button>
      </div>

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

      {/* Time / Deep Time toggle */}
      <div className="relative">
        {showDtHint && (
          <div className="absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none z-30">
            <div className="bg-[rgba(9,9,11,0.97)] border border-[rgba(44,111,116,0.35)] rounded-lg px-2.5 py-1.5 shadow-drawer">
              <span className="text-[10px] text-[#89CDD1] font-medium">Explore Deep Time</span>
            </div>
            <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 border-y-[4px] border-y-transparent border-l-[5px] border-l-[rgba(44,111,116,0.45)]" />
          </div>
        )}
        <button
          onClick={handleOpenTime}
          className={[
            "relative w-11 flex flex-col items-center justify-center gap-0.5 rounded-full border border-[rgba(255,255,255,0.09)] bg-[rgba(9,9,11,0.95)] backdrop-blur-xl shadow-drawer text-zinc-300 transition active:scale-95 py-1.5",
            clockPulse ? "animate-clock-pulse" : "",
          ].join(" ")}
          style={{ minHeight: "44px" }}
          aria-label="Open time and filter controls"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-[9px] text-zinc-500 leading-none">Time</span>
          {hasActiveFilters && (
            <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#2C6F74]" />
          )}
        </button>
      </div>

      {/* Archive — curated articles */}
      <button
        onClick={onOpenArchive}
        className="w-11 h-11 rounded-full border border-[rgba(255,255,255,0.09)] bg-[rgba(9,9,11,0.95)] backdrop-blur-xl shadow-drawer flex items-center justify-center text-zinc-300 transition active:scale-95 min-h-[44px] min-w-[44px]"
        aria-label="Open archive"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </button>

      {/* Bookmark — save current card or open My Finds */}
      <button
        onClick={handleBookmark}
        className={[
          "w-11 h-11 rounded-full border bg-[rgba(9,9,11,0.95)] backdrop-blur-xl shadow-drawer flex items-center justify-center transition active:scale-95",
          isCardSelected && isCardSaved
            ? "border-[rgba(44,111,116,0.45)] text-[#89CDD1]"
            : "border-[rgba(255,255,255,0.09)] text-zinc-300",
        ].join(" ")}
        aria-label={
          isCardSelected
            ? isCardSaved
              ? "Remove from My Finds"
              : "Save to My Finds"
            : "Open My Finds"
        }
      >
        {isCardSelected && isCardSaved ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
