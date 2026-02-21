import type mapboxgl from "mapbox-gl";

// ---------------------------------------------------------------------------
// Overlay module interface
// Each overlay is a self-contained module that manages its own sources/layers.
// ---------------------------------------------------------------------------

export type OverlayParams = {
  ma: number;
  boost: number; // 1.0 = normal, ~1.15 = boosted
  seaLevelOverride: number | null; // null = auto from Ma curve
};

export interface OverlayModule {
  /** Unique identifier */
  readonly id: string;
  /** Add sources and layers to the map */
  add(map: mapboxgl.Map, params: OverlayParams): void;
  /** Update visibility/opacity based on current params */
  update(map: mapboxgl.Map, params: OverlayParams): void;
  /** Remove all sources and layers from the map */
  remove(map: mapboxgl.Map): void;
  /** Check if this overlay's sources exist on the map */
  isAdded(map: mapboxgl.Map): boolean;
}
