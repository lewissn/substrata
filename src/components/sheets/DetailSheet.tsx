"use client";

import type { PlaceCard } from "@/domain/placeCard";
import { ERA_LABELS } from "@/domain/era";
import { formatTimeSpan, formatMa } from "@/domain/time";
import { getNarrativeLines } from "@/domain/narrative";
import { seaLevelAtMa, formatSeaLevel } from "@/domain/lgm";

// ---------------------------------------------------------------------------
// DetailSheet — mobile detail view inside bottom sheet
// Renders the same content as Drawer but for vertical sheet scrolling.
// ---------------------------------------------------------------------------

const ERA_BADGE_STYLES: Record<string, string> = {
  geological: "text-red-400/80",
  prehistoric: "text-amber-400/80",
  ancient: "text-yellow-300/80",
  medieval: "text-sky-400/80",
  modern: "text-zinc-400/70",
};

const SOURCE_ATTRS: Record<string, string> = {
  wikipedia: "Data: Wikipedia (CC BY-SA)",
  osm: "Data: OpenStreetMap contributors (ODbL)",
  pbdb: "Data: Paleobiology Database (CC BY)",
  gplates: "Data: GPlates / EarthByte",
};

function formatDistance(m?: number) {
  if (m == null) return "";
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

export default function DetailSheet({
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
  const activeMa = ma != null && ma > 0 ? ma : null;
  const seaLevel = activeMa ? seaLevelAtMa(activeMa) : null;

  return (
    <div className="flex flex-col h-full">
      {/* ── Back button ── */}
      <div className="px-4 pb-2 flex items-center">
        <button
          onClick={onClose}
          className="text-[12px] text-zinc-400 hover:text-zinc-200 transition min-h-[36px] flex items-center gap-1"
          aria-label="Back to feed"
        >
          <span aria-hidden="true">&larr;</span> Back
        </button>
      </div>

      {/* ── Image strip ── */}
      {card.imageUrl ? (
        <div className="h-36 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
        </div>
      ) : (
        <div className="h-20 w-full bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-transparent" />
      )}

      {/* ── Content ── */}
      <div className="px-4 pt-3 pb-6 space-y-3">
        {/* Narrative lines */}
        {narrativeLines.length > 0 && (
          <div className="space-y-1">
            {narrativeLines.map((line, i) => (
              <p key={i} className="text-[12px] text-zinc-400 italic leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Title */}
        <div className="font-semibold text-[16px] text-zinc-50 leading-snug">
          {card.title}
        </div>

        {/* Era + time range */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[11px] font-semibold tracking-widest uppercase ${ERA_BADGE_STYLES[card.era] ?? "text-zinc-500"}`}>
            {ERA_LABELS[card.era]}
          </span>
          {timeDisplay && (
            <>
              <span className="text-zinc-700 text-[11px]">&middot;</span>
              <span className="text-[11px] text-zinc-500">{timeDisplay}</span>
            </>
          )}
        </div>

        {/* Source meta */}
        <div className="text-[11px] text-zinc-600">
          {card.source === "wikipedia"
            ? "Wikipedia"
            : card.source === "pbdb"
            ? "Paleobiology Database"
            : `OSM \u00B7 ${card.kind.replaceAll("_", " ")}`}
          {card.distanceM != null ? ` \u00B7 ${formatDistance(card.distanceM)}` : ""}
          {card.confidence != null ? ` \u00B7 ${Math.round(card.confidence * 100)}% confidence` : ""}
        </div>

        {/* Summary */}
        <div className="text-[13px] text-zinc-300 leading-relaxed">
          {card.summary ?? "No summary available."}
        </div>

        {/* Paleocoordinate + sea level */}
        {activeMa && (paleoLat != null || seaLevel != null) && (
          <div className="pt-2 border-t border-[rgba(255,255,255,0.05)] space-y-1.5">
            <div className="text-[10px] uppercase tracking-widest text-zinc-700 font-medium">
              At {formatMa(activeMa)}
            </div>
            {paleoLat != null && paleoLng != null && (
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="text-zinc-600">Paleoposition:</span>
                <span>
                  {Math.abs(paleoLat).toFixed(1)}&deg; {paleoLat >= 0 ? "N" : "S"},{" "}
                  {Math.abs(paleoLng).toFixed(1)}&deg; {paleoLng >= 0 ? "E" : "W"}
                </span>
              </div>
            )}
            {seaLevel != null && (
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="text-zinc-600">Sea level:</span>
                <span>{formatSeaLevel(seaLevel)}</span>
              </div>
            )}
          </div>
        )}

        {/* Link */}
        {card.url && (
          <a
            href={card.url}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-[12px] text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition"
          >
            View source &rarr;
          </a>
        )}

        {/* Attribution */}
        {attribution && (
          <div className="pt-2 border-t border-[rgba(255,255,255,0.04)] text-[9px] text-zinc-700">
            {attribution}
          </div>
        )}
      </div>
    </div>
  );
}
