"use client";

import type { SavedPlace } from "@/domain/savedPlaces";
import { ERA_LABELS } from "@/domain/era";
import { formatMa } from "@/domain/time";

// ---------------------------------------------------------------------------
// FindsSheet — "My Finds" list, used in both the mobile sheet and desktop sidebar
// ---------------------------------------------------------------------------

function BookmarkFilledIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function EraLabel({ era, ma }: { era: string; ma: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-zinc-600 uppercase tracking-wide">
        {ERA_LABELS[era as never] ?? era}
      </span>
      {ma > 0 && (
        <>
          <span className="text-zinc-700 text-[10px]">·</span>
          <span className="text-[10px] text-zinc-600">{formatMa(ma)}</span>
        </>
      )}
    </div>
  );
}

export default function FindsSheet({
  saves,
  onSelect,
  onUnsave,
}: {
  saves: SavedPlace[];
  onSelect: (place: SavedPlace) => void;
  onUnsave: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-4 pb-3 border-b border-[rgba(255,255,255,0.05)]">
        <h2 className="text-[14px] font-semibold tracking-tight text-zinc-100">My Finds</h2>
        <span className="text-[10px] text-zinc-600">
          {saves.length === 0
            ? "No saved places yet"
            : `${saves.length} saved place${saves.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto sheet-container">
        {saves.length === 0 ? (
          <div className="px-4 pt-10 flex flex-col items-center gap-3 text-center">
            <div className="text-zinc-700">
              <BookmarkFilledIcon />
            </div>
            <p className="text-[12px] text-zinc-600 leading-relaxed max-w-[200px]">
              Tap the bookmark on any place to save it here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {saves.map((place) => (
              <div
                key={place.id}
                className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-[rgba(255,255,255,0.025)] transition group"
                onClick={() => onSelect(place)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-zinc-200 font-medium truncate leading-snug">
                    {place.title}
                  </div>
                  <div className="mt-0.5">
                    <EraLabel era={place.era} ma={place.ma} />
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnsave(place.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition text-zinc-600 hover:text-zinc-300 p-1 rounded-md"
                  aria-label="Remove from My Finds"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
