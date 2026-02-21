"use client";

import { seaLevelAtMa, formatSeaLevel } from "@/domain/lgm";
import { formatMa } from "@/domain/time";

// ---------------------------------------------------------------------------
// Active Overlays Pill — shows currently active map overlays
// ---------------------------------------------------------------------------

export function ActiveOverlays({
  ma,
  deepTimeEnabled,
  seaLevelOverride,
  overlayBoost,
  paleoEnabled = false,
}: {
  ma: number;
  deepTimeEnabled: boolean;
  seaLevelOverride: number | null;
  overlayBoost: boolean;
  paleoEnabled?: boolean;
}) {
  if (!deepTimeEnabled || ma <= 0) return null;

  const isLGM = ma >= 0.015 && ma <= 0.03;
  const effectiveSL = seaLevelOverride ?? seaLevelAtMa(ma);
  const hasSeaLevelShift = Math.abs(effectiveSL) > 5;
  const showPaleo = paleoEnabled && ma >= 1;

  // Nothing active worth showing
  if (!isLGM && !hasSeaLevelShift && !showPaleo) return null;

  return (
    <div className="absolute top-3 right-3 rounded-xl border border-[rgba(44,111,116,0.22)] bg-[rgba(9,9,11,0.92)] backdrop-blur-md px-3 py-2.5 z-10 space-y-1.5 pointer-events-none">
      <div className="text-[9px] uppercase tracking-widest text-[#89CDD1]/60 font-medium">
        Active{overlayBoost ? " (boosted)" : ""}
      </div>

      {showPaleo && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm flex overflow-hidden">
            <div className="w-1.5 h-3" style={{ backgroundColor: "rgba(18,48,78,0.85)" }} />
            <div className="w-1.5 h-3" style={{ backgroundColor: "rgba(175,155,115,0.85)" }} />
          </div>
          <span className="text-[10px] text-zinc-400">
            Paleogeography ({formatMa(ma)})
          </span>
        </div>
      )}

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

      {hasSeaLevelShift && (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={effectiveSL > 0
              ? { backgroundColor: "rgba(30,70,120,0.4)", border: "1px solid rgba(30,70,120,0.6)" }
              : { backgroundColor: "rgba(120,160,100,0.3)", border: "1px solid rgba(120,160,100,0.5)" }
            }
          />
          <span className="text-[10px] text-zinc-400">
            Sea level: {formatSeaLevel(effectiveSL)}
          </span>
        </div>
      )}
    </div>
  );
}
