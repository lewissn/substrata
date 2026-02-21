import type mapboxgl from "mapbox-gl";
import type { OverlayModule, OverlayParams } from "./types";

// ---------------------------------------------------------------------------
// Paleogeography Overlay
// Renders documentary-style land/ocean coloring using GPlates coastline data.
//
// Layers (bottom to top):
//   1. Ocean fill — world-extent polygon, deep blue
//   2. Land fill  — coastline polygons (shared source), warm neutrals
//   3. Land border — coastline outlines for definition
//
// The coastline GeoJSON source ("paleo-coastline-src") is managed externally
// by Map.tsx. This overlay only controls visual layers referencing that source.
// ---------------------------------------------------------------------------

const OCEAN_SOURCE = "paleo-geo-ocean-src";
const COASTLINE_SOURCE = "paleo-coastline-src"; // shared with seaLevel overlay

const OCEAN_FILL = "paleo-geo-ocean-fill";
const LAND_FILL = "paleo-geo-land-fill";
const LAND_BORDER = "paleo-geo-land-border";

// ---------------------------------------------------------------------------
// Era-based coloring — subtle tonal shifts across geological time
// ---------------------------------------------------------------------------

function oceanColor(ma: number): string {
  if (ma < 66) return "rgba(18,48,78,0.92)";   // Cenozoic — cool blue
  if (ma < 252) return "rgba(15,45,72,0.92)";   // Mesozoic — slightly deeper
  if (ma < 540) return "rgba(20,42,68,0.92)";   // Paleozoic — muted teal-blue
  return "rgba(22,40,62,0.90)";                  // Precambrian — darkest
}

function landColor(ma: number): string {
  if (ma < 66) return "rgba(175,155,115,0.85)";  // Cenozoic — warm sand
  if (ma < 252) return "rgba(165,145,100,0.85)";  // Mesozoic — warm khaki
  if (ma < 540) return "rgba(155,135,105,0.82)";  // Paleozoic — dusty tan
  return "rgba(145,130,110,0.80)";                 // Precambrian — muted earth
}

function borderColor(ma: number): string {
  if (ma < 66) return "rgba(140,120,80,0.60)";
  if (ma < 252) return "rgba(135,115,75,0.55)";
  if (ma < 540) return "rgba(130,110,80,0.50)";
  return "rgba(125,110,85,0.45)";
}

// ---------------------------------------------------------------------------
// Opacity logic
// ---------------------------------------------------------------------------

function effectiveOpacity(params: OverlayParams): number {
  if (!params.paleoEnabled || params.ma <= 0) return 0;
  return Math.min(1, params.paleoOpacity * params.boost);
}

// ---------------------------------------------------------------------------
// Overlay module
// ---------------------------------------------------------------------------

export const paleogeographyOverlay: OverlayModule = {
  id: "paleogeography",

  add(map, params) {
    // Ocean source — own world-extent polygon
    if (!map.getSource(OCEAN_SOURCE)) {
      map.addSource(OCEAN_SOURCE, {
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

    // Coastline source is managed externally (Map.tsx) — don't create here

    const o = effectiveOpacity(params);
    const ma = params.ma;

    // Layer 1: Ocean fill
    if (!map.getLayer(OCEAN_FILL) && map.getSource(OCEAN_SOURCE)) {
      map.addLayer({
        id: OCEAN_FILL,
        type: "fill",
        source: OCEAN_SOURCE,
        paint: {
          "fill-color": oceanColor(ma),
          "fill-opacity": o,
          "fill-opacity-transition": { duration: 400, delay: 0 },
        },
      });
    }

    // Layer 2: Land fill (from shared coastline source)
    if (!map.getLayer(LAND_FILL) && map.getSource(COASTLINE_SOURCE)) {
      map.addLayer({
        id: LAND_FILL,
        type: "fill",
        source: COASTLINE_SOURCE,
        paint: {
          "fill-color": landColor(ma),
          "fill-opacity": o,
          "fill-opacity-transition": { duration: 400, delay: 0 },
        },
      });
    }

    // Layer 3: Land border
    if (!map.getLayer(LAND_BORDER) && map.getSource(COASTLINE_SOURCE)) {
      map.addLayer({
        id: LAND_BORDER,
        type: "line",
        source: COASTLINE_SOURCE,
        paint: {
          "line-color": borderColor(ma),
          "line-width": 1.2,
          "line-opacity": o > 0 ? Math.min(1, o + 0.1) : 0,
          "line-opacity-transition": { duration: 400, delay: 0 },
        },
      });
    }
  },

  update(map, params) {
    const o = effectiveOpacity(params);
    const ma = params.ma;

    if (map.getLayer(OCEAN_FILL)) {
      map.setPaintProperty(OCEAN_FILL, "fill-color", oceanColor(ma));
      map.setPaintProperty(OCEAN_FILL, "fill-opacity", o);
    }

    if (map.getLayer(LAND_FILL)) {
      map.setPaintProperty(LAND_FILL, "fill-color", landColor(ma));
      map.setPaintProperty(LAND_FILL, "fill-opacity", o);
    }

    if (map.getLayer(LAND_BORDER)) {
      map.setPaintProperty(LAND_BORDER, "line-color", borderColor(ma));
      map.setPaintProperty(LAND_BORDER, "line-opacity", o > 0 ? Math.min(1, o + 0.1) : 0);
    }
  },

  remove(map) {
    if (map.getLayer(LAND_BORDER)) map.removeLayer(LAND_BORDER);
    if (map.getLayer(LAND_FILL)) map.removeLayer(LAND_FILL);
    if (map.getLayer(OCEAN_FILL)) map.removeLayer(OCEAN_FILL);
    // Ocean source is ours — remove it
    if (map.getSource(OCEAN_SOURCE)) map.removeSource(OCEAN_SOURCE);
    // Do NOT remove COASTLINE_SOURCE — it's shared
  },

  isAdded(map) {
    return !!map.getLayer(OCEAN_FILL);
  },
};
