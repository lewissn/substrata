"use client";

import { seaLevelAtMa, formatSeaLevel } from "@/domain/lgm";

// ---------------------------------------------------------------------------
// Active Overlays Pill — shows currently active map overlays
// ---------------------------------------------------------------------------

export function ActiveOverlays({
  ma,
  deepTimeEnabled,
  seaLevelOverride,
  overlayBoost,
}: {
  ma: number;
  deepTimeEnabled: boolean;
  seaLevelOverride: number | null;
  overlayBoost: boolean;
}) {
  if (!deepTimeEnabled || ma <= 0) return null;

  const isLGM = ma >= 0.015 && ma <= 0.03;
  const effectiveSL = seaLevelOverride ?? seaLevelAtMa(ma);
  const hasCoastlineShift = effectiveSL < -10;

  // Nothing active worth showing
  if (!isLGM && !hasCoastlineShift) return null;

  return (
    <div className="absolute top-3 right-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(9,9,11,0.92)] backdrop-blur-md px-3 py-2.5 z-10 space-y-1.5 pointer-events-none">
      <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-medium">
        Active{overlayBoost ? " (boosted)" : ""}
      </div>

      {isLGM && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(200,225,245,0.5)" }} />
          <span className="text-[10px] text-zinc-400">Ice extent (~21 ka)</span>
        </div>
      )}

      {isLGM && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(185,165,115,0.4)" }} />
          <span className="text-[10px] text-zinc-400">Exposed land</span>
        </div>
      )}

      {hasCoastlineShift && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(120,160,100,0.3)", border: "1px solid rgba(120,160,100,0.5)" }} />
          <span className="text-[10px] text-zinc-400">
            Sea level: {formatSeaLevel(effectiveSL)}
          </span>
        </div>
      )}
    </div>
  );
}
