"use client";

import { useState } from "react";
import Feed from "@/components/Feed";
import EraChips from "@/components/EraChips";
import { Chip, KIND_CHIPS } from "@/components/ui/Chip";
import { WANDER_PLACES } from "@/domain/wanderPlaces";
import type { Era, PlaceCard, PlaceKind, PlaceSource } from "@/domain/placeCard";

// ---------------------------------------------------------------------------
// FeedSheet — mobile feed content inside bottom sheet
// Now owns era/source/kind filters so the Time sheet can focus on Deep Time.
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
  onWander,
  activeEra,
  onEraChange,
  activeSources,
  onToggleSource,
  activeKinds,
  onToggleKind,
  hasActiveFilters,
  onResetFilters,
  hasPbdb,
}: {
  cards: PlaceCard[];
  newCardIds: Set<string>;
  loading: boolean;
  error: string | null;
  onCardSelect: (card: PlaceCard) => void;
  onSearchArea: () => void;
  onSurpriseMe: () => void;
  onOpenDiscover?: () => void;
  onWander?: (coords: [number, number]) => void;
  activeEra: Era | null;
  onEraChange: (era: Era | null) => void;
  activeSources: PlaceSource[];
  onToggleSource: (s: PlaceSource) => void;
  activeKinds: PlaceKind[];
  onToggleKind: (k: PlaceKind) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  hasPbdb: boolean;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleWander = () => {
    if (!onWander) return;
    const place = WANDER_PLACES[Math.floor(Math.random() * WANDER_PLACES.length)];
    onWander([place.lng, place.lat]);
  };

  // Count active filter groups (for the badge)
  const activeFilterCount =
    (activeEra ? 1 : 0) +
    (activeKinds.length > 0 ? 1 : 0) +
    (activeSources.length < (hasPbdb ? 3 : 2) ? 1 : 0);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-4 pb-3 border-b border-[rgba(255,255,255,0.05)]">
        {/* Title row */}
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h1 className="text-[14px] font-semibold tracking-tight text-zinc-100">
              Substrata
            </h1>
            <span className="text-[10px] text-zinc-600">
              {cards.length > 0 ? `${cards.length} places nearby` : "Explore layers of time"}
            </span>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={[
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition",
              filtersOpen || activeFilterCount > 0
                ? "border-[rgba(44,111,116,0.40)] bg-[rgba(31,90,92,0.15)] text-[#89CDD1]"
                : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
            aria-label="Toggle filters"
          >
            {/* Sliders icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#1F5A5C] text-zinc-100 text-[9px] flex items-center justify-center font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── 3-column action grid ── */}
        <div className="grid grid-cols-3 gap-2">
          {/* Archive */}
          <button
            onClick={onOpenDiscover}
            className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-zinc-400 hover:text-zinc-200 transition active:scale-95 min-h-[48px]"
            aria-label="Open archive"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Archive</span>
          </button>

          {/* Wander */}
          <button
            onClick={handleWander}
            className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-zinc-400 hover:text-zinc-200 transition active:scale-95 min-h-[48px]"
            aria-label="Wander to a random interesting place"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-[10px] font-medium leading-none">Wander</span>
          </button>

          {/* Search area */}
          <button
            onClick={onSearchArea}
            disabled={loading}
            className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-[rgba(44,111,116,0.50)] bg-[#1F5A5C] hover:bg-[#2C6F74] text-zinc-50 transition active:scale-95 min-h-[48px] disabled:opacity-50"
            aria-label="Search this area"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-[10px] font-semibold leading-none">
              {loading ? "…" : "Search"}
            </span>
          </button>
        </div>

        {/* ── Inline filter panel (expandable) ── */}
        {filtersOpen && (
          <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
            {/* Era */}
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-1.5 font-medium">
                Era
              </div>
              <EraChips activeEra={activeEra} onEraChange={onEraChange} />
            </div>

            {/* Source */}
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-1.5 font-medium">
                Source
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Chip
                  label="Wikipedia"
                  active={activeSources.includes("wikipedia")}
                  onClick={() => onToggleSource("wikipedia")}
                />
                <Chip
                  label="OSM"
                  active={activeSources.includes("osm")}
                  onClick={() => onToggleSource("osm")}
                />
                {hasPbdb && (
                  <Chip
                    label="Fossils"
                    active={activeSources.includes("pbdb")}
                    onClick={() => onToggleSource("pbdb")}
                  />
                )}
              </div>
            </div>

            {/* Type */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-1.5 font-medium">
                Type
              </div>
              <div className="flex flex-wrap gap-1.5">
                {KIND_CHIPS.map(({ kind, label }) => (
                  <Chip
                    key={kind}
                    label={label}
                    active={activeKinds.includes(kind)}
                    onClick={() => onToggleKind(kind)}
                  />
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="mt-2.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition underline underline-offset-2"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}

        {/* Surprise me — secondary, below the grid */}
        {cards.length > 0 && (
          <button
            onClick={onSurpriseMe}
            className="mt-2 w-full text-[10px] text-zinc-600 hover:text-zinc-400 transition py-1 text-center"
          >
            Surprise me with the top pick →
          </button>
        )}
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
