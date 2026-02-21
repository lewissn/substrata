"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// MobileSearchBar — floating glassmorphism pill for mobile
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
  const [focused, setFocused] = useState(false);

  return (
    <div
      className="fixed left-4 right-4 z-30"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
    >
      <div
        className={[
          "flex items-center rounded-2xl overflow-hidden",
          "bg-[rgba(10,10,12,0.76)] backdrop-blur-2xl",
          "shadow-[0_12px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]",
          "border transition-colors duration-200",
          focused
            ? "border-[rgba(44,111,116,0.45)]"
            : "border-[rgba(255,255,255,0.10)]",
        ].join(" ")}
      >
        {/* Search icon */}
        <div className="pl-4 pr-2.5 flex-shrink-0 text-zinc-500">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Input */}
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onGeocode(); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search places..."
          className="flex-1 min-w-0 bg-transparent py-3.5 text-[16px] text-zinc-100 placeholder:text-zinc-500 outline-none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
        />

        {/* Divider */}
        <div className="flex-shrink-0 w-px h-4 mx-0.5 bg-[rgba(255,255,255,0.08)]" />

        {/* Search area CTA */}
        <button
          onClick={onSearchArea}
          disabled={loading}
          className="flex-shrink-0 px-4 py-3.5 text-[13px] font-semibold text-[#89CDD1] hover:text-[#B0E5E8] active:opacity-60 transition-opacity disabled:opacity-40 whitespace-nowrap"
          aria-label="Search this area"
        >
          {loading ? "···" : "Search"}
        </button>
      </div>
    </div>
  );
}
