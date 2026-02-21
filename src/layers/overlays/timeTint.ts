import type mapboxgl from "mapbox-gl";
import type { OverlayModule, OverlayParams } from "./types";

// ---------------------------------------------------------------------------
// Time Tint Overlay — subtle full-map color wash based on geological period
// ---------------------------------------------------------------------------

const SOURCE = "time-tint-src";
const LAYER = "time-tint-overlay";

function timeTintColor(ma: number): string {
  if (ma <= 0) return "rgba(0,0,0,0)";
  if (ma < 0.03) return "rgba(100,140,180,0.06)";
  if (ma < 0.2) return "rgba(80,120,160,0.05)";
  if (ma < 3) return "rgba(90,110,80,0.05)";
  if (ma < 66) return "rgba(80,110,60,0.06)";
  if (ma < 252) return "rgba(100,80,60,0.06)";
  if (ma < 540) return "rgba(70,70,100,0.06)";
  return "rgba(60,50,70,0.05)";
}

export const timeTintOverlay: OverlayModule = {
  id: "time-tint",

  add(map, params) {
    if (!map.getSource(SOURCE)) {
      map.addSource(SOURCE, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]],
          },
          properties: {},
        },
      });
    }

    if (!map.getLayer(LAYER)) {
      map.addLayer({
        id: LAYER,
        type: "fill",
        source: SOURCE,
        paint: {
          "fill-color": timeTintColor(params.ma),
          "fill-opacity": 1,
        },
      });
    }
  },

  update(map, params) {
    if (map.getLayer(LAYER)) {
      map.setPaintProperty(LAYER, "fill-color", timeTintColor(params.ma));
    }
  },

  remove(map) {
    if (map.getLayer(LAYER)) map.removeLayer(LAYER);
    if (map.getSource(SOURCE)) map.removeSource(SOURCE);
  },

  isAdded(map) {
    return !!map.getLayer(LAYER);
  },
};
