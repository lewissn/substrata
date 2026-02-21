"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// MobileSearchBar — collapsed icon → expanded glassmorphism search bar
// ---------------------------------------------------------------------------

export default function MobileSearchBar({
  query,
  onQueryChange,
  onGeocode,
  onSearchArea,
  loading,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  onGeocode: () => void;
  onSearchArea: () => void;
  loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input after expansion animation begins
  useEffect(() => {
    if (!expanded) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [expanded]);

  const collapse = () => {
    setExpanded(false);
    setFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div
      className="fixed left-4 z-30"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
    >
      {/* ── Container — morphs between circle and pill ── */}
      <div
        className={[
          "flex items-center overflow-hidden",
          // Slightly more transparent than before — it's a peek element, not a primary bar
          "bg-[rgba(10,10,12,0.60)] backdrop-blur-2xl",
          "shadow-[0_8px_28px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.07)]",
          "border",
          focused
            ? "border-[rgba(44,111,116,0.45)]"
            : expanded
            ? "border-[rgba(255,255,255,0.09)]"
            : "border-[rgba(255,255,255,0.08)]",
        ].join(" ")}
        style={{
          height: "44px",
          // Expand rightward to just inside the right safe margin
          width: expanded ? "calc(100vw - 32px)" : "44px",
          borderRadius: expanded ? "14px" : "50%",
          transition:
            "width 320ms cubic-bezier(0.4,0,0.2,1), " +
            "border-radius 320ms cubic-bezier(0.4,0,0.2,1), " +
            "border-color 200ms ease",
        }}
      >
        {/* ── Search icon button ── */}
        <button
          onClick={() => !expanded && setExpanded(true)}
          className="w-11 h-11 flex-shrink-0 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors duration-150"
          aria-label="Search places"
          tabIndex={expanded ? -1 : 0}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* ── Input — always in DOM so opacity can animate ── */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onGeocode();
            if (e.key === "Escape") collapse();
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search places..."
          className="flex-1 min-w-0 bg-transparent text-[16px] text-zinc-100 placeholder:text-zinc-500 outline-none"
          style={{
            // Fade in with slight delay so the bar finishes expanding before text appears
            opacity: expanded ? 1 : 0,
            pointerEvents: expanded ? "auto" : "none",
            transition: expanded
              ? "opacity 200ms ease 160ms"  // delay when opening
              : "opacity 120ms ease",       // fast fade when closing
          }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          tabIndex={expanded ? 0 : -1}
        />

        {/* ── Controls — rendered only when expanded (clipped in during animation) ── */}
        {expanded && (
          <>
            <div className="flex-shrink-0 w-px h-4 bg-[rgba(255,255,255,0.08)]" />
            <button
              onClick={onSearchArea}
              disabled={loading}
              className="flex-shrink-0 px-3.5 h-11 flex items-center text-[13px] font-semibold text-[#89CDD1] hover:text-[#B0E5E8] active:opacity-60 transition-opacity disabled:opacity-40 whitespace-nowrap"
              aria-label="Search this area"
            >
              {loading ? "···" : "Search"}
            </button>

            {/* Dismiss */}
            <button
              onClick={collapse}
              className="flex-shrink-0 w-10 h-11 flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors duration-150"
              aria-label="Close search"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
