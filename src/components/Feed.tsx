"use client";

import type { Era, PlaceCard } from "@/domain/placeCard";
import { ERA_LABELS } from "@/domain/era";
import { formatTimeSpan } from "@/domain/time";

const ERA_BADGE_STYLES: Record<Era, string> = {
  geological: "text-red-400/80",
  prehistoric: "text-amber-400/80",
  ancient: "text-yellow-300/80",
  medieval: "text-sky-400/80",
  modern: "text-zinc-400/70",
};

function formatDistance(m?: number) {
  if (m == null) return "";
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function kindIcon(card: PlaceCard): string {
  if (card.kind === "fossil_occurrence") return "🦴";
  if (card.kind === "castle") return "🏰";
  if (card.kind === "ruins" || card.kind === "archaeological_site") return "🏛";
  if (card.kind === "prehistoric_site" || card.kind === "megalith") return "🗿";
  if (card.kind === "volcano") return "🌋";
  if (card.kind === "battlefield") return "⚔";
  if (card.kind === "impact_crater") return "☄";
  if (card.era === "geological") return "🌍";
  return "📍";
}

function FeedCard({
  card,
  onClick,
  isNew,
}: {
  card: PlaceCard;
  onClick: () => void;
  isNew: boolean;
}) {
  const timeDisplay = formatTimeSpan(card.time);

  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]",
        "p-3.5 hover:bg-[rgba(255,255,255,0.045)] transition-all duration-200",
        "shadow-soft",
        isNew ? "animate-feed-in" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div className="h-[52px] w-[52px] rounded-lg bg-[rgba(255,255,255,0.06)] overflow-hidden flex-shrink-0">
          {card.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs">
              {kindIcon(card)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2 justify-between">
            <div className="font-medium text-[13.5px] leading-snug text-zinc-100 truncate">
              {card.title}
            </div>
            <div className="text-[11px] text-zinc-600 flex-shrink-0 pt-0.5">
              {formatDistance(card.distanceM)}
            </div>
          </div>

          {/* Sub-meta: era + kind */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`text-[11px] font-medium tracking-wide uppercase ${ERA_BADGE_STYLES[card.era]}`}>
              {ERA_LABELS[card.era]}
            </span>
            {timeDisplay && (
              <>
                <span className="text-zinc-700 text-[11px]">·</span>
                <span className="text-[10px] text-zinc-600">{timeDisplay}</span>
              </>
            )}
            <span className="text-zinc-700 text-[11px]">·</span>
            <span className="text-[11px] text-zinc-600">
              {card.source === "wikipedia" ? "Wikipedia" :
               card.source === "pbdb" ? "PBDB" :
               card.kind.replaceAll("_", " ")}
            </span>
          </div>

          {/* Summary */}
          <div className="text-[12.5px] text-zinc-400 leading-relaxed line-clamp-2 mt-1.5">
            {card.summary ?? (
              card.source === "osm" ? "OpenStreetMap feature" :
              card.source === "pbdb" ? "Fossil occurrence" :
              "Wikipedia article"
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function Feed({
  cards,
  newCardIds,
  loading,
  error,
  onCardSelect,
}: {
  cards: PlaceCard[];
  newCardIds: Set<string>;
  loading: boolean;
  error: string | null;
  onCardSelect: (card: PlaceCard) => void;
}) {
  const tooFewResults = cards.length > 0 && cards.length < 5;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
      {error && (
        <div className="text-[12.5px] text-zinc-400 border border-[rgba(255,255,255,0.06)] rounded-xl p-3 bg-[rgba(255,255,255,0.02)]">
          {error}
        </div>
      )}

      {cards.length === 0 && !loading && !error && (
        <p className="text-zinc-600 text-[12.5px] pt-2">
          Move the map then press{" "}
          <span className="text-zinc-400">Search area</span> to explore.
        </p>
      )}

      {tooFewResults && !loading && (
        <div className="text-[11.5px] text-zinc-600 border border-[rgba(255,255,255,0.05)] rounded-xl p-2.5 bg-[rgba(255,255,255,0.015)]">
          Few results here — try zooming out and searching a wider area.
        </div>
      )}

      {cards.map((c) => (
        <FeedCard
          key={c.id}
          card={c}
          isNew={newCardIds.has(c.id)}
          onClick={() => onCardSelect(c)}
        />
      ))}
    </div>
  );
}
