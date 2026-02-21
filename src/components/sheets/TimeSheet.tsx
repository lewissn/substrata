"use client";

import TimeControls from "@/components/TimeControls";
import ContextPanel from "@/components/ContextPanel";
import { Chip, KIND_CHIPS } from "@/components/ui/Chip";
import type { Era, PlaceCard, PlaceKind, PlaceSource } from "@/domain/placeCard";
import type { ReconstructionResult } from "@/app/api/reconstruct/route";
import type { MapTheme } from "@/components/Map";

// ---------------------------------------------------------------------------
// TimeSheet — era/time controls + filters inside bottom sheet
// ---------------------------------------------------------------------------

export default function TimeSheet({
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
  paleoOpacity,
  onPaleoOpacityChange,
  paleoData,
  activeSources,
  onToggleSource,
  activeKinds,
  onToggleKind,
  hasActiveFilters,
  onResetFilters,
  hasPbdb,
  mapTheme,
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
  paleoData: ReconstructionResult | null;
  activeSources: PlaceSource[];
  onToggleSource: (s: PlaceSource) => void;
  activeKinds: PlaceKind[];
  onToggleKind: (k: PlaceKind) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  hasPbdb: boolean;
  mapTheme?: MapTheme;
  onMapThemeChange?: (theme: MapTheme) => void;
}) {
  return (
    <div className="flex flex-col">
      {/* ── Time controls ── */}
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
      />

      {/* ── Context panel ── */}
      <ContextPanel
        ma={ma}
        activeEra={activeEra}
        deepTimeEnabled={deepTimeEnabled}
        paleoData={paleoData}
      />

      {/* ── Source + Kind filters ── */}
      <div className="px-4 pt-3 pb-4">
        <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2 font-medium">Source</div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Chip label="Wikipedia" active={activeSources.includes("wikipedia")} onClick={() => onToggleSource("wikipedia")} />
          <Chip label="OSM" active={activeSources.includes("osm")} onClick={() => onToggleSource("osm")} />
          {hasPbdb && (
            <Chip label="Fossils" active={activeSources.includes("pbdb")} onClick={() => onToggleSource("pbdb")} />
          )}
        </div>

        <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2 font-medium">Type</div>
        <div className="flex flex-wrap gap-1.5">
          {KIND_CHIPS.map(({ kind, label }) => (
            <Chip
              key={kind}
              label={label}
              active={activeKinds.includes(kind)}
              onClick={() => onToggleKind(kind)}
            />
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="mt-3 text-[11px] text-zinc-600 hover:text-zinc-400 transition underline underline-offset-2"
          >
            Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
