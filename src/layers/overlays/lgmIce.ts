import type mapboxgl from "mapbox-gl";
import { lgmIceGeoJSON } from "@/domain/lgm";
import type { OverlayModule, OverlayParams } from "./types";

// ---------------------------------------------------------------------------
// LGM Ice Sheet Overlay
// Stronger visibility: higher opacity, clearer boundary
// ---------------------------------------------------------------------------

const SOURCE = "lgm-ice-src";
const FILL = "lgm-ice-fill";
const BORDER = "lgm-ice-border";

/** Is this Ma in the LGM display range? */
function isLGMRange(ma: number): boolean {
  return ma >= 0.015 && ma <= 0.03;
}

/**
 * Compute ice sheet fill opacity.
 * Peaks at ~21 ka, fades toward edges of 15–30 ka range.
 * Stronger than before: max ~0.35 (was 0.55 but looked too subtle
 * because fill color was already semi-transparent).
 */
function iceOpacity(ma: number, boost: number): number {
  if (!isLGMRange(ma)) return 0;
  const center = 0.021;
  const halfWidth = 0.009;
  const dist = Math.abs(ma - center) / halfWidth;
  const base = Math.max(0, 1 - dist * 0.5) * 0.40;
  return Math.min(1, base * boost);
}

export const lgmIceOverlay: OverlayModule = {
  id: "lgm-ice",

  add(map, params) {
    // Source may be managed externally (Map.tsx) — create if needed
    if (!map.getSource(SOURCE)) {
      map.addSource(SOURCE, {
        type: "geojson",
        data: lgmIceGeoJSON() as any,
      });
    }

    const o = iceOpacity(params.ma, params.boost);

    if (!map.getLayer(FILL)) {
      map.addLayer({
        id: FILL,
        type: "fill",
        source: SOURCE,
        paint: {
          "fill-color": "rgba(200,225,245,0.50)",
          "fill-opacity": o,
        },
      });
    }

    if (!map.getLayer(BORDER)) {
      map.addLayer({
        id: BORDER,
        type: "line",
        source: SOURCE,
        paint: {
          "line-color": "rgba(150,190,230,0.80)",
          "line-width": 2.5,
          "line-opacity": o > 0 ? Math.min(1, o + 0.25) : 0,
          "line-dasharray": [4, 3],
        },
      });
    }
  },

  update(map, params) {
    const o = iceOpacity(params.ma, params.boost);

    if (map.getLayer(FILL)) {
      map.setPaintProperty(FILL, "fill-opacity", o);
    }
    if (map.getLayer(BORDER)) {
      map.setPaintProperty(BORDER, "line-opacity", o > 0 ? Math.min(1, o + 0.25) : 0);
    }
  },

  remove(map) {
    if (map.getLayer(BORDER)) map.removeLayer(BORDER);
    if (map.getLayer(FILL)) map.removeLayer(FILL);
    if (map.getSource(SOURCE)) map.removeSource(SOURCE);
  },

  isAdded(map) {
    return !!map.getLayer(FILL);
  },
};
