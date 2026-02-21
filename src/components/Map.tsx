"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { PlaceCard } from "@/domain/placeCard";
import { lgmIceGeoJSON, lgmExposedLandGeoJSON } from "@/domain/lgm";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Props = {
  center: [number, number]; // [lng, lat]
  onCenterChange?: (center: [number, number]) => void;
  cards?: PlaceCard[];
  selectedId?: string | null;
  onSelect?: (card: PlaceCard) => void;
  focusOffsetPx?: number;
  ma?: number; // Deep Time Ma for style effects
  coastlineGeoJSON?: GeoJSON.FeatureCollection | null;
};

const SOURCE_ID = "places";
const LAYER_CLUSTERS = "clusters";
const LAYER_CLUSTER_COUNT = "cluster-count";
const LAYER_POINTS = "unclustered-points";
const LAYER_SELECTED_GLOW = "selected-point-glow";
const LAYER_SELECTED = "selected-point";
const LAYER_TIME_TINT = "time-tint-overlay";

// LGM overlay layer IDs
const SOURCE_ICE = "lgm-ice-src";
const LAYER_ICE_FILL = "lgm-ice-fill";
const LAYER_ICE_BORDER = "lgm-ice-border";
const SOURCE_EXPOSED = "lgm-exposed-src";
const LAYER_EXPOSED_FILL = "lgm-exposed-fill";
const LAYER_EXPOSED_BORDER = "lgm-exposed-border";

// Paleocoastline layer IDs
const SOURCE_COASTLINE = "paleo-coastline-src";
const LAYER_COASTLINE_FILL = "paleo-coastline-fill";
const LAYER_COASTLINE_BORDER = "paleo-coastline-border";

// Era-based marker colours
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

// Time-based map tint: subtle background overlay that shifts with Ma
function timeTintColor(ma: number): string {
  if (ma <= 0) return "rgba(0,0,0,0)";
  if (ma < 0.03) return "rgba(100,140,180,0.06)"; // LGM: cool blue
  if (ma < 0.2) return "rgba(80,120,160,0.05)"; // Pleistocene: cool
  if (ma < 3) return "rgba(90,110,80,0.05)"; // Pliocene/Miocene: warm green
  if (ma < 66) return "rgba(80,110,60,0.06)"; // Mesozoic: warm green
  if (ma < 252) return "rgba(100,80,60,0.06)"; // Late Paleozoic: earthy
  if (ma < 540) return "rgba(70,70,100,0.06)"; // Early Paleozoic: deep blue
  return "rgba(60,50,70,0.05)"; // Precambrian: muted purple
}

// Should LGM ice sheets be visible at this Ma?
function isLGMRange(ma: number): boolean {
  return ma >= 0.015 && ma <= 0.03;
}

// Opacity for LGM layers: fade in/out near boundaries
function lgmOpacity(ma: number): number {
  if (!isLGMRange(ma)) return 0;
  // Peak at 0.021 Ma (LGM), fade towards edges
  const center = 0.021;
  const halfWidth = 0.009;
  const dist = Math.abs(ma - center) / halfWidth;
  return Math.max(0, 1 - dist * 0.6) * 0.55;
}

// Empty GeoJSON for initialization
const EMPTY_FC: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export default function Map({
  center,
  onCenterChange,
  cards = [],
  selectedId,
  onSelect,
  focusOffsetPx = 180,
  ma = 0,
  coastlineGeoJSON,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const loadedRef = useRef(false);

  const cardByIdRef = useRef(new globalThis.Map<string, PlaceCard>());
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

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center,
      zoom: 10,
    });

    mapRef.current = map;

    const emitCenter = () => {
      const c = map.getCenter();
      onCenterChange?.([c.lng, c.lat]);
    };

    map.on("moveend", emitCenter);

    map.on("load", () => {
      loadedRef.current = true;

      // ── Time tint overlay (full-viewport color layer) ──
      map.addSource("time-tint-src", {
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

      map.addLayer({
        id: LAYER_TIME_TINT,
        type: "fill",
        source: "time-tint-src",
        paint: {
          "fill-color": "rgba(0,0,0,0)",
          "fill-opacity": 1,
        },
      });

      // ── Paleocoastline layer (from GPlates) ──
      map.addSource(SOURCE_COASTLINE, {
        type: "geojson",
        data: EMPTY_FC as any,
      });

      map.addLayer({
        id: LAYER_COASTLINE_FILL,
        type: "fill",
        source: SOURCE_COASTLINE,
        paint: {
          "fill-color": "rgba(120,160,100,0.12)",
          "fill-opacity": 0,
        },
      });

      map.addLayer({
        id: LAYER_COASTLINE_BORDER,
        type: "line",
        source: SOURCE_COASTLINE,
        paint: {
          "line-color": "rgba(120,160,100,0.35)",
          "line-width": 1,
          "line-opacity": 0,
        },
      });

      // ── LGM ice sheet overlay ──
      map.addSource(SOURCE_ICE, {
        type: "geojson",
        data: lgmIceGeoJSON() as any,
      });

      map.addLayer({
        id: LAYER_ICE_FILL,
        type: "fill",
        source: SOURCE_ICE,
        paint: {
          "fill-color": "rgba(180,210,240,0.35)",
          "fill-opacity": 0,
        },
      });

      map.addLayer({
        id: LAYER_ICE_BORDER,
        type: "line",
        source: SOURCE_ICE,
        paint: {
          "line-color": "rgba(200,220,250,0.45)",
          "line-width": 1.5,
          "line-dasharray": [4, 3],
          "line-opacity": 0,
        },
      });

      // ── LGM exposed land (land bridges) ──
      map.addSource(SOURCE_EXPOSED, {
        type: "geojson",
        data: lgmExposedLandGeoJSON() as any,
      });

      map.addLayer({
        id: LAYER_EXPOSED_FILL,
        type: "fill",
        source: SOURCE_EXPOSED,
        paint: {
          "fill-color": "rgba(170,150,100,0.25)",
          "fill-opacity": 0,
        },
      });

      map.addLayer({
        id: LAYER_EXPOSED_BORDER,
        type: "line",
        source: SOURCE_EXPOSED,
        paint: {
          "line-color": "rgba(180,160,110,0.40)",
          "line-width": 1,
          "line-dasharray": [3, 2],
          "line-opacity": 0,
        },
      });

      // ── Clustered GeoJSON source ──
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: geojson as any,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 40,
        });
      }

      // ── Cluster circles ──
      if (!map.getLayer(LAYER_CLUSTERS)) {
        map.addLayer({
          id: LAYER_CLUSTERS,
          type: "circle",
          source: SOURCE_ID,
          filter: ["has", "point_count"],
          paint: {
            "circle-radius": [
              "step", ["get", "point_count"],
              13, 10, 17, 30, 22, 100, 28,
            ],
            "circle-color": "rgba(60,60,70,0.82)",
            "circle-stroke-width": 1,
            "circle-stroke-color": "rgba(255,255,255,0.10)",
            "circle-opacity": 0.88,
          },
        });
      }

      // Cluster count text
      if (!map.getLayer(LAYER_CLUSTER_COUNT)) {
        map.addLayer({
          id: LAYER_CLUSTER_COUNT,
          type: "symbol",
          source: SOURCE_ID,
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 11,
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          },
          paint: { "text-color": "rgba(200,200,210,0.90)" },
        });
      }

      // ── Unclustered points — era-coloured ──
      if (!map.getLayer(LAYER_POINTS)) {
        map.addLayer({
          id: LAYER_POINTS,
          type: "circle",
          source: SOURCE_ID,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-radius": 5.5,
            "circle-color": ERA_COLOR_MATCH,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "rgba(0,0,0,0.50)",
            "circle-opacity": 0.92,
          },
        });
      }

      // ── Selected — outer glow ──
      if (!map.getLayer(LAYER_SELECTED_GLOW)) {
        map.addLayer({
          id: LAYER_SELECTED_GLOW,
          type: "circle",
          source: SOURCE_ID,
          filter: ["==", ["get", "id"], ""],
          paint: {
            "circle-radius": 16,
            "circle-color": "rgba(250,192,94,0.0)",
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(250,192,94,0.28)",
            "circle-opacity": 1,
          },
        });
      }

      // ── Selected — centre dot ──
      if (!map.getLayer(LAYER_SELECTED)) {
        map.addLayer({
          id: LAYER_SELECTED,
          type: "circle",
          source: SOURCE_ID,
          filter: ["==", ["get", "id"], ""],
          paint: {
            "circle-radius": 8,
            "circle-color": "rgba(250,192,94,0.30)",
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "rgba(250,192,94,0.70)",
          },
        });
      }

      // ── Cluster click → zoom ──
      map.on("click", LAYER_CLUSTERS, (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const clusterIdRaw = (feature.properties as any)?.cluster_id;
        const clusterId = Number(clusterIdRaw);
        if (!Number.isFinite(clusterId)) return;
        const src: any = map.getSource(SOURCE_ID);
        if (!src || typeof src.getClusterExpansionZoom !== "function") return;
        const coords = (feature.geometry as any).coordinates as [number, number];
        src.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
          if (err) return;
          const z = typeof zoom === "number" ? zoom : Number(zoom);
          map.easeTo({ center: coords, zoom: Number.isFinite(z) ? z : map.getZoom() + 2 });
        });
      });

      // ── Hover tooltip ──
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
      });

      map.on("mousemove", LAYER_POINTS, (e) => {
        map.getCanvas().style.cursor = "pointer";
        const f = e.features?.[0];
        if (!f) return;
        const title = f.properties?.title ?? "";
        const era = f.properties?.era ?? "";
        const coords = (f.geometry as any).coordinates as [number, number];
        popup
          .setLngLat(coords)
          .setHTML(
            `<div style="font-size:11px;line-height:1.4">
               <div style="font-weight:600;color:#f4f4f5">${escapeHtml(title)}</div>
               ${era ? `<div style="color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;margin-top:2px">${escapeHtml(era)}</div>` : ""}
             </div>`
          )
          .addTo(map);
      });

      map.on("mouseleave", LAYER_POINTS, () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      // ── Hover tooltip for LGM layers ──
      const lgmPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
      });

      for (const layerId of [LAYER_ICE_FILL, LAYER_EXPOSED_FILL]) {
        map.on("mousemove", layerId, (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const name = f.properties?.name ?? "";
          const desc = f.properties?.description ?? "";
          if (!name) return;
          lgmPopup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-size:11px;line-height:1.4">
                 <div style="font-weight:600;color:#f4f4f5">${escapeHtml(name)}</div>
                 <div style="color:#9ca3af;font-size:10px;margin-top:2px">${escapeHtml(desc)}</div>
               </div>`
            )
            .addTo(map);
        });

        map.on("mouseleave", layerId, () => {
          lgmPopup.remove();
        });
      }

      // ── Click point → select ──
      map.on("click", LAYER_POINTS, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const id = f.properties?.id as string | undefined;
        if (!id) return;
        const card = cardByIdRef.current.get(id);
        if (card) onSelect?.(card);
      });
    });

    return () => { map.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update source data when cards change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData(geojson as any);
  }, [geojson]);

  // Update selected highlight layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const filter: mapboxgl.FilterSpecification = ["==", ["get", "id"], selectedId ?? ""];
    if (map.getLayer(LAYER_SELECTED)) map.setFilter(LAYER_SELECTED, filter);
    if (map.getLayer(LAYER_SELECTED_GLOW)) map.setFilter(LAYER_SELECTED_GLOW, filter);
  }, [selectedId]);

  // Update time-tint overlay based on Ma
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    if (!map.getLayer(LAYER_TIME_TINT)) return;
    map.setPaintProperty(LAYER_TIME_TINT, "fill-color", timeTintColor(ma));
  }, [ma]);

  // Update LGM ice sheet + exposed land opacity
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    const iceOpacity = lgmOpacity(ma);
    const exposedOpacity = iceOpacity * 0.9;

    // Ice sheets
    if (map.getLayer(LAYER_ICE_FILL)) {
      map.setPaintProperty(LAYER_ICE_FILL, "fill-opacity", iceOpacity);
    }
    if (map.getLayer(LAYER_ICE_BORDER)) {
      map.setPaintProperty(LAYER_ICE_BORDER, "line-opacity", iceOpacity > 0 ? iceOpacity + 0.15 : 0);
    }

    // Exposed land
    if (map.getLayer(LAYER_EXPOSED_FILL)) {
      map.setPaintProperty(LAYER_EXPOSED_FILL, "fill-opacity", exposedOpacity);
    }
    if (map.getLayer(LAYER_EXPOSED_BORDER)) {
      map.setPaintProperty(LAYER_EXPOSED_BORDER, "line-opacity", exposedOpacity > 0 ? exposedOpacity + 0.1 : 0);
    }
  }, [ma]);

  // Update paleocoastline layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    const src = map.getSource(SOURCE_COASTLINE) as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;

    if (coastlineGeoJSON && ma > 0) {
      src.setData(coastlineGeoJSON as any);
      if (map.getLayer(LAYER_COASTLINE_FILL)) {
        map.setPaintProperty(LAYER_COASTLINE_FILL, "fill-opacity", 0.12);
      }
      if (map.getLayer(LAYER_COASTLINE_BORDER)) {
        map.setPaintProperty(LAYER_COASTLINE_BORDER, "line-opacity", 0.35);
      }
    } else {
      src.setData(EMPTY_FC as any);
      if (map.getLayer(LAYER_COASTLINE_FILL)) {
        map.setPaintProperty(LAYER_COASTLINE_FILL, "fill-opacity", 0);
      }
      if (map.getLayer(LAYER_COASTLINE_BORDER)) {
        map.setPaintProperty(LAYER_COASTLINE_BORDER, "line-opacity", 0);
      }
    }
  }, [coastlineGeoJSON, ma]);

  // Fly to center
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center, offset: [0, focusOffsetPx], essential: true });
  }, [center, focusOffsetPx]);

  return <div ref={containerRef} className="w-full h-full" />;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
