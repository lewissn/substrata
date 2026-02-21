"use client";

import { useEffect, useMemo, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { PlaceCard } from "@/domain/placeCard";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Props = {
  center: [number, number]; // [lng, lat]
  onCenterChange?: (center: [number, number]) => void;
  cards?: PlaceCard[];
  selectedId?: string | null;
  onSelect?: (card: PlaceCard) => void;
  focusOffsetPx?: number;
};

const SOURCE_ID = "places";
const LAYER_CLUSTERS = "clusters";
const LAYER_CLUSTER_COUNT = "cluster-count";
const LAYER_POINTS = "unclustered-points";
const LAYER_SELECTED_GLOW = "selected-point-glow";
const LAYER_SELECTED = "selected-point";

// Era-based colors as a Mapbox match expression value
// These map to ERA_COLORS in era.ts but defined here as raw strings for GL expressions
const ERA_COLOR_MATCH: mapboxgl.Expression = [
  "match",
  ["get", "era"],
  "geological",   "rgba(180,70,70,0.92)",
  "prehistoric",  "rgba(185,140,80,0.92)",
  "ancient",      "rgba(212,168,80,0.92)",
  "medieval",     "rgba(120,148,180,0.92)",
  "modern",       "rgba(160,160,170,0.88)",
  /* default */   "rgba(160,160,170,0.88)",
];

export default function Map({
  center,
  onCenterChange,
  cards = [],
  selectedId,
  onSelect,
  focusOffsetPx = 180,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const loadedRef = useRef(false);

  const cardByIdRef = useRef(new globalThis.Map<string, PlaceCard>());
  useEffect(() => {
    cardByIdRef.current = new globalThis.Map(cards.map((c) => [c.id, c]));
  }, [cards]);

  const geojson = useMemo(() => {
    return {
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
    };
  }, [cards]);

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

      // Clustered GeoJSON source
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: geojson as any,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 40,
        });
      }

      // ── Cluster circles (softer, slightly translucent) ──
      if (!map.getLayer(LAYER_CLUSTERS)) {
        map.addLayer({
          id: LAYER_CLUSTERS,
          type: "circle",
          source: SOURCE_ID,
          filter: ["has", "point_count"],
          paint: {
            "circle-radius": [
              "step",
              ["get", "point_count"],
              13,
              10,
              17,
              30,
              22,
              100,
              28,
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
          paint: {
            "text-color": "rgba(200,200,210,0.90)",
          },
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

      // ── Selected — outer glow ring ──
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

      // ── Click cluster → zoom in ──
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
