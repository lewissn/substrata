"use client";

import type { Era } from "@/domain/placeCard";
import type { MapTheme } from "@/components/Map";
import EraChips from "./EraChips";
import MaSlider from "./MaSlider";
import SeaLevelSlider from "./SeaLevelSlider";
import { seaLevelAtMa } from "@/domain/lgm";
import InstallPrompt from "./pwa/InstallPrompt";

// ---------------------------------------------------------------------------
// Map theme options
// ---------------------------------------------------------------------------

const MAP_THEMES: { value: MapTheme; label: string }[] = [
  { value: "terrain", label: "Terrain" },
  { value: "satellite", label: "Satellite" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

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
  mapTheme = "terrain",
  onMapThemeChange,
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
  mapTheme?: MapTheme;
  onMapThemeChange?: (theme: MapTheme) => void;
}) {
  return (
    <div className="border-b border-[rgba(255,255,255,0.05)]">
      {/* Era chips row */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-700 font-medium">Era</span>
        </div>

        {!deepTimeEnabled && (
          <EraChips activeEra={activeEra} onEraChange={onEraChange} />
        )}
      </div>

      {/* Deep Time — prominent call-to-action block */}
      <div className="px-4 pb-3">
        <button
          onClick={onDeepTimeToggle}
          className={[
            "w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
            deepTimeEnabled
              ? "bg-[rgba(31,90,92,0.20)] border-[rgba(44,111,116,0.45)] shadow-[0_0_12px_rgba(44,111,116,0.15)]"
              : "bg-[rgba(31,90,92,0.06)] border-[rgba(44,111,116,0.20)] hover:bg-[rgba(31,90,92,0.12)] hover:border-[rgba(44,111,116,0.35)]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <span
              className={[
                "text-[12px] font-semibold tracking-tight",
                deepTimeEnabled ? "text-[#89CDD1]" : "text-zinc-500",
              ].join(" ")}
            >
              Deep Time (Ma)
            </span>
            <span
              className={[
                "text-[9px] uppercase tracking-widest font-medium px-1.5 py-0.5 rounded-md border",
                deepTimeEnabled
                  ? "text-[#89CDD1] border-[rgba(44,111,116,0.35)] bg-[rgba(31,90,92,0.14)]"
                  : "text-zinc-500 border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]",
              ].join(" ")}
            >
              {deepTimeEnabled ? "Active" : "Explore"}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
            {deepTimeEnabled
              ? "Drag the slider to travel through geological time"
              : "Journey millions of years into the past"}
          </p>
        </button>
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
                ? "bg-[rgba(31,90,92,0.20)] border-[rgba(44,111,116,0.40)] text-zinc-200 font-medium"
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
                  ? "bg-[rgba(31,90,92,0.20)] border-[rgba(44,111,116,0.40)] text-zinc-200 font-medium"
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

      {/* Map theme picker */}
      {onMapThemeChange && (
        <div className="px-4 pb-3 pt-2.5 border-t border-[rgba(255,255,255,0.05)]">
          <span className="text-[10px] uppercase tracking-widest text-zinc-700 font-medium block mb-2">
            Map style
          </span>
          <div className="flex gap-1.5">
            {MAP_THEMES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onMapThemeChange(value)}
                className={[
                  "flex-1 text-[10px] px-1 py-1.5 rounded-md border transition-all duration-150 font-medium",
                  mapTheme === value
                    ? "bg-[rgba(31,90,92,0.20)] border-[rgba(44,111,116,0.40)] text-zinc-200"
                    : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-zinc-500 hover:text-zinc-300 hover:border-[rgba(255,255,255,0.12)]",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Install prompt — Android/Chrome only, once per session ── */}
      <InstallPrompt />
    </div>
  );
}
