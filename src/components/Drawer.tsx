"use client";

import type { PlaceCard } from "@/domain/placeCard";
import { ERA_LABELS } from "@/domain/era";
import { formatTimeSpan } from "@/domain/time";
import { getNarrativeLines } from "@/domain/narrative";

const ERA_BADGE_STYLES: Record<string, string> = {
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

// Attribution labels by source
const SOURCE_ATTRS: Record<string, string> = {
  wikipedia: "Data: Wikipedia (CC BY-SA)",
  osm: "Data: OpenStreetMap contributors (ODbL)",
  pbdb: "Data: Paleobiology Database (CC BY)",
  gplates: "Data: GPlates / EarthByte",
};

export default function Drawer({
  card,
  onClose,
  ma,
  paleoLat,
  paleoLng,
  nearbyFossilCount,
  nearbyFossilPeriod,
}: {
  card: PlaceCard;
  onClose: () => void;
  ma?: number | null;
  paleoLat?: number | null;
  paleoLng?: number | null;
  nearbyFossilCount?: number;
  nearbyFossilPeriod?: string;
}) {
  const narrativeLines = getNarrativeLines({
    card,
    ma: ma ?? null,
    paleoLat,
    paleoLng,
    nearbyFossilCount,
    nearbyFossilPeriod,
  });

  const timeDisplay = formatTimeSpan(card.time);
  const attribution = SOURCE_ATTRS[card.source] ?? "";

  return (
    <div className="absolute bottom-5 left-5 right-5 md:right-auto md:w-[520px] rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(9,9,11,0.97)] backdrop-blur-xl shadow-drawer animate-drawer-in z-20">
      {/* Image strip */}
      {card.imageUrl && (
        <div className="h-28 w-full rounded-t-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Narrative lines ("This place was…") */}
            {narrativeLines.length > 0 && (
              <div className="mb-3 space-y-1">
                {narrativeLines.map((line, i) => (
                  <p key={i} className="text-[12px] text-zinc-400 italic leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            )}

            {/* Title */}
            <div className="font-semibold text-[15px] text-zinc-50 leading-snug">
              {card.title}
            </div>

            {/* Era + time range */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[11px] font-semibold tracking-widest uppercase ${ERA_BADGE_STYLES[card.era] ?? "text-zinc-500"}`}>
                {ERA_LABELS[card.era]}
              </span>
              {timeDisplay && (
                <>
                  <span className="text-zinc-700 text-[11px]">·</span>
                  <span className="text-[11px] text-zinc-500">{timeDisplay}</span>
                </>
              )}
            </div>

            {/* Source meta */}
            <div className="text-[11px] text-zinc-600 mt-0.5">
              {card.source === "wikipedia"
                ? "Wikipedia"
                : card.source === "pbdb"
                ? "Paleobiology Database"
                : `OSM · ${card.kind.replaceAll("_", " ")}`}
              {card.distanceM != null ? ` · ${formatDistance(card.distanceM)}` : ""}
              {card.confidence != null ? ` · ${Math.round(card.confidence * 100)}% confidence` : ""}
            </div>

            {/* Summary */}
            <div className="text-[13px] text-zinc-300 leading-relaxed mt-3">
              {card.summary ?? "No summary available."}
            </div>

            {/* Link */}
            {card.url && (
              <a
                href={card.url}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 text-[12px] text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition"
              >
                View source →
              </a>
            )}

            {/* Attribution */}
            {attribution && (
              <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.04)] text-[9px] text-zinc-700">
                {attribution}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-zinc-400 hover:text-zinc-200 text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
