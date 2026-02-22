import type mapboxgl from "mapbox-gl";
import type { OverlayModule, OverlayParams } from "./types";
import { seaLevelAtMa } from "@/domain/lgm";

// ---------------------------------------------------------------------------
// Sea Level Overlay
// Shows exposed continental shelf when sea level is significantly negative.
//
// Uses a dedicated source (sea-level-shelf-src) populated with precomputed
// shelf polygon data for major areas exposed at -120m sea level. This source
// is initialised in Map.tsx and is always available, unlike the paleo
// coastline source which only has data at Ma >= 1.
//
// Opacity scales with the magnitude of the sea level drop:
//   -20m  → subtle (fill ~0.20, border ~0.45)
//   -60m  → moderate (fill ~0.33, border ~0.60)
//   -120m → prominent (fill ~0.45, border ~0.75)
// ---------------------------------------------------------------------------

const SOURCE = "sea-level-shelf-src"; // own source, always populated
const FILL   = "sea-level-shelf-fill";
const BORDER = "sea-level-shelf-border";

/** Resolve effective sea level from params */
export function effectiveSeaLevel(params: OverlayParams): number {
  if (params.seaLevelOverride !== null) return params.seaLevelOverride;
  return seaLevelAtMa(params.ma);
}

/** Fill opacity — scales with sea level depth (0 when >= -5m) */
function fillOpacity(seaLevel: number, boost: number): number {
  if (seaLevel >= -5) return 0;
  const depth = Math.min(120, Math.abs(seaLevel));
  const intensity = depth / 120; // 0 at -5m, 1.0 at -120m
  const base = 0.15 + intensity * 0.30; // 0.15 → 0.45
  return Math.min(1, base * boost);
}

/** Border opacity — stronger than fill for crisp edge */
function borderOpacity(seaLevel: number, boost: number): number {
  if (seaLevel >= -5) return 0;
  const depth = Math.min(120, Math.abs(seaLevel));
  const intensity = depth / 120;
  const base = 0.40 + intensity * 0.35; // 0.40 → 0.75
  return Math.min(1, base * boost);
}

export const seaLevelOverlay: OverlayModule = {
  id: "sea-level",

  add(map, params) {
    if (!map.getSource(SOURCE)) return; // source not ready yet

    const sl = effectiveSeaLevel(params);
    const fillO = fillOpacity(sl, params.boost);
    const borderO = borderOpacity(sl, params.boost);

    if (!map.getLayer(FILL)) {
      map.addLayer({
        id: FILL,
        type: "fill",
        source: SOURCE,
        paint: {
          "fill-color": "rgba(185, 165, 115, 1.0)", // warm tan for exposed land
          "fill-opacity": fillO,
        },
      });
    }

    if (!map.getLayer(BORDER)) {
      map.addLayer({
        id: BORDER,
        type: "line",
        source: SOURCE,
        paint: {
          "line-color": "rgba(200, 180, 130, 1.0)",
          "line-width": 2,
          "line-opacity": borderO,
        },
      });
    }

    if (process.env.NODE_ENV === "development") {
      const sl = effectiveSeaLevel(params);
      console.debug(
        `[SeaLevel] add — sl=${sl}m, fillO=${fillO.toFixed(2)}, borderO=${borderO.toFixed(2)}, ` +
        `fillLayer=${!!map.getLayer(FILL)}, borderLayer=${!!map.getLayer(BORDER)}`
      );
    }
  },

  update(map, params) {
    const sl = effectiveSeaLevel(params);
    const fillO = fillOpacity(sl, params.boost);
    const borderO = borderOpacity(sl, params.boost);

    if (map.getLayer(FILL)) {
      map.setPaintProperty(FILL, "fill-opacity", fillO);
    }
    if (map.getLayer(BORDER)) {
      map.setPaintProperty(BORDER, "line-opacity", borderO);
    }

    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[SeaLevel] update — sl=${sl}m, fillO=${fillO.toFixed(2)}, borderO=${borderO.toFixed(2)}`
      );
    }
  },

  remove(map) {
    if (map.getLayer(BORDER)) map.removeLayer(BORDER);
    if (map.getLayer(FILL)) map.removeLayer(FILL);
    // Do NOT remove the source — it is owned by Map.tsx
  },

  isAdded(map) {
    return !!map.getLayer(FILL);
  },
};
