"use client";

import Feed from "@/components/Feed";
import type { PlaceCard } from "@/domain/placeCard";

// ---------------------------------------------------------------------------
// FeedSheet — mobile feed content inside bottom sheet
// ---------------------------------------------------------------------------

export default function FeedSheet({
  cards,
  newCardIds,
  loading,
  error,
  onCardSelect,
  onSearchArea,
  onSurpriseMe,
}: {
  cards: PlaceCard[];
  newCardIds: Set<string>;
  loading: boolean;
  error: string | null;
  onCardSelect: (card: PlaceCard) => void;
  onSearchArea: () => void;
  onSurpriseMe: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.05)]">
        <div>
          <h1 className="text-[14px] font-semibold tracking-tight text-zinc-100">
            Substrata
          </h1>
          <span className="text-[10px] text-zinc-600">
            {cards.length > 0 ? `${cards.length} places` : "Explore layers of time"}
          </span>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={onSurpriseMe}
            disabled={cards.length === 0}
            className="px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] text-zinc-300 text-[11px] font-medium transition disabled:opacity-30 min-h-[36px]"
          >
            Surprise me
          </button>
          <button
            onClick={onSearchArea}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-[rgba(var(--accent),0.32)] bg-[rgba(var(--accent),0.12)] text-zinc-50 text-[11px] font-semibold transition disabled:opacity-50 min-h-[36px]"
          >
            {loading ? "..." : "Search area"}
          </button>
        </div>
      </div>

      {/* ── Feed ── */}
      <Feed
        cards={cards}
        newCardIds={newCardIds}
        loading={loading}
        error={error}
        onCardSelect={onCardSelect}
      />
    </div>
  );
}
