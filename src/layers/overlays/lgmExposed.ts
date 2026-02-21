import type mapboxgl from "mapbox-gl";
import { lgmExposedLandGeoJSON } from "@/domain/lgm";
import type { OverlayModule, OverlayParams } from "./types";

// ---------------------------------------------------------------------------
// LGM Exposed Land Overlay (Beringia, Doggerland, Sundaland, Sahul)
// ---------------------------------------------------------------------------

const SOURCE = "lgm-exposed-src";
const FILL = "lgm-exposed-fill";
const BORDER = "lgm-exposed-border";

function isLGMRange(ma: number): boolean {
  return ma >= 0.015 && ma <= 0.03;
}

function exposedOpacity(ma: number, boost: number): number {
  if (!isLGMRange(ma)) return 0;
  const center = 0.021;
  const halfWidth = 0.009;
  const dist = Math.abs(ma - center) / halfWidth;
  const base = Math.max(0, 1 - dist * 0.5) * 0.35;
  return Math.min(1, base * boost);
}

export const lgmExposedOverlay: OverlayModule = {
  id: "lgm-exposed",

  add(map, params) {
    // Source may be managed externally (Map.tsx) — create if needed
    if (!map.getSource(SOURCE)) {
      map.addSource(SOURCE, {
        type: "geojson",
        data: lgmExposedLandGeoJSON() as any,
      });
    }

    const o = exposedOpacity(params.ma, params.boost);

    if (!map.getLayer(FILL)) {
      map.addLayer({
        id: FILL,
        type: "fill",
        source: SOURCE,
        paint: {
          "fill-color": "rgba(185,165,115,0.40)",
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
          "line-color": "rgba(190,170,120,0.55)",
          "line-width": 1.5,
          "line-dasharray": [3, 2],
          "line-opacity": o > 0 ? Math.min(1, o + 0.15) : 0,
        },
      });
    }
  },

  update(map, params) {
    const o = exposedOpacity(params.ma, params.boost);

    if (map.getLayer(FILL)) {
      map.setPaintProperty(FILL, "fill-opacity", o);
    }
    if (map.getLayer(BORDER)) {
      map.setPaintProperty(BORDER, "line-opacity", o > 0 ? Math.min(1, o + 0.15) : 0);
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
