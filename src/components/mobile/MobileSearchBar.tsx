"use client";

// ---------------------------------------------------------------------------
// MobileSearchBar — floating search bar for mobile
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
  return (
    <div
      className="fixed top-3 left-3 right-3 z-30 rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(9,9,11,0.95)] backdrop-blur-xl shadow-drawer"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex items-center gap-1.5 p-2">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onGeocode();
          }}
          placeholder="Navigate to a place..."
          className="flex-1 min-h-[44px] px-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-zinc-100 text-[16px] placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.30)] focus:border-[rgba(var(--accent),0.30)] transition"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        <button
          onClick={onGeocode}
          className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] text-zinc-200 text-sm font-medium transition"
          aria-label="Go to location"
        >
          Go
        </button>

        <button
          onClick={onSearchArea}
          disabled={loading}
          className="min-h-[44px] px-3 rounded-xl border border-[rgba(var(--accent),0.32)] bg-[rgba(var(--accent),0.12)] hover:bg-[rgba(var(--accent),0.18)] text-zinc-50 text-sm font-semibold transition disabled:opacity-50"
          aria-label="Search this area"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>
    </div>
  );
}
