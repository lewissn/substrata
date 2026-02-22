"use client";

import { useState } from "react";
import type { PlaceCard } from "@/domain/placeCard";
import { ERA_LABELS } from "@/domain/era";
import { formatTimeSpan, formatMa } from "@/domain/time";
import { getNarrativeLines } from "@/domain/narrative";
import { seaLevelAtMa, formatSeaLevel } from "@/domain/lgm";

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

const SOURCE_ATTRS: Record<string, string> = {
  wikipedia: "Data: Wikipedia (CC BY-SA)",
  osm: "Data: OpenStreetMap contributors (ODbL)",
  pbdb: "Data: Paleobiology Database (CC BY)",
  gplates: "Data: GPlates / EarthByte",
};

// ---------------------------------------------------------------------------
// Share helper
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------

export default function Drawer({
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
    const url = buildShareUrl(card, ma ?? null, seaLevelOverride ?? null, paleoEnabled ?? false, overlayBoost ?? false);
    if (navigator.share) {
      try {
        await navigator.share({ title: card.title, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            {/* Narrative lines */}
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

            {/* Paleocoordinate + sea level */}
            {activeMa && (paleoLat != null || seaLevel != null) && (
              <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.05)] space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-700 font-medium">
                  At {formatMa(activeMa)}
                </div>
                {paleoLat != null && paleoLng != null && (
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span className="text-zinc-600">Paleoposition:</span>
                    <span>
                      {Math.abs(paleoLat).toFixed(1)}° {paleoLat >= 0 ? "N" : "S"},{" "}
                      {Math.abs(paleoLng).toFixed(1)}° {paleoLng >= 0 ? "E" : "W"}
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

            {/* Action row: link + share */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {card.url && (
                <a
                  href={card.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[12px] text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition"
                >
                  View source →
                </a>
              )}
              <button
                onClick={handleShare}
                className="text-[12px] text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                {copied ? "Copied!" : "Share"}
              </button>
            </div>

            {/* Attribution */}
            {attribution && (
              <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.04)] text-[10px] text-zinc-700">
                {attribution}
              </div>
            )}
          </div>

          {/* Right-side action buttons */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {/* Save / bookmark */}
            {onToggleSave && (
              <button
                onClick={onToggleSave}
                title={isSaved ? "Remove from My Finds" : "Save to My Finds"}
                className={[
                  "p-2 rounded-lg border transition",
                  isSaved
                    ? "border-[rgba(44,111,116,0.40)] bg-[rgba(31,90,92,0.15)] text-[#89CDD1]"
                    : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] text-zinc-500 hover:text-zinc-300",
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
            {/* Close */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-zinc-400 hover:text-zinc-200 text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
