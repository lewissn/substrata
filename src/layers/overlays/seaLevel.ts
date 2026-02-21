import type mapboxgl from "mapbox-gl";
import type { OverlayModule, OverlayParams } from "./types";
import { seaLevelAtMa } from "@/domain/lgm";

// ---------------------------------------------------------------------------
// Sea Level Overlay
// Shows exposed continental shelf at negative sea levels.
// Uses the coastline GeoJSON source (managed externally by Map),
// but controls its own fill/line visual treatment.
//
// The actual coastline data source is managed by the paleoCoastline overlay.
// This overlay manages a dedicated "sea-level shelf" visual layer that
// represents the approximate exposed shelf based on the sea level value.
// ---------------------------------------------------------------------------

// For the sea level overlay, we reuse the existing coastline source
// but apply our own visual treatment. The coastline GeoJSON is managed
// externally — this module only controls the visual presentation.

const SOURCE = "paleo-coastline-src"; // shared with paleoCoastline overlay
const FILL = "paleo-coastline-fill";
const BORDER = "paleo-coastline-border";

/** Resolve effective sea level from params */
export function effectiveSeaLevel(params: OverlayParams): number {
  if (params.seaLevelOverride !== null) return params.seaLevelOverride;
  return seaLevelAtMa(params.ma);
}

/**
 * Coastline opacity: stronger when sea level is more negative.
 * The more the sea drops, the more dramatically we show the exposed shelf.
 */
function coastlineOpacity(seaLevel: number, boost: number): number {
  if (seaLevel >= 0) return 0;
  // -120m → full opacity, -20m → subtle
  const intensity = Math.min(1, Math.abs(seaLevel) / 120);
  const base = 0.10 + intensity * 0.20; // range: 0.10 to 0.30
  return Math.min(1, base * boost);
}

function coastlineBorderOpacity(seaLevel: number, boost: number): number {
  if (seaLevel >= 0) return 0;
  const intensity = Math.min(1, Math.abs(seaLevel) / 120);
  const base = 0.25 + intensity * 0.25;
  return Math.min(1, base * boost);
}

export const seaLevelOverlay: OverlayModule = {
  id: "sea-level",

  add(map, params) {
    // Source is managed by paleoCoastline overlay / Map.tsx
    // We only manage layer paint properties here
    const sl = effectiveSeaLevel(params);
    const fillO = coastlineOpacity(sl, params.boost);
    const borderO = coastlineBorderOpacity(sl, params.boost);

    if (!map.getLayer(FILL) && map.getSource(SOURCE)) {
      map.addLayer({
        id: FILL,
        type: "fill",
        source: SOURCE,
        paint: {
          "fill-color": "rgba(120,160,100,0.15)",
          "fill-opacity": fillO,
        },
      });
    }

    if (!map.getLayer(BORDER) && map.getSource(SOURCE)) {
      map.addLayer({
        id: BORDER,
        type: "line",
        source: SOURCE,
        paint: {
          "line-color": "rgba(120,160,100,0.45)",
          "line-width": 1.5,
          "line-opacity": borderO,
        },
      });
    }
  },

  update(map, params) {
    const sl = effectiveSeaLevel(params);
    const fillO = coastlineOpacity(sl, params.boost);
    const borderO = coastlineBorderOpacity(sl, params.boost);

    if (map.getLayer(FILL)) {
      map.setPaintProperty(FILL, "fill-opacity", fillO);
    }
    if (map.getLayer(BORDER)) {
      map.setPaintProperty(BORDER, "line-opacity", borderO);
    }
  },

  remove(map) {
    if (map.getLayer(BORDER)) map.removeLayer(BORDER);
    if (map.getLayer(FILL)) map.removeLayer(FILL);
    // Do NOT remove the source — it's shared
  },

  isAdded(map) {
    return !!map.getLayer(FILL);
  },
};
