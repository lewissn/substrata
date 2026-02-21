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

  // keeps the selected point visible above your bottom drawer
  focusOffsetPx?: number; // e.g. 180
};

const SOURCE_ID = "places";
const LAYER_CLUSTERS = "clusters";
const LAYER_CLUSTER_COUNT = "cluster-count";
const LAYER_POINTS = "unclustered-points";
const LAYER_SELECTED = "selected-point";

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

  // Keep latest card lookup for click handlers
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
        },
      })),
    };
  }, [cards]);

  // init map once
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

      // Add clustered source
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: geojson as any,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 42,
        });
      }

      // Cluster circles
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
              14, // <= 10
              10,
              18, // <= 30
              30,
              24, // <= 100
              100,
              30,
            ],
            "circle-opacity": 0.9,
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
            "text-size": 12,
          },
          paint: {},
        });
      }

      // Unclustered points
      if (!map.getLayer(LAYER_POINTS)) {
        map.addLayer({
          id: LAYER_POINTS,
          type: "circle",
          source: SOURCE_ID,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-radius": 6,
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(0,0,0,0.45)",
            // subtle differentiation by source for now
            "circle-color": [
  "match",
  ["get", "source"],
  "wikipedia",
  "rgba(255,255,255,0.85)",
  "osm",
  "rgba(250,192,94,0.9)",
  "rgba(255,255,255,0.7)",
],
          },
        });
      }

      // Selected point highlight (separate layer)
      if (!map.getLayer(LAYER_SELECTED)) {
        map.addLayer({
          id: LAYER_SELECTED,
          type: "circle",
          source: SOURCE_ID,
          filter: ["==", ["get", "id"], ""], // will be set by effect
          paint: {
            "circle-radius": 10,
            "circle-color": "rgba(250,192,94,0.22)",
"circle-stroke-width": 1,
"circle-stroke-color": "rgba(250,192,94,0.35)",
          },
        });
      }

      // Click cluster -> zoom in
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
    map.easeTo({
      center: coords,
      zoom: Number.isFinite(z) ? z : map.getZoom() + 2,
    });
  });
});

      // Hover tooltip
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
        const coords = (f.geometry as any).coordinates as [number, number];
        popup.setLngLat(coords).setHTML(`<div style="font-size:12px">${escapeHtml(title)}</div>`).addTo(map);
      });

      map.on("mouseleave", LAYER_POINTS, () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      // Click point -> select
      map.on("click", LAYER_POINTS, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const id = f.properties?.id as string | undefined;
        if (!id) return;
        const card = cardByIdRef.current.get(id);
        if (card) onSelect?.(card);
      });
    });

    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update source data whenever cards change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!src) return;
    src.setData(geojson as any);
  }, [geojson]);

  // Update selected highlight filter
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    if (!map.getLayer(LAYER_SELECTED)) return;
    map.setFilter(LAYER_SELECTED, ["==", ["get", "id"], selectedId ?? ""]);
  }, [selectedId]);

  // Fly to requested center (with offset so selected stays visible above drawer)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center,
      // This offset is the fix for “it moves away / out of view”
      // It intentionally positions the target ABOVE your bottom drawer.
      offset: [0, focusOffsetPx],
      essential: true,
    });
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