"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DesktopLayout from "@/components/layouts/DesktopLayout";
import MobileLayout from "@/components/layouts/MobileLayout";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import type { Era, PlaceCard, PlaceKind, PlaceSource } from "@/domain/placeCard";
import type { MapTheme } from "@/components/Map";
import { scoreCard } from "@/domain/rank";
import { dedupe } from "@/domain/dedupe";
import { eraFromMa } from "@/domain/time";
import { seaLevelAtMa } from "@/domain/lgm";
import { eraFromYears } from "@/domain/humanHistory";
import { haptic } from "@/domain/haptics";
import type { ReconstructionResult } from "@/app/api/reconstruct/route";

// ---------------------------------------------------------------------------
// Main page — state owner, delegates rendering to layout components
// ---------------------------------------------------------------------------

export default function Home() {
  // --- Navigation state ---
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState<[number, number]>([-0.1276, 51.5072]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-0.1276, 51.5072]);

  // --- Card data ---
  const [cards, setCards] = useState<PlaceCard[]>([]);
  const [newCardIds, setNewCardIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<PlaceCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Filters ---
  const [activeSources, setActiveSources] = useState<PlaceSource[]>(["wikipedia", "osm"]);
  const [activeKinds, setActiveKinds] = useState<PlaceKind[]>([]);
  const [activeEra, setActiveEra] = useState<Era | null>(null);

  // --- Deep Time ---
  const [deepTimeEnabled, setDeepTimeEnabled] = useState(false);
  const [ma, setMa] = useState(0);

  // --- Human History (Recent History mode, 0–10,000 years) ---
  const [historicalYears, setHistoricalYears] = useState(0);

  // --- Map theme ---
  const [mapTheme, setMapTheme] = useState<MapTheme>("terrain");

  // --- Overlays ---
  const [seaLevelOverride, setSeaLevelOverride] = useState<number | null>(null);
  const [overlayBoost, setOverlayBoost] = useState(false);
  const [paleoEnabled, setPaleoEnabled] = useState(false);
  const [paleoOpacity, setPaleoOpacity] = useState(0.5);

  // --- Paleo reconstruction data ---
  const [paleoData, setPaleoData] = useState<ReconstructionResult | null>(null);
  const paleoFetchRef = useRef<AbortController | null>(null);

  // --- Paleocoastline data ---
  const [coastlineGeoJSON, setCoastlineGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const coastlineFetchRef = useRef<AbortController | null>(null);
  const lastCoastlineMaRef = useRef<number>(0);

  // --- My Finds ---
  const { saves: savedPlaces, save: savePlace, unsave: unsavePlace } = useSavedPlaces();

  // --- Responsive layout ---
  const isMobile = useMediaQuery("(max-width: 767px)");

  // --- Restore state from URL params (share links) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get("lat") ?? "");
    const lng = parseFloat(params.get("lng") ?? "");
    const maParam = parseFloat(params.get("ma") ?? "");
    const seaParam = params.get("sea");
    const paleoParam = params.get("paleo") === "1";
    const boostParam = params.get("boost") === "1";

    if (!isNaN(lat) && !isNaN(lng)) setCenter([lng, lat]);
    if (!isNaN(maParam) && maParam > 0) {
      setMa(maParam);
      setDeepTimeEnabled(true);
    }
    if (seaParam !== null && !isNaN(parseFloat(seaParam))) {
      setSeaLevelOverride(parseFloat(seaParam));
    }
    if (paleoParam) setPaleoEnabled(true);
    if (boostParam) setOverlayBoost(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effective center for search
  const activeCenter = useMemo<[number, number]>(() => mapCenter ?? center, [mapCenter, center]);

  // Effective era: drives card ranking.
  // Deep Time → derive from Ma; Recent History → derive from years; else manual era filter.
  const effectiveEra = useMemo(() => {
    if (deepTimeEnabled && ma > 0) return eraFromMa(ma);
    if (!deepTimeEnabled && historicalYears > 0) return eraFromYears(historicalYears);
    return activeEra;
  }, [deepTimeEnabled, ma, activeEra, historicalYears]);

  // --- Filtering + ranking pipeline ---
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (!activeSources.includes(c.source)) return false;
      if (activeKinds.length > 0 && !activeKinds.includes(c.kind)) return false;
      if (!deepTimeEnabled && activeEra && c.era !== activeEra) return false;
      return true;
    });
  }, [cards, activeSources, activeKinds, activeEra, deepTimeEnabled]);

  const rankedCards = useMemo(() => {
    const activeMa = deepTimeEnabled ? ma : null;
    return [...filteredCards].sort(
      (a, b) => scoreCard(b, effectiveEra, activeMa) - scoreCard(a, effectiveEra, activeMa)
    );
  }, [filteredCards, effectiveEra, deepTimeEnabled, ma]);

  // --- GPlates reconstruction fetch ---
  const fetchPaleoData = useCallback(async (lat: number, lng: number, maVal: number) => {
    if (paleoFetchRef.current) paleoFetchRef.current.abort();
    if (maVal <= 0) {
      setPaleoData(null);
      return;
    }
    const controller = new AbortController();
    paleoFetchRef.current = controller;
    try {
      const res = await fetch(
        `/api/reconstruct?lat=${lat}&lng=${lng}&ma=${maVal}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      if (!controller.signal.aborted) setPaleoData(data);
    } catch {
      // Abort or network error — ignore
    }
  }, []);

  // --- GPlates coastline fetch ---
  const fetchCoastlines = useCallback(async (maVal: number) => {
    if (coastlineFetchRef.current) coastlineFetchRef.current.abort();
    if (maVal <= 0) {
      setCoastlineGeoJSON(null);
      lastCoastlineMaRef.current = 0;
      return;
    }

    const roundedMa = maVal < 1 ? Math.round(maVal * 100) / 100 : Math.round(maVal / 5) * 5;
    if (roundedMa === lastCoastlineMaRef.current) return;

    const controller = new AbortController();
    coastlineFetchRef.current = controller;
    try {
      const res = await fetch(
        `/api/coastlines?ma=${maVal}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      if (!controller.signal.aborted) {
        setCoastlineGeoJSON(data.geojson ?? null);
        lastCoastlineMaRef.current = roundedMa;
      }
    } catch {
      // Abort or network error — ignore
    }
  }, []);

  // Fetch paleo data when Ma changes or center changes (debounced)
  useEffect(() => {
    if (!deepTimeEnabled || ma <= 0) {
      setPaleoData(null);
      return;
    }
    const timer = setTimeout(() => {
      const [lng, lat] = activeCenter;
      fetchPaleoData(lat, lng, ma);
    }, 600);
    return () => clearTimeout(timer);
  }, [deepTimeEnabled, ma, activeCenter, fetchPaleoData]);

  // Fetch coastlines when Ma changes (debounced)
  useEffect(() => {
    if (!deepTimeEnabled || ma <= 0) {
      setCoastlineGeoJSON(null);
      lastCoastlineMaRef.current = 0;
      return;
    }
    if (ma < 1) {
      setCoastlineGeoJSON(null);
      return;
    }
    const timer = setTimeout(() => {
      fetchCoastlines(ma);
    }, 800);
    return () => clearTimeout(timer);
  }, [deepTimeEnabled, ma, fetchCoastlines]);

  // --- Handlers ---
  const handleGeocode = async () => {
    const q = query.trim();
    if (!q) return;
    setError(null);
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data?.features?.length) {
      const [lng, lat] = data.features[0].center as [number, number];
      setCenter([lng, lat]);
    } else {
      setError("No results found for that search.");
    }
  };

  const handleSearchArea = async () => {
    setLoading(true);
    setError(null);
    setSelected(null);

    try {
      const [lng, lat] = activeCenter;

      const searches: Promise<Response>[] = [
        fetch(`/api/search/wiki?lat=${lat}&lng=${lng}&radius=9000&limit=30`),
        fetch(`/api/search/osm?lat=${lat}&lng=${lng}&radius=9000&limit=160`),
      ];

      const shouldFetchPBDB =
        deepTimeEnabled ||
        activeEra === "geological" ||
        activeEra === "prehistoric" ||
        activeSources.includes("pbdb");

      if (shouldFetchPBDB) {
        const pbdbMa = deepTimeEnabled && ma > 0 ? `&ma=${ma}` : "";
        searches.push(
          fetch(`/api/search/pbdb?lat=${lat}&lng=${lng}&radius=50&limit=50${pbdbMa}`)
        );
      }

      const responses = await Promise.all(searches);
      const results = await Promise.all(responses.map((r) => r.json()));

      const wikiCards: PlaceCard[] = results[0]?.cards ?? [];
      const osmCards: PlaceCard[] = results[1]?.cards ?? [];
      const pbdbCards: PlaceCard[] = results[2]?.cards ?? [];

      if (results[1]?.error) console.warn("OSM search error:", results[1]);
      if (results[2]?.warning) console.warn("PBDB:", results[2].warning);

      const activeMa = deepTimeEnabled ? ma : null;
      const merged = dedupe([...wikiCards, ...osmCards, ...pbdbCards])
        .sort((a, b) => scoreCard(b, effectiveEra, activeMa) - scoreCard(a, effectiveEra, activeMa))
        .slice(0, 150);

      const existingIds = new Set(cards.map((c) => c.id));
      const freshIds = new Set(merged.filter((c) => !existingIds.has(c.id)).map((c) => c.id));
      setNewCardIds(freshIds);

      setCards(merged);

      if (pbdbCards.length > 0 && !activeSources.includes("pbdb")) {
        setActiveSources((prev) => prev.includes("pbdb") ? prev : [...prev, "pbdb"]);
      }

      if (merged.length === 0) {
        setError("No results found in this area.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Search failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = useCallback((card: PlaceCard) => {
    setSelected(card);
    setCenter([card.coords.lng, card.coords.lat]);
  }, []);

  const handleSurpriseMe = () => {
    if (rankedCards.length === 0) return;
    const card = rankedCards[0];
    setSelected(card);
    setCenter([card.coords.lng, card.coords.lat]);
  };

  const handleWander = useCallback(
    (coords: [number, number]) => {
      setCenter(coords);
      setMapCenter(coords); // update search center immediately
      const [lng, lat] = coords;
      setLoading(true);
      setError(null);
      setSelected(null);
      const searches: Promise<Response>[] = [
        fetch(`/api/search/wiki?lat=${lat}&lng=${lng}&radius=9000&limit=30`),
        fetch(`/api/search/osm?lat=${lat}&lng=${lng}&radius=9000&limit=160`),
      ];
      Promise.all(searches)
        .then((responses) => Promise.all(responses.map((r) => r.json())))
        .then((results) => {
          const wikiCards: PlaceCard[] = results[0]?.cards ?? [];
          const osmCards: PlaceCard[] = results[1]?.cards ?? [];
          const merged = dedupe([...wikiCards, ...osmCards])
            .sort((a, b) => scoreCard(b, effectiveEra, null) - scoreCard(a, effectiveEra, null))
            .slice(0, 150);
          const existingIds = new Set(cards.map((c) => c.id));
          setNewCardIds(new Set(merged.filter((c) => !existingIds.has(c.id)).map((c) => c.id)));
          setCards(merged);
          if (merged.length === 0) setError("No results found in this area.");
        })
        .catch((e) => {
          setError(`Search failed: ${e instanceof Error ? e.message : String(e)}`);
        })
        .finally(() => setLoading(false));
    },
    [cards, effectiveEra]
  );

  const toggleSource = (s: PlaceSource) => {
    setActiveSources((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleKind = (k: PlaceKind) => {
    setActiveKinds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  };

  const resetFilters = () => {
    setActiveSources(["wikipedia", "osm"]);
    setActiveKinds([]);
    setActiveEra(null);
    setDeepTimeEnabled(false);
    setMa(0);
    setSeaLevelOverride(null);
    setOverlayBoost(false);
    setPaleoEnabled(false);
    setPaleoOpacity(0.5);
  };

  const hasActiveFilters =
    activeKinds.length > 0 ||
    activeSources.length < 2 ||
    activeEra !== null ||
    deepTimeEnabled;

  const nearbyFossilCount = useMemo(() => {
    if (!selected) return 0;
    return cards.filter(
      (c) => c.source === "pbdb" && c.id !== selected.id
    ).length;
  }, [cards, selected]);

  // --- My Finds handlers ---
  const handleSavePlace = useCallback(
    (card: PlaceCard) => {
      haptic(12);
      savePlace({
        id: card.id,
        title: card.title,
        lat: card.coords.lat,
        lng: card.coords.lng,
        era: card.era,
        ma: deepTimeEnabled ? ma : 0,
        overlays: {
          seaLevelMeters: seaLevelOverride ?? (deepTimeEnabled && ma > 0 ? seaLevelAtMa(ma) : null),
          paleogeography: paleoEnabled,
        },
        savedAt: new Date().toISOString(),
      });
    },
    [savePlace, deepTimeEnabled, ma, seaLevelOverride, paleoEnabled]
  );

  const handleUnsavePlace = useCallback(
    (id: string) => {
      haptic(8);
      unsavePlace(id);
    },
    [unsavePlace]
  );

  const handleRestoreFind = useCallback(
    (place: import("@/domain/savedPlaces").SavedPlace) => {
      setCenter([place.lng, place.lat]);
      if (place.ma > 0) {
        setMa(place.ma);
        setDeepTimeEnabled(true);
      } else {
        setDeepTimeEnabled(false);
        setMa(0);
      }
      if (place.overlays.seaLevelMeters !== null) {
        setSeaLevelOverride(place.overlays.seaLevelMeters);
      }
      if (place.overlays.paleogeography) {
        setPaleoEnabled(true);
      }
    },
    []
  );

  // --- Layout props (shared between desktop and mobile) ---
  const layoutProps = {
    query,
    onQueryChange: setQuery,
    onGeocode: handleGeocode,
    onSearchArea: handleSearchArea,
    loading,
    cards,
    rankedCards,
    newCardIds,
    error,
    selected,
    onCardSelect: handleCardSelect,
    onCloseSelected: () => setSelected(null),
    activeSources,
    onToggleSource: toggleSource,
    activeKinds,
    onToggleKind: toggleKind,
    hasActiveFilters,
    onResetFilters: resetFilters,
    activeEra,
    onEraChange: setActiveEra,
    deepTimeEnabled,
    onDeepTimeToggle: () => setDeepTimeEnabled((v) => !v),
    ma,
    onMaChange: setMa,
    historicalYears,
    onHistoricalYearsChange: setHistoricalYears,
    seaLevelOverride,
    onSeaLevelChange: setSeaLevelOverride,
    overlayBoost,
    onOverlayBoostToggle: () => setOverlayBoost((v) => !v),
    paleoEnabled,
    onPaleoToggle: () => setPaleoEnabled((v) => !v),
    paleoOpacity,
    onPaleoOpacityChange: setPaleoOpacity,
    paleoData,
    coastlineGeoJSON,
    center,
    onCenterChange: setMapCenter,
    mapTheme,
    onMapThemeChange: setMapTheme,
    nearbyFossilCount,
    onSurpriseMe: handleSurpriseMe,
    onWander: handleWander,
    savedPlaces,
    onSavePlace: handleSavePlace,
    onUnsavePlace: handleUnsavePlace,
    onRestoreFind: handleRestoreFind,
    onViewOnMap: ({ lat, lng, ma: entryMa }: { lat: number; lng: number; ma?: number }) => {
      setCenter([lng, lat]);
      if (entryMa && entryMa > 0) {
        setMa(entryMa);
        setDeepTimeEnabled(true);
        setPaleoEnabled(true);
      }
    },
  };

  return isMobile ? (
    <MobileLayout {...layoutProps} />
  ) : (
    <DesktopLayout {...layoutProps} />
  );
}
