"use client";

import type { Era } from "@/domain/placeCard";
import EraChips from "./EraChips";
import MaSlider from "./MaSlider";
import SeaLevelSlider from "./SeaLevelSlider";
import { seaLevelAtMa } from "@/domain/lgm";

export default function TimeControls({
  activeEra,
  onEraChange,
  deepTimeEnabled,
  onDeepTimeToggle,
  ma,
  onMaChange,
  seaLevelOverride,
  onSeaLevelChange,
  overlayBoost,
  onOverlayBoostToggle,
  paleoEnabled,
  onPaleoToggle,
  paleoOpacity = 0.5,
  onPaleoOpacityChange,
}: {
  activeEra: Era | null;
  onEraChange: (era: Era | null) => void;
  deepTimeEnabled: boolean;
  onDeepTimeToggle: () => void;
  ma: number;
  onMaChange: (ma: number) => void;
  seaLevelOverride?: number | null;
  onSeaLevelChange?: (v: number | null) => void;
  overlayBoost?: boolean;
  onOverlayBoostToggle?: () => void;
  paleoEnabled?: boolean;
  onPaleoToggle?: () => void;
  paleoOpacity?: number;
  onPaleoOpacityChange?: (v: number) => void;
}) {
  return (
    <div className="border-b border-[rgba(255,255,255,0.05)]">
      {/* Era chips row */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-700 font-medium">Era</span>
          <button
            onClick={onDeepTimeToggle}
            className={[
              "text-[10px] px-2.5 py-1 rounded-md border transition-all duration-150",
              deepTimeEnabled
                ? "bg-[rgba(var(--accent),0.14)] border-[rgba(var(--accent),0.30)] text-zinc-200 font-medium"
                : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-zinc-600 hover:text-zinc-400",
            ].join(" ")}
          >
            Deep Time (Ma)
          </button>
        </div>

        {!deepTimeEnabled && (
          <EraChips activeEra={activeEra} onEraChange={onEraChange} />
        )}
      </div>

      {/* Deep Time slider (conditionally shown) */}
      {deepTimeEnabled && (
        <div className="px-4 pb-3 pt-1">
          <MaSlider ma={ma} onMaChange={onMaChange} />
        </div>
      )}

      {/* Sea level slider (shown in Deep Time mode) */}
      {deepTimeEnabled && ma > 0 && onSeaLevelChange && (
        <div className="px-4 pb-3 pt-1 border-t border-[rgba(255,255,255,0.04)]">
          <SeaLevelSlider
            value={seaLevelOverride ?? null}
            onChange={onSeaLevelChange}
            autoValue={seaLevelAtMa(ma)}
          />
        </div>
      )}

      {/* Boost overlays toggle (shown in Deep Time mode) */}
      {deepTimeEnabled && ma > 0 && onOverlayBoostToggle && (
        <div className="px-4 pb-3 flex items-center justify-between">
          <span className="text-[10px] text-zinc-600">Boost overlays</span>
          <button
            onClick={onOverlayBoostToggle}
            className={[
              "text-[10px] px-2.5 py-1 rounded-md border transition-all duration-150",
              overlayBoost
                ? "bg-[rgba(var(--accent),0.14)] border-[rgba(var(--accent),0.30)] text-zinc-200 font-medium"
                : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-zinc-600 hover:text-zinc-400",
            ].join(" ")}
          >
            {overlayBoost ? "On" : "Off"}
          </button>
        </div>
      )}

      {/* Paleogeography toggle + opacity slider (shown in Deep Time when ma > 0) */}
      {deepTimeEnabled && ma > 0 && onPaleoToggle && (
        <div className="px-4 pb-3 border-t border-[rgba(255,255,255,0.04)] pt-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-600">Paleogeography</span>
            <button
              onClick={onPaleoToggle}
              className={[
                "text-[10px] px-2.5 py-1 rounded-md border transition-all duration-150",
                paleoEnabled
                  ? "bg-[rgba(var(--accent),0.14)] border-[rgba(var(--accent),0.30)] text-zinc-200 font-medium"
                  : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-zinc-600 hover:text-zinc-400",
              ].join(" ")}
            >
              {paleoEnabled ? "On" : "Off"}
            </button>
          </div>

          {paleoEnabled && onPaleoOpacityChange && (
            <div className="mt-2 flex items-center gap-2.5">
              <input
                type="range"
                min={35}
                max={65}
                value={Math.round(paleoOpacity * 100)}
                onChange={(e) => onPaleoOpacityChange(Number(e.target.value) / 100)}
                className="flex-1 h-1 accent-zinc-400 cursor-pointer slider-deep"
              />
              <span className="text-[10px] text-zinc-600 tabular-nums w-7 text-right">
                {Math.round(paleoOpacity * 100)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
