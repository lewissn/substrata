"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { PlaceCard } from "@/domain/placeCard";
import type { Era } from "@/domain/placeCard";
import { lgmIceGeoJSON, lgmExposedLandGeoJSON } from "@/domain/lgm";
import { addAllOverlays, updateAllOverlays } from "@/layers/overlays/OverlayController";
import type { OverlayParams } from "@/layers/overlays/OverlayController";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MapMode = "modern" | "medieval" | "ancient" | "prehistoric" | "geological" | "deepTime";

type Props = {
  center: [number, number]; // [lng, lat]
  onCenterChange?: (center: [number, number]) => void;
  cards?: PlaceCard[];
  selectedId?: string | null;
  onSelect?: (card: PlaceCard) => void;
  focusOffsetPx?: number;
  ma?: number;
  coastlineGeoJSON?: GeoJSON.FeatureCollection | null;
  activeEra?: Era | null;
  deepTimeEnabled?: boolean;
  minimalLabels?: boolean;
  interactionEnabled?: boolean;
  seaLevelOverride?: number | null;
  overlayBoost?: boolean;
  paleoEnabled?: boolean;
  paleoOpacity?: number;
};

// ---------------------------------------------------------------------------
// Constants — layer & source IDs (markers only; overlays managed by controller)
// ---------------------------------------------------------------------------

const SOURCE_ID = "places";
const LAYER_CLUSTERS = "clusters";
const LAYER_CLUSTER_COUNT = "cluster-count";
const LAYER_POINTS = "unclustered-points";
const LAYER_SELECTED_GLOW = "selected-point-glow";
const LAYER_SELECTED = "selected-point";

// Overlay-managed source/layer IDs (referenced for hover popups + coastline data)
const SOURCE_COASTLINE = "paleo-coastline-src";
const SOURCE_ICE = "lgm-ice-src";
const SOURCE_EXPOSED = "lgm-exposed-src";
const LAYER_ICE_FILL = "lgm-ice-fill";
const LAYER_EXPOSED_FILL = "lgm-exposed-fill";

// ---------------------------------------------------------------------------
// Style mapping
// ---------------------------------------------------------------------------

const STYLE_BY_MODE: Record<MapMode, string> = {
  modern: "mapbox://styles/mapbox/light-v11",
  medieval: "mapbox://styles/mapbox/outdoors-v12",
  ancient: "mapbox://styles/mapbox/outdoors-v12",
  prehistoric: "mapbox://styles/mapbox/outdoors-v12",
  geological: "mapbox://styles/mapbox/dark-v11",
  deepTime: "mapbox://styles/mapbox/outdoors-v12",
};

// ---------------------------------------------------------------------------
// Era-based marker colours
// ---------------------------------------------------------------------------

const ERA_COLOR_MATCH: mapboxgl.Expression = [
  "match",
  ["get", "era"],
  "geological", "rgba(180,70,70,0.92)",
  "prehistoric", "rgba(185,140,80,0.92)",
  "ancient", "rgba(212,168,80,0.92)",
  "medieval", "rgba(120,148,180,0.92)",
  "modern", "rgba(160,160,170,0.88)",
  /* default */ "rgba(160,160,170,0.88)",
];

// ---------------------------------------------------------------------------
// Mode resolution + per-mode config
// ---------------------------------------------------------------------------

function resolveMode(activeEra: Era | null, deepTimeEnabled: boolean): MapMode {
  if (deepTimeEnabled) return "deepTime";
  if (activeEra) return activeEra;
  return "modern";
}


function markerOpacity(mode: MapMode): number {
  switch (mode) {
    case "modern": return 0.92;
    case "medieval": return 0.88;
    case "ancient": return 0.88;
    case "prehistoric": return 0.82;
    case "geological": return 0.85;
    case "deepTime": return 0.78;
  }
}

function selectedGlowStrokeWidth(mode: MapMode): number {
  switch (mode) {
    case "geological": return 2.5;
    case "deepTime": return 3;
    default: return 2;
  }
}

function clusterColor(mode: MapMode): string {
  switch (mode) {
    case "modern": return "rgba(80,80,90,0.78)";
    case "medieval": return "rgba(70,70,80,0.80)";
    case "ancient": return "rgba(70,70,80,0.80)";
    case "prehistoric": return "rgba(60,60,70,0.82)";
    case "geological": return "rgba(50,50,60,0.85)";
    case "deepTime": return "rgba(45,45,55,0.88)";
  }
}

function clusterStrokeColor(mode: MapMode): string {
  if (mode === "modern") return "rgba(0,0,0,0.10)";
  return "rgba(255,255,255,0.10)";
}

function clusterTextColor(mode: MapMode): string {
  if (mode === "modern") return "rgba(60,60,70,0.85)";
  return "rgba(200,200,210,0.90)";
}

function pointStrokeColor(mode: MapMode): string {
  if (mode === "modern") return "rgba(255,255,255,0.60)";
  return "rgba(0,0,0,0.50)";
}

// ---------------------------------------------------------------------------
// Label suppression
// ---------------------------------------------------------------------------

const SUPPRESS_LABEL_PATTERNS = [
  "poi",
  "road-label",
  "road-number-shield",
  "road-exit-shield",
  "transit",
  "ferry",
  "airport",
  "bus",
  "rail",
];

function shouldSuppressLabels(mode: MapMode, minimal: boolean): boolean {
  if (minimal) return true;
  return mode === "prehistoric" || mode === "geological" || mode === "deepTime";
}

// ---------------------------------------------------------------------------
// Empty GeoJSON
// ---------------------------------------------------------------------------

const EMPTY_FC: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Map({
  center,
  onCenterChange,
  cards = [],
  selectedId,
  onSelect,
  focusOffsetPx = 180,
  ma = 0,
  coastlineGeoJSON,
  activeEra = null,
  deepTimeEnabled = false,
  minimalLabels = false,
  interactionEnabled = true,
  seaLevelOverride = null,
  overlayBoost = false,
  paleoEnabled = false,
  paleoOpacity = 0.5,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const loadedRef = useRef(false);
  const currentStyleRef = useRef<string>("");
  const initializingRef = useRef(false);

  // Refs for latest prop values (used inside event handlers and style.load)
  const cardByIdRef = useRef(new globalThis.Map<string, PlaceCard>());
  const geojsonRef = useRef<any>(EMPTY_FC);
  const selectedIdRef = useRef<string | null>(null);
  const maRef = useRef(0);
  const coastlineRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const seaLevelOverrideRef = useRef<number | null>(null);
  const overlayBoostRef = useRef(false);
  const paleoEnabledRef = useRef(false);
  const paleoOpacityRef = useRef(0.5);
  const onSelectRef = useRef(onSelect);
  const onCenterChangeRef = useRef(onCenterChange);
  const modeRef = useRef<MapMode>("modern");
  const minimalLabelsRef = useRef(minimalLabels);

  // Keep refs in sync
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onCenterChangeRef.current = onCenterChange; }, [onCenterChange]);
  useEffect(() => { selectedIdRef.current = selectedId ?? null; }, [selectedId]);
  useEffect(() => { maRef.current = ma; }, [ma]);
  useEffect(() => { coastlineRef.current = coastlineGeoJSON ?? null; }, [coastlineGeoJSON]);
  useEffect(() => { seaLevelOverrideRef.current = seaLevelOverride; }, [seaLevelOverride]);
  useEffect(() => { overlayBoostRef.current = overlayBoost; }, [overlayBoost]);
  useEffect(() => { paleoEnabledRef.current = paleoEnabled; }, [paleoEnabled]);
  useEffect(() => { paleoOpacityRef.current = paleoOpacity; }, [paleoOpacity]);
  useEffect(() => { minimalLabelsRef.current = minimalLabels; }, [minimalLabels]);
  useEffect(() => {
    cardByIdRef.current = new globalThis.Map(cards.map((c) => [c.id, c]));
  }, [cards]);

  const geojson = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: cards.map((c) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [c.coords.lng, c.coords.lat],
      },
      properties: {
        id: c.id,
        title: c.title,
        source: c.source,
        kind: c.kind,
        era: c.era,
      },
    })),
  }), [cards]);

  useEffect(() => { geojsonRef.current = geojson; }, [geojson]);

  // Resolve current mode
  const mode = resolveMode(activeEra, deepTimeEnabled);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  // Build current overlay params
  function currentOverlayParams(): OverlayParams {
    return {
      ma: maRef.current,
      boost: overlayBoostRef.current ? 1.15 : 1.0,
      seaLevelOverride: seaLevelOverrideRef.current,
      paleoEnabled: paleoEnabledRef.current,
      paleoOpacity: paleoOpacityRef.current,
    };
  }

  // ── Initialize overlay data sources (needed before overlay controller) ──
  function initializeOverlaySources(map: mapboxgl.Map) {
    // Paleocoastline source (shared by seaLevel overlay)
    if (!map.getSource(SOURCE_COASTLINE)) {
      map.addSource(SOURCE_COASTLINE, {
        type: "geojson",
        data: (coastlineRef.current ?? EMPTY_FC) as any,
      });
    }

    // LGM ice sheets source
    if (!map.getSource(SOURCE_ICE)) {
      map.addSource(SOURCE_ICE, { type: "geojson", data: lgmIceGeoJSON() as any });
    }

    // LGM exposed land source
    if (!map.getSource(SOURCE_EXPOSED)) {
      map.addSource(SOURCE_EXPOSED, { type: "geojson", data: lgmExposedLandGeoJSON() as any });
    }
  }

  // ── Initialize marker sources + layers ──
  function initializeMarkerLayers(map: mapboxgl.Map) {
    // Clustered GeoJSON
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: "geojson", data: geojsonRef.current as any,
        cluster: true, clusterMaxZoom: 14, clusterRadius: 40,
      });
    }

    const m = modeRef.current;

    // Cluster circles
    if (!map.getLayer(LAYER_CLUSTERS)) {
      map.addLayer({
        id: LAYER_CLUSTERS, type: "circle", source: SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": ["step", ["get", "point_count"], 13, 10, 17, 30, 22, 100, 28],
          "circle-color": clusterColor(m),
          "circle-stroke-width": 1,
          "circle-stroke-color": clusterStrokeColor(m),
          "circle-opacity": 0.88,
        },
      });
    }

    // Cluster count
    if (!map.getLayer(LAYER_CLUSTER_COUNT)) {
      map.addLayer({
        id: LAYER_CLUSTER_COUNT, type: "symbol", source: SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 11,
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        },
        paint: { "text-color": clusterTextColor(m) },
      });
    }

    // Unclustered points
    if (!map.getLayer(LAYER_POINTS)) {
      map.addLayer({
        id: LAYER_POINTS, type: "circle", source: SOURCE_ID,
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 5.5,
          "circle-color": ERA_COLOR_MATCH,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": pointStrokeColor(m),
          "circle-opacity": markerOpacity(m),
        },
      });
    }

    // Selected glow
    if (!map.getLayer(LAYER_SELECTED_GLOW)) {
      map.addLayer({
        id: LAYER_SELECTED_GLOW, type: "circle", source: SOURCE_ID,
        filter: ["==", ["get", "id"], selectedIdRef.current ?? ""],
        paint: {
          "circle-radius": 16,
          "circle-color": "rgba(250,192,94,0.0)",
          "circle-stroke-width": selectedGlowStrokeWidth(m),
          "circle-stroke-color": "rgba(250,192,94,0.28)",
          "circle-opacity": 1,
        },
      });
    }

    // Selected centre
    if (!map.getLayer(LAYER_SELECTED)) {
      map.addLayer({
        id: LAYER_SELECTED, type: "circle", source: SOURCE_ID,
        filter: ["==", ["get", "id"], selectedIdRef.current ?? ""],
        paint: {
          "circle-radius": 8,
          "circle-color": "rgba(250,192,94,0.30)",
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(250,192,94,0.70)",
        },
      });
    }
  }

  // ── Initialize all custom sources + layers ──
  function initializeMapLayers(map: mapboxgl.Map) {
    if (initializingRef.current) return;
    initializingRef.current = true;

    try {
      // 1. Data sources for overlays (must exist before overlay controller adds layers)
      initializeOverlaySources(map);

      // 2. Overlay layers via controller
      addAllOverlays(map, currentOverlayParams());

      // 3. Marker layers (on top of overlays)
      initializeMarkerLayers(map);
    } finally {
      initializingRef.current = false;
    }
  }

  // ── Suppress / restore labels ──
  function suppressLabels(map: mapboxgl.Map, suppress: boolean) {
    const style = map.getStyle();
    if (!style?.layers) return;
    for (const layer of style.layers) {
      const id = layer.id.toLowerCase();
      if (SUPPRESS_LABEL_PATTERNS.some((p) => id.includes(p))) {
        try {
          map.setLayoutProperty(layer.id, "visibility", suppress ? "none" : "visible");
        } catch { /* layer may not exist yet */ }
      }
    }
  }


  // ── Bind interaction events ──
  function bindEvents(map: mapboxgl.Map) {
    // Cluster click → zoom
    map.on("click", LAYER_CLUSTERS, (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const clusterId = Number((feature.properties as any)?.cluster_id);
      if (!Number.isFinite(clusterId)) return;
      const src: any = map.getSource(SOURCE_ID);
      if (!src?.getClusterExpansionZoom) return;
      const coords = (feature.geometry as any).coordinates as [number, number];
      src.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (err) return;
        const z = typeof zoom === "number" ? zoom : Number(zoom);
        map.easeTo({ center: coords, zoom: Number.isFinite(z) ? z : map.getZoom() + 2 });
      });
    });

    // Point hover
    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 10 });
    map.on("mousemove", LAYER_POINTS, (e) => {
      map.getCanvas().style.cursor = "pointer";
      const f = e.features?.[0];
      if (!f) return;
      const title = f.properties?.title ?? "";
      const era = f.properties?.era ?? "";
      const coords = (f.geometry as any).coordinates as [number, number];
      popup.setLngLat(coords).setHTML(
        `<div style="font-size:11px;line-height:1.4">
           <div style="font-weight:600;color:#f4f4f5">${escapeHtml(title)}</div>
           ${era ? `<div style="color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;margin-top:2px">${escapeHtml(era)}</div>` : ""}
         </div>`
      ).addTo(map);
    });
    map.on("mouseleave", LAYER_POINTS, () => { map.getCanvas().style.cursor = ""; popup.remove(); });

    // LGM hover
    const lgmPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 10 });
    for (const layerId of [LAYER_ICE_FILL, LAYER_EXPOSED_FILL]) {
      map.on("mousemove", layerId, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const name = f.properties?.name ?? "";
        const desc = f.properties?.description ?? "";
        if (!name) return;
        lgmPopup.setLngLat(e.lngLat).setHTML(
          `<div style="font-size:11px;line-height:1.4">
             <div style="font-weight:600;color:#f4f4f5">${escapeHtml(name)}</div>
             <div style="color:#9ca3af;font-size:10px;margin-top:2px">${escapeHtml(desc)}</div>
           </div>`
        ).addTo(map);
      });
      map.on("mouseleave", layerId, () => { lgmPopup.remove(); });
    }

    // Point click → select
    map.on("click", LAYER_POINTS, (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const id = f.properties?.id as string | undefined;
      if (!id) return;
      const card = cardByIdRef.current.get(id);
      if (card) onSelectRef.current?.(card);
    });
  }

  // =========================================================================
  // Init map once
  // =========================================================================
  useEffect(() => {
    if (!containerRef.current) return;

    const initialMode = resolveMode(activeEra, deepTimeEnabled);
    const initialStyle = STYLE_BY_MODE[initialMode];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: initialStyle,
      center,
      zoom: 10,
    });

    currentStyleRef.current = initialStyle;
    mapRef.current = map;

    map.on("moveend", () => {
      const c = map.getCenter();
      onCenterChangeRef.current?.([c.lng, c.lat]);
    });

    map.on("style.load", () => {
      loadedRef.current = true;
      initializeMapLayers(map);
      bindEvents(map);

      const curMode = modeRef.current;
      if (shouldSuppressLabels(curMode, minimalLabelsRef.current)) {
        setTimeout(() => suppressLabels(map, true), 100);
      }
    });

    return () => { map.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================================
  // Style switching on mode change
  // =========================================================================
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const targetStyle = STYLE_BY_MODE[mode];

    if (targetStyle !== currentStyleRef.current) {
      loadedRef.current = false;
      currentStyleRef.current = targetStyle;
      // style.load callback re-initializes everything
      map.setStyle(targetStyle);
    } else if (loadedRef.current) {
      // Same style but mode changed — update labels
      suppressLabels(map, shouldSuppressLabels(mode, minimalLabels));
    }
  }, [mode, minimalLabels]);

  // =========================================================================
  // Reactive updates
  // =========================================================================

  // Source data
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    src?.setData(geojson as any);
  }, [geojson]);

  // Selected highlight
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const filter: mapboxgl.FilterSpecification = ["==", ["get", "id"], selectedId ?? ""];
    if (map.getLayer(LAYER_SELECTED)) map.setFilter(LAYER_SELECTED, filter);
    if (map.getLayer(LAYER_SELECTED_GLOW)) map.setFilter(LAYER_SELECTED_GLOW, filter);
  }, [selectedId]);

  // Overlay updates — single unified useEffect via OverlayController
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const params: OverlayParams = {
      ma,
      boost: overlayBoost ? 1.15 : 1.0,
      seaLevelOverride,
      paleoEnabled,
      paleoOpacity,
    };
    updateAllOverlays(map, params);
  }, [ma, seaLevelOverride, overlayBoost, paleoEnabled, paleoOpacity]);

  // Paleocoastline data update
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource(SOURCE_COASTLINE) as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;
    if (coastlineGeoJSON && ma > 0) {
      src.setData(coastlineGeoJSON as any);
    } else {
      src.setData(EMPTY_FC as any);
    }
    // After data update, re-run overlay update so overlays reflect new coastline
    const params: OverlayParams = {
      ma,
      boost: overlayBoost ? 1.15 : 1.0,
      seaLevelOverride,
      paleoEnabled,
      paleoOpacity,
    };
    updateAllOverlays(map, params);
  }, [coastlineGeoJSON, ma, overlayBoost, seaLevelOverride, paleoEnabled, paleoOpacity]);

  // Marker/cluster styling per mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    if (map.getLayer(LAYER_POINTS)) {
      map.setPaintProperty(LAYER_POINTS, "circle-opacity", markerOpacity(mode));
      map.setPaintProperty(LAYER_POINTS, "circle-stroke-color", pointStrokeColor(mode));
    }
    if (map.getLayer(LAYER_CLUSTERS)) {
      map.setPaintProperty(LAYER_CLUSTERS, "circle-color", clusterColor(mode));
      map.setPaintProperty(LAYER_CLUSTERS, "circle-stroke-color", clusterStrokeColor(mode));
    }
    if (map.getLayer(LAYER_CLUSTER_COUNT)) {
      map.setPaintProperty(LAYER_CLUSTER_COUNT, "text-color", clusterTextColor(mode));
    }
    if (map.getLayer(LAYER_SELECTED_GLOW)) {
      map.setPaintProperty(LAYER_SELECTED_GLOW, "circle-stroke-width", selectedGlowStrokeWidth(mode));
    }
  }, [mode]);

  // Fly to center
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center, offset: [0, focusOffsetPx], essential: true });
  }, [center, focusOffsetPx]);

  // Map interaction control (for mobile sheet overlay)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (interactionEnabled) {
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.touchZoomRotate.enable();
      map.doubleClickZoom.enable();
    } else {
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.touchZoomRotate.disable();
      map.doubleClickZoom.disable();
    }
  }, [interactionEnabled]);

  // =========================================================================
  // Atmospheric tint class
  // =========================================================================
  const atmosClass = deepTimeEnabled
    ? "atmos-deeptime"
    : activeEra === "geological"
    ? "atmos-geological"
    : activeEra === "prehistoric"
    ? "atmos-prehistoric"
    : activeEra === "ancient"
    ? "atmos-ancient"
    : activeEra === "medieval"
    ? "atmos-medieval"
    : "atmos-modern";

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {/* Atmospheric overlay — cosmetic only, never blocks interaction */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-700 ${atmosClass}`}
        aria-hidden="true"
      />
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
