"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map from "@/components/Map";
import TimeControls from "@/components/TimeControls";
import ContextPanel from "@/components/ContextPanel";
import Feed from "@/components/Feed";
import Drawer from "@/components/Drawer";
import type { Era, PlaceCard, PlaceKind, PlaceSource } from "@/domain/placeCard";
import { scoreCard } from "@/domain/rank";
import { dedupe } from "@/domain/dedupe";
import { eraFromMa } from "@/domain/time";
import type { ReconstructionResult } from "@/app/api/reconstruct/route";

// ---------------------------------------------------------------------------
// Chip (re-used for source/kind filters)
// ---------------------------------------------------------------------------

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
        "backdrop-blur-sm select-none whitespace-nowrap",
        active
          ? "bg-[rgba(var(--accent),0.16)] border-[rgba(var(--accent),0.32)] text-zinc-50"
          : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-zinc-400 hover:bg-[rgba(255,255,255,0.06)] hover:text-zinc-200 hover:border-[rgba(255,255,255,0.12)]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Kind chips config
// ---------------------------------------------------------------------------

const KIND_CHIPS: Array<{ kind: PlaceKind; label: string }> = [
  { kind: "ruins", label: "Ruins" },
  { kind: "castle", label: "Castles" },
  { kind: "archaeological_site", label: "Archaeology" },
  { kind: "prehistoric_site", label: "Prehistoric Sites" },
  { kind: "megalith", label: "Megaliths" },
  { kind: "fossil_occurrence", label: "Fossils" },
  { kind: "memorial", label: "Memorials" },
  { kind: "monument", label: "Monuments" },
  { kind: "battlefield", label: "Battlefields" },
  { kind: "volcano", label: "Volcanoes" },
  { kind: "impact_crater", label: "Craters" },
  { kind: "attraction", label: "Attractions" },
  { kind: "historic", label: "Historic" },
];

// ---------------------------------------------------------------------------
// Main page
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

  // --- Paleo reconstruction data ---
  const [paleoData, setPaleoData] = useState<ReconstructionResult | null>(null);
  const paleoFetchRef = useRef<AbortController | null>(null);

  // --- Paleocoastline data ---
  const [coastlineGeoJSON, setCoastlineGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const coastlineFetchRef = useRef<AbortController | null>(null);
  const lastCoastlineMaRef = useRef<number>(0);

  // Effective center for search
  const activeCenter = useMemo<[number, number]>(() => mapCenter ?? center, [mapCenter, center]);

  // Effective era: in deep time mode, derive from Ma
  const effectiveEra = useMemo(() => {
    if (deepTimeEnabled && ma > 0) return eraFromMa(ma);
    return activeEra;
  }, [deepTimeEnabled, ma, activeEra]);

  // --- Filtering + ranking pipeline ---
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (!activeSources.includes(c.source)) return false;
      if (activeKinds.length > 0 && !activeKinds.includes(c.kind)) return false;
      if (!deepTimeEnabled && activeEra && c.era !== activeEra) return false;
      // In deep time mode: show all eras but ranking handles relevance
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

    // Only re-fetch if Ma changed significantly (coastlines are rounded to 5Ma on server)
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

  // Fetch coastlines when Ma changes (debounced, only for significant values)
  useEffect(() => {
    if (!deepTimeEnabled || ma <= 0) {
      setCoastlineGeoJSON(null);
      lastCoastlineMaRef.current = 0;
      return;
    }
    // Only fetch coastlines for Ma > 1 (meaningful plate reconstructions)
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

      // Build search promises: always wiki + osm; add pbdb if deep time or geological era
      const searches: Promise<Response>[] = [
        fetch(`/api/search/wiki?lat=${lat}&lng=${lng}&radius=9000&limit=30`),
        fetch(`/api/search/osm?lat=${lat}&lng=${lng}&radius=9000&limit=160`),
      ];

      // Add PBDB if deep time enabled, geological era selected, or any geological/prehistoric filter
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

      // Warn if any had issues
      if (results[1]?.error) console.warn("OSM search error:", results[1]);
      if (results[2]?.warning) console.warn("PBDB:", results[2].warning);

      const activeMa = deepTimeEnabled ? ma : null;
      const merged = dedupe([...wikiCards, ...osmCards, ...pbdbCards])
        .sort((a, b) => scoreCard(b, effectiveEra, activeMa) - scoreCard(a, effectiveEra, activeMa))
        .slice(0, 150);

      // Track new card IDs for animation
      const existingIds = new Set(cards.map((c) => c.id));
      const freshIds = new Set(merged.filter((c) => !existingIds.has(c.id)).map((c) => c.id));
      setNewCardIds(freshIds);

      setCards(merged);

      // Enable PBDB source filter if fossils found
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

  const handleSurpriseMe = () => {
    if (rankedCards.length === 0) return;
    const card = rankedCards[0];
    setSelected(card);
    setCenter([card.coords.lng, card.coords.lat]);
  };

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
  };

  const hasActiveFilters =
    activeKinds.length > 0 ||
    activeSources.length < 2 ||
    activeEra !== null ||
    deepTimeEnabled;

  // Count nearby fossils for drawer narrative
  const nearbyFossilCount = useMemo(() => {
    if (!selected) return 0;
    return cards.filter(
      (c) => c.source === "pbdb" && c.id !== selected.id
    ).length;
  }, [cards, selected]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top bar ── */}
      <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.96)] backdrop-blur-md flex gap-2 items-center z-10">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleGeocode(); }}
            placeholder="Navigate to a place..."
            className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-zinc-100 text-sm placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.30)] focus:border-[rgba(var(--accent),0.30)] transition"
          />
        </div>

        <button
          onClick={handleGeocode}
          className="px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] text-zinc-200 text-sm font-medium transition"
        >
          Go
        </button>

        <button
          onClick={handleSearchArea}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-[rgba(var(--accent),0.32)] bg-[rgba(var(--accent),0.12)] hover:bg-[rgba(var(--accent),0.18)] text-zinc-50 text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search area"}
        </button>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,1)] overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-[rgba(255,255,255,0.05)]">
            <div className="flex items-baseline justify-between">
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-100">Substrata</h1>
              <span className="text-[11px] text-zinc-600">
                {rankedCards.length > 0 ? `${rankedCards.length} places` : ""}
              </span>
            </div>
            <p className="text-[11.5px] text-zinc-600 mt-0.5 tracking-wide">Explore layers of time</p>
          </div>

          {/* ── Time controls (Era chips + Deep Time toggle + Ma slider) ── */}
          <TimeControls
            activeEra={activeEra}
            onEraChange={setActiveEra}
            deepTimeEnabled={deepTimeEnabled}
            onDeepTimeToggle={() => setDeepTimeEnabled((v) => !v)}
            ma={ma}
            onMaChange={setMa}
          />

          {/* ── Context panel ── */}
          <ContextPanel
            ma={ma}
            activeEra={activeEra}
            deepTimeEnabled={deepTimeEnabled}
            paleoData={paleoData}
          />

          {/* ── Source + Kind filters ── */}
          <div className="px-4 pt-3 pb-3 border-b border-[rgba(255,255,255,0.05)]">
            <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2 font-medium">Source</div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Chip label="Wikipedia" active={activeSources.includes("wikipedia")} onClick={() => toggleSource("wikipedia")} />
              <Chip label="OSM" active={activeSources.includes("osm")} onClick={() => toggleSource("osm")} />
              {cards.some((c) => c.source === "pbdb") && (
                <Chip label="Fossils" active={activeSources.includes("pbdb")} onClick={() => toggleSource("pbdb")} />
              )}
            </div>

            <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2 font-medium">Type</div>
            <div className="flex flex-wrap gap-1.5">
              {KIND_CHIPS.map(({ kind, label }) => (
                <Chip
                  key={kind}
                  label={label}
                  active={activeKinds.includes(kind)}
                  onClick={() => toggleKind(kind)}
                />
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-2.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition underline underline-offset-2"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] flex gap-2">
            <button
              onClick={handleSurpriseMe}
              disabled={rankedCards.length === 0}
              className="flex-1 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-zinc-300 text-xs font-medium transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ✦ Surprise me
            </button>
          </div>

          {/* ── Feed ── */}
          <Feed
            cards={rankedCards}
            newCardIds={newCardIds}
            loading={loading}
            error={error}
            onCardSelect={(card) => {
              setSelected(card);
              setCenter([card.coords.lng, card.coords.lat]);
            }}
          />
        </div>

        {/* ── Map ── */}
        <div className="flex-1 relative">
          <Map
            center={center}
            onCenterChange={setMapCenter}
            cards={rankedCards}
            selectedId={selected?.id ?? null}
            onSelect={(c) => {
              setSelected(c);
              setCenter([c.coords.lng, c.coords.lat]);
            }}
            focusOffsetPx={200}
            ma={deepTimeEnabled ? ma : 0}
            coastlineGeoJSON={deepTimeEnabled ? coastlineGeoJSON : null}
          />

          {/* ── Map legend (when overlays active) ── */}
          {deepTimeEnabled && ma > 0 && (
            <MapLegend ma={ma} hasCoastlines={!!coastlineGeoJSON} />
          )}

          {/* ── Attribution footer ── */}
          <div className="absolute bottom-1 right-2 text-[8px] text-zinc-700 pointer-events-none z-10">
            OSM © contributors · PBDB CC BY · GPlates / EarthByte
          </div>

          {/* ── Drawer ── */}
          {selected && (
            <Drawer
              card={selected}
              onClose={() => setSelected(null)}
              ma={deepTimeEnabled ? ma : null}
              paleoLat={paleoData?.paleoLat}
              paleoLng={paleoData?.paleoLng}
              nearbyFossilCount={nearbyFossilCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Map legend overlay (shown when deep time overlays are active)
// ---------------------------------------------------------------------------

function MapLegend({ ma, hasCoastlines }: { ma: number; hasCoastlines: boolean }) {
  const isLGM = ma >= 0.015 && ma <= 0.03;

  if (!isLGM && !hasCoastlines) return null;

  return (
    <div className="absolute top-3 right-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(9,9,11,0.90)] backdrop-blur-md px-3 py-2.5 z-10 space-y-1.5 pointer-events-none">
      <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-medium">Overlays</div>

      {isLGM && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(180,210,240,0.5)" }} />
            <span className="text-[10px] text-zinc-400">Ice sheets</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(170,150,100,0.4)" }} />
            <span className="text-[10px] text-zinc-400">Exposed land</span>
          </div>
        </>
      )}

      {hasCoastlines && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(120,160,100,0.3)", border: "1px solid rgba(120,160,100,0.5)" }} />
          <span className="text-[10px] text-zinc-400">Paleocoastlines</span>
        </div>
      )}
    </div>
  );
}
