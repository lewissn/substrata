"use client";

import TimeControls from "@/components/TimeControls";
import type { Era } from "@/domain/placeCard";
import type { ReconstructionResult } from "@/app/api/reconstruct/route";
import type { MapTheme } from "@/components/Map";

// ---------------------------------------------------------------------------
// TimeSheet — Deep Time controls inside mobile bottom sheet.
// Era / source / type filters have moved to FeedSheet to reduce sheet-switching.
// ContextPanel is embedded inside TimeControls (narrative-first layout).
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
  mapTheme?: MapTheme;
  onMapThemeChange?: (theme: MapTheme) => void;
}) {
  return (
    <div className="flex flex-col">
      {/* Deep Time controls — era chips are in FeedSheet (Nearby) */}
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
      />
    </div>
  );
}
