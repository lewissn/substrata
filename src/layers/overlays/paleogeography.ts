import type mapboxgl from "mapbox-gl";
import type { OverlayModule, OverlayParams } from "./types";
import { effectiveSeaLevel } from "./seaLevel";

// ---------------------------------------------------------------------------
// Paleogeography Overlay
// Renders documentary-style land/ocean coloring using GPlates coastline data.
// Ocean and land colors respond to sea level — deeper/more saturated at high
// sea levels (Cretaceous +170m), paler/shallower at low (LGM -120m).
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
// Utilities
// ---------------------------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Normalize sea level to [-1, +1].
 * -120m → -1.0,  0m → 0.0,  +170m → +1.0
 */
function seaLevelFactor(params: OverlayParams): number {
  const sl = effectiveSeaLevel(params);
  if (sl <= 0) return Math.max(-1, sl / 120);
  return Math.min(1, sl / 170);
}

// ---------------------------------------------------------------------------
// Sea-level-responsive coloring
// Base colors shift by era; sea level factor adjusts saturation/depth.
//   High sea level (+1): ocean deeper/more saturated, land cooler/less prominent
//   Low sea level  (-1): ocean paler/washed-out, land warmer/bolder
// ---------------------------------------------------------------------------

function oceanColor(ma: number, slf: number): string {
  // Era base: [R, G, B, A]
  let base: [number, number, number, number];
  if (ma < 66)       base = [18, 48, 78, 0.92];   // Cenozoic — cool blue
  else if (ma < 252) base = [15, 45, 72, 0.92];   // Mesozoic — slightly deeper
  else if (ma < 540) base = [20, 42, 68, 0.92];   // Paleozoic — muted teal-blue
  else               base = [22, 40, 62, 0.90];   // Precambrian — darkest

  // High sea level: R↓ G↓ B↑ A↑ (deeper blue)
  // Low sea level:  R↑ G↑ B↓ A↓ (paler, washed out)
  const r = Math.round(clamp(base[0] + slf * -7, 0, 255));
  const g = Math.round(clamp(base[1] + slf * -7, 0, 255));
  const b = Math.round(clamp(base[2] + slf * 10, 0, 255));
  const a = clamp(base[3] + slf * 0.07, 0, 1);

  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
}

function landColor(ma: number, slf: number): string {
  let base: [number, number, number, number];
  if (ma < 66)       base = [175, 155, 115, 0.85];  // Cenozoic — warm sand
  else if (ma < 252) base = [165, 145, 100, 0.85];  // Mesozoic — warm khaki
  else if (ma < 540) base = [155, 135, 105, 0.82];  // Paleozoic — dusty tan
  else               base = [145, 130, 110, 0.80];  // Precambrian — muted earth

  // High sea level: cooler, less prominent (more flooding)
  // Low sea level:  warmer, bolder (more exposed continental shelf)
  const r = Math.round(clamp(base[0] + slf * -8, 0, 255));
  const g = Math.round(clamp(base[1] + slf * -5, 0, 255));
  const b = Math.round(clamp(base[2] + slf * 3, 0, 255));
  const a = clamp(base[3] + slf * -0.06, 0, 1);

  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
}

function borderColor(ma: number, slf: number): string {
  let base: [number, number, number, number];
  if (ma < 66)       base = [140, 120, 80, 0.60];
  else if (ma < 252) base = [135, 115, 75, 0.55];
  else if (ma < 540) base = [130, 110, 80, 0.50];
  else               base = [125, 110, 85, 0.45];

  const r = Math.round(clamp(base[0] + slf * -5, 0, 255));
  const g = Math.round(clamp(base[1] + slf * -3, 0, 255));
  const b = Math.round(clamp(base[2] + slf * 2, 0, 255));
  const a = clamp(base[3] + slf * -0.04, 0, 1);

  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
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
    const slf = seaLevelFactor(params);

    // Layer 1: Ocean fill
    if (!map.getLayer(OCEAN_FILL) && map.getSource(OCEAN_SOURCE)) {
      map.addLayer({
        id: OCEAN_FILL,
        type: "fill",
        source: OCEAN_SOURCE,
        paint: {
          "fill-color": oceanColor(ma, slf),
          "fill-opacity": o,
          "fill-opacity-transition": { duration: 400, delay: 0 },
          "fill-color-transition": { duration: 300, delay: 0 },
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
          "fill-color": landColor(ma, slf),
          "fill-opacity": o,
          "fill-opacity-transition": { duration: 400, delay: 0 },
          "fill-color-transition": { duration: 300, delay: 0 },
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
          "line-color": borderColor(ma, slf),
          "line-width": 1.2,
          "line-opacity": o > 0 ? Math.min(1, o + 0.1) : 0,
          "line-opacity-transition": { duration: 400, delay: 0 },
          "line-color-transition": { duration: 300, delay: 0 },
        },
      });
    }
  },

  update(map, params) {
    const o = effectiveOpacity(params);
    const ma = params.ma;
    const slf = seaLevelFactor(params);

    if (map.getLayer(OCEAN_FILL)) {
      map.setPaintProperty(OCEAN_FILL, "fill-color", oceanColor(ma, slf));
      map.setPaintProperty(OCEAN_FILL, "fill-opacity", o);
    }

    if (map.getLayer(LAND_FILL)) {
      map.setPaintProperty(LAND_FILL, "fill-color", landColor(ma, slf));
      map.setPaintProperty(LAND_FILL, "fill-opacity", o);
    }

    if (map.getLayer(LAND_BORDER)) {
      map.setPaintProperty(LAND_BORDER, "line-color", borderColor(ma, slf));
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
