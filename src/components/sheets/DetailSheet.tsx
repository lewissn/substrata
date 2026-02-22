"use client";

import { useState } from "react";
import type { PlaceCard } from "@/domain/placeCard";
import { ERA_LABELS } from "@/domain/era";
import { formatTimeSpan, formatMa } from "@/domain/time";
import { getNarrativeLines } from "@/domain/narrative";
import { seaLevelAtMa, formatSeaLevel } from "@/domain/lgm";

// ---------------------------------------------------------------------------
// DetailSheet — mobile detail view inside bottom sheet
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

function buildShareUrl(
  card: PlaceCard,
  ma: number | null,
  seaLevelOverride: number | null,
  paleoEnabled: boolean,
  overlayBoost: boolean
): string {
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("lat", String(card.coords.lat));
  url.searchParams.set("lng", String(card.coords.lng));
  if (ma && ma > 0) url.searchParams.set("ma", String(ma));
  if (seaLevelOverride !== null) url.searchParams.set("sea", String(seaLevelOverride));
  if (paleoEnabled) url.searchParams.set("paleo", "1");
  if (overlayBoost) url.searchParams.set("boost", "1");
  return url.toString();
}

export default function DetailSheet({
  card,
  onClose,
  ma,
  paleoLat,
  paleoLng,
  nearbyFossilCount,
  nearbyFossilPeriod,
  isSaved,
  onToggleSave,
  seaLevelOverride,
  paleoEnabled,
  overlayBoost,
}: {
  card: PlaceCard;
  onClose: () => void;
  ma?: number | null;
  paleoLat?: number | null;
  paleoLng?: number | null;
  nearbyFossilCount?: number;
  nearbyFossilPeriod?: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
  seaLevelOverride?: number | null;
  paleoEnabled?: boolean;
  overlayBoost?: boolean;
}) {
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    const url = buildShareUrl(
      card,
      ma ?? null,
      seaLevelOverride ?? null,
      paleoEnabled ?? false,
      overlayBoost ?? false
    );
    if (navigator.share) {
      try { await navigator.share({ title: card.title, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header row: back + share + save ── */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-[12px] text-zinc-400 hover:text-zinc-200 transition min-h-[36px] flex items-center gap-1"
          aria-label="Back to feed"
        >
          <span aria-hidden="true">&larr;</span> Back
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] text-zinc-500 hover:text-zinc-300 text-[11px] transition min-h-[36px]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            {copied ? "Copied!" : "Share"}
          </button>

          {onToggleSave && (
            <button
              onClick={onToggleSave}
              aria-label={isSaved ? "Remove from My Finds" : "Save to My Finds"}
              className={[
                "p-2 rounded-lg border transition min-h-[36px] min-w-[36px] flex items-center justify-center",
                isSaved
                  ? "border-[rgba(44,111,116,0.40)] bg-[rgba(31,90,92,0.15)] text-[#89CDD1]"
                  : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] text-zinc-500 hover:text-zinc-300",
              ].join(" ")}
            >
              {isSaved ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </button>
          )}
        </div>
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
        {narrativeLines.length > 0 && (
          <div className="space-y-1">
            {narrativeLines.map((line, i) => (
              <p key={i} className="text-[12px] text-zinc-400 italic leading-relaxed">{line}</p>
            ))}
          </div>
        )}

        <div className="font-semibold text-[16px] text-zinc-50 leading-snug">{card.title}</div>

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

        <div className="text-[11px] text-zinc-600">
          {card.source === "wikipedia"
            ? "Wikipedia"
            : card.source === "pbdb"
            ? "Paleobiology Database"
            : `OSM \u00B7 ${card.kind.replaceAll("_", " ")}`}
          {card.distanceM != null ? ` \u00B7 ${formatDistance(card.distanceM)}` : ""}
          {card.confidence != null ? ` \u00B7 ${Math.round(card.confidence * 100)}% confidence` : ""}
        </div>

        <div className="text-[13px] text-zinc-300 leading-relaxed">
          {card.summary ?? "No summary available."}
        </div>

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

        {card.url && (
          <a href={card.url} target="_blank" rel="noreferrer"
            className="inline-block text-[12px] text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition">
            View source &rarr;
          </a>
        )}

        {attribution && (
          <div className="pt-2 border-t border-[rgba(255,255,255,0.04)] text-[10px] text-zinc-700">
            {attribution}
          </div>
        )}
      </div>
    </div>
  );
}
