"use client";

import TimeControls from "@/components/TimeControls";
import RecentHistoryPanel from "@/components/RecentHistoryPanel";
import type { Era } from "@/domain/placeCard";
import type { ReconstructionResult } from "@/app/api/reconstruct/route";
import type { MapTheme } from "@/components/Map";

// ---------------------------------------------------------------------------
// TimeSheet — mobile time controls inside the bottom sheet.
//
// Layout:
//   1. Time Scale selector: [Recent History] [Deep Time (Ma)]
//   2a. Recent History mode: year presets + period narrative
//   2b. Deep Time mode: Ma slider, paleogeography, sea level, etc.
//
// Era / source / type filters have moved to FeedSheet (Nearby sheet) to
// reduce the need to switch sheets when refining search results.
// ---------------------------------------------------------------------------

export default function TimeSheet({
  activeEra,
  onEraChange,
  deepTimeEnabled,
  onDeepTimeToggle,
  ma,
  onMaChange,
  historicalYears,
  onHistoricalYearsChange,
  seaLevelOverride,
  onSeaLevelChange,
  overlayBoost,
  onOverlayBoostToggle,
  paleoEnabled,
  onPaleoToggle,
  paleoOpacity,
  onPaleoOpacityChange,
  paleoData,
  mapTheme,
  onMapThemeChange,
}: {
  activeEra: Era | null;
  onEraChange: (era: Era | null) => void;
  deepTimeEnabled: boolean;
  onDeepTimeToggle: () => void;
  ma: number;
  onMaChange: (ma: number) => void;
  historicalYears: number;
  onHistoricalYearsChange: (years: number) => void;
  seaLevelOverride?: number | null;
  onSeaLevelChange?: (v: number | null) => void;
  overlayBoost?: boolean;
  onOverlayBoostToggle?: () => void;
  paleoEnabled?: boolean;
  onPaleoToggle?: () => void;
  paleoOpacity?: number;
  onPaleoOpacityChange?: (v: number) => void;
  paleoData: ReconstructionResult | null;
  mapTheme?: MapTheme;
  onMapThemeChange?: (theme: MapTheme) => void;
}) {
  return (
    <div className="flex flex-col">
      {/* ── Time Scale selector ── */}
      <div className="px-4 pt-4 pb-3 border-b border-[rgba(255,255,255,0.05)]">
        <span className="text-[10px] uppercase tracking-widest text-zinc-700 font-medium block mb-2">
          Time scale
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => { if (deepTimeEnabled) onDeepTimeToggle(); }}
            className={[
              "py-2 px-3 rounded-xl border text-[11px] font-medium transition-all duration-150",
              !deepTimeEnabled
                ? "bg-[rgba(31,90,92,0.20)] border-[rgba(44,111,116,0.45)] text-[#89CDD1] shadow-[0_0_10px_rgba(44,111,116,0.12)]"
                : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-zinc-500 hover:text-zinc-300 hover:border-[rgba(255,255,255,0.10)]",
            ].join(" ")}
          >
            Recent History
          </button>
          <button
            onClick={() => { if (!deepTimeEnabled) onDeepTimeToggle(); }}
            className={[
              "py-2 px-3 rounded-xl border text-[11px] font-medium transition-all duration-150",
              deepTimeEnabled
                ? "bg-[rgba(31,90,92,0.20)] border-[rgba(44,111,116,0.45)] text-[#89CDD1] shadow-[0_0_10px_rgba(44,111,116,0.12)]"
                : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-zinc-500 hover:text-zinc-300 hover:border-[rgba(255,255,255,0.10)]",
            ].join(" ")}
          >
            Deep Time (Ma)
          </button>
        </div>
      </div>

      {/* ── Mode-specific content ── */}
      {!deepTimeEnabled ? (
        /* Recent History mode */
        <RecentHistoryPanel
          historicalYears={historicalYears}
          onChange={onHistoricalYearsChange}
        />
      ) : (
        /* Deep Time mode — Ma slider, paleo, sea level, etc.
           hideDeepTimeToggle because the tab above IS the toggle. */
        <TimeControls
          activeEra={activeEra}
          onEraChange={onEraChange}
          deepTimeEnabled={deepTimeEnabled}
          onDeepTimeToggle={onDeepTimeToggle}
          ma={ma}
          onMaChange={onMaChange}
          seaLevelOverride={seaLevelOverride}
          onSeaLevelChange={onSeaLevelChange}
          overlayBoost={overlayBoost}
          onOverlayBoostToggle={onOverlayBoostToggle}
          paleoEnabled={paleoEnabled}
          onPaleoToggle={onPaleoToggle}
          paleoOpacity={paleoOpacity}
          onPaleoOpacityChange={onPaleoOpacityChange}
          mapTheme={mapTheme}
          onMapThemeChange={onMapThemeChange}
          paleoData={paleoData}
          showEraChips={false}
          hideDeepTimeToggle={true}
        />
      )}

      {/* Map style picker — always visible regardless of mode */}
      {!deepTimeEnabled && onMapThemeChange && (
        <MapStylePicker mapTheme={mapTheme ?? "terrain"} onMapThemeChange={onMapThemeChange} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline map style picker (only rendered in Recent History mode, since Deep
// Time mode gets it from TimeControls)
// ---------------------------------------------------------------------------

const MAP_THEMES: { value: MapTheme; label: string }[] = [
  { value: "terrain", label: "Terrain" },
  { value: "satellite", label: "Satellite" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function MapStylePicker({
  mapTheme,
  onMapThemeChange,
}: {
  mapTheme: MapTheme;
  onMapThemeChange: (t: MapTheme) => void;
}) {
  return (
    <div className="px-4 pb-4 pt-3 border-t border-[rgba(255,255,255,0.05)]">
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
  );
}
