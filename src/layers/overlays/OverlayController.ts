import type mapboxgl from "mapbox-gl";
import type { OverlayModule, OverlayParams } from "./types";
import { timeTintOverlay } from "./timeTint";
import { lgmIceOverlay } from "./lgmIce";
import { lgmExposedOverlay } from "./lgmExposed";
import { seaLevelOverlay } from "./seaLevel";

// ---------------------------------------------------------------------------
// Overlay Controller
// Central manager for all map overlays. Handles adding, updating, and
// removing overlay modules, plus conflict resolution and transitions.
// ---------------------------------------------------------------------------

/** All registered overlay modules in render order (bottom to top) */
const OVERLAYS: OverlayModule[] = [
  timeTintOverlay,
  lgmIceOverlay,
  lgmExposedOverlay,
  seaLevelOverlay,
];

/**
 * Initialize all overlay sources and layers on the map.
 * Called on `style.load` (after every style switch).
 */
export function addAllOverlays(map: mapboxgl.Map, params: OverlayParams): void {
  for (const overlay of OVERLAYS) {
    if (!overlay.isAdded(map)) {
      overlay.add(map, params);
    }
  }
}

/**
 * Update all overlay visuals (opacity, color, etc.) based on current params.
 * Called reactively when ma, boost, or seaLevelOverride changes.
 */
export function updateAllOverlays(map: mapboxgl.Map, params: OverlayParams): void {
  for (const overlay of OVERLAYS) {
    if (overlay.isAdded(map)) {
      overlay.update(map, params);
    }
  }
}

/**
 * Remove all overlay sources and layers from the map.
 * Called before style switch or on cleanup.
 */
export function removeAllOverlays(map: mapboxgl.Map): void {
  // Remove in reverse order (top to bottom)
  for (let i = OVERLAYS.length - 1; i >= 0; i--) {
    if (OVERLAYS[i].isAdded(map)) {
      OVERLAYS[i].remove(map);
    }
  }
}

/** Re-export for convenience */
export type { OverlayParams } from "./types";
