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
  onOpenDiscover,
}: {
  cards: PlaceCard[];
  newCardIds: Set<string>;
  loading: boolean;
  error: string | null;
  onCardSelect: (card: PlaceCard) => void;
  onSearchArea: () => void;
  onSurpriseMe: () => void;
  onOpenDiscover?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-[14px] font-semibold tracking-tight text-zinc-100">
              Substrata
            </h1>
            <span className="text-[10px] text-zinc-600">
              {cards.length > 0 ? `${cards.length} places` : "Explore layers of time"}
            </span>
          </div>
          {onOpenDiscover && (
            <button
              onClick={onOpenDiscover}
              className="ml-1 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-zinc-500 hover:text-zinc-300 text-[10px] transition"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Archive
            </button>
          )}
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
            className="px-3 py-2 rounded-xl border border-[rgba(44,111,116,0.50)] bg-[#1F5A5C] hover:bg-[#2C6F74] text-zinc-50 text-[11px] font-semibold transition disabled:opacity-50 min-h-[36px]"
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
