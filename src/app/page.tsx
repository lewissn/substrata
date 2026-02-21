"use client";

import { useMemo, useState } from "react";
import Map from "@/components/Map";
import type { PlaceCard, PlaceKind, PlaceSource } from "@/domain/placeCard";
import { dedupe, scoreCard } from "@/domain/rank";

function formatDistance(m?: number) {
  if (m == null) return "";
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

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
        "px-3 py-1.5 rounded-full text-xs font-medium border transition",
        "backdrop-blur",
        active
          ? "bg-[rgba(var(--accent),0.18)] border-[rgba(var(--accent),0.35)] text-zinc-50"
          : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-zinc-300 hover:bg-[rgba(255,255,255,0.06)] hover:text-zinc-100",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

const KIND_CHIPS: Array<{ kind: PlaceKind; label: string }> = [
  { kind: "ruins", label: "Ruins" },
  { kind: "castle", label: "Castles" },
  { kind: "archaeological_site", label: "Archaeology" },
  { kind: "memorial", label: "Memorials" },
  { kind: "monument", label: "Monuments" },
  { kind: "battlefield", label: "Battlefields" },
  { kind: "attraction", label: "Attractions" },
  { kind: "historic", label: "Historic" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState<[number, number]>([-0.1276, 51.5072]); // [lng, lat] flyTo target
  const [mapCenter, setMapCenter] = useState<[number, number]>([-0.1276, 51.5072]); // current view center

  const [cards, setCards] = useState<PlaceCard[]>([]);
  const [selected, setSelected] = useState<PlaceCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeSources, setActiveSources] = useState<PlaceSource[]>([
    "wikipedia",
    "osm",
  ]);
  const [activeKinds, setActiveKinds] = useState<PlaceKind[]>([]); // empty = all

  const activeCenter = useMemo<[number, number]>(() => {
    return mapCenter ?? center;
  }, [mapCenter, center]);

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (!activeSources.includes(c.source)) return false;
      if (activeKinds.length > 0 && !activeKinds.includes(c.kind)) return false;
      return true;
    });
  }, [cards, activeSources, activeKinds]);

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

      const [wikiRes, osmRes] = await Promise.all([
        fetch(`/api/search/wiki?lat=${lat}&lng=${lng}&radius=9000&limit=30`),
        fetch(`/api/search/osm?lat=${lat}&lng=${lng}&radius=9000&limit=160`),
      ]);

      const wikiData = await wikiRes.json();
      const osmData = await osmRes.json();

      // In case Overpass returns an error payload
      if (osmData?.error) {
        console.warn("OSM search error:", osmData);
      }

      const merged = dedupe([
        ...(wikiData.cards ?? []),
        ...(osmData.cards ?? []),
      ])
        .sort((a, b) => scoreCard(b) - scoreCard(a))
        .slice(0, 120);

      setCards(merged);
      if (merged.length === 0) {
        setError("No results found in this area. Try zooming out and searching again.");
      }
    } catch (e: any) {
      setError(`Search failed: ${String(e?.message ?? e)}`);
    } finally {
      setLoading(false);
    }
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
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(12,12,14,0.9)] backdrop-blur flex gap-2 items-center">
  <div className="flex-1">
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleGeocode();
      }}
      placeholder="Search a place..."
      className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-[rgba(var(--accent),0.35)] focus:border-[rgba(var(--accent),0.35)]"
    />
  </div>

  <button
    onClick={handleGeocode}
    className="px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] text-zinc-100 font-medium transition"
  >
    Search
  </button>

  <button
    onClick={handleSearchArea}
    className="px-4 py-3 rounded-xl border border-[rgba(var(--accent),0.35)] bg-[rgba(var(--accent),0.14)] hover:bg-[rgba(var(--accent),0.20)] text-zinc-50 font-semibold transition"
  >
    {loading ? "Searching…" : "Search this area"}
  </button>
</div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Feed */}
        <div className="w-[420px] border-r border-[rgba(255,255,255,0.08)] bg-[rgba(12,12,14,1)] overflow-y-auto p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Discover</h2>
            <div className="text-xs text-neutral-500">
              {filteredCards.length > 0 ? `${filteredCards.length} shown` : ""}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Chip
              label="Stories"
              active={activeSources.includes("wikipedia")}
              onClick={() => toggleSource("wikipedia")}
            />
            <Chip
              label="OSM"
              active={activeSources.includes("osm")}
              onClick={() => toggleSource("osm")}
            />

            <div className="w-full h-px bg-neutral-800 my-1" />

            {KIND_CHIPS.map(({ kind, label }) => (
              <Chip
                key={kind}
                label={label}
                active={activeKinds.includes(kind)}
                onClick={() => toggleKind(kind)}
              />
            ))}

            {(activeKinds.length > 0 || activeSources.length < 2) && (
              <Chip label="Reset" active={false} onClick={resetFilters} />
            )}
          </div>

          {error ? (
            <div className="mt-4 text-sm text-neutral-300 border border-neutral-800 rounded-lg p-3 bg-neutral-900/40">
              {error}
            </div>
          ) : null}

          {filteredCards.length === 0 && !loading && !error ? (
            <p className="mt-4 text-neutral-500 text-sm">
              Move the map, then press{" "}
              <span className="text-neutral-300">Search this area</span>.
            </p>
          ) : null}

          <div className="mt-4 space-y-3">
            {filteredCards.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelected(c);
                  setCenter([c.coords.lng, c.coords.lat]);
                }}
                className="w-full text-left rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-3 hover:bg-[rgba(255,255,255,0.04)] transition shadow-soft"
              >
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-md bg-neutral-800 overflow-hidden flex-shrink-0">
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{c.title}</div>
                      <div className="text-xs text-neutral-500">{formatDistance(c.distanceM)}</div>
                    </div>

                    <div className="text-xs text-neutral-500 mt-0.5">
                      {c.source === "wikipedia" ? "wikipedia" : c.kind.replaceAll("_", " ")}
                    </div>

                    <div className="text-sm text-zinc-300/90 leading-relaxed line-clamp-2 mt-1">
                      {c.summary ?? (c.source === "osm" ? "OpenStreetMap feature" : "Wikipedia article")}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <Map
            center={center}
            onCenterChange={setMapCenter}
            cards={filteredCards}
            selectedId={selected?.id ?? null}
            onSelect={(c) => {
              setSelected(c);
              setCenter([c.coords.lng, c.coords.lat]);
            }}
            focusOffsetPx={180}
          />

          {/* Details drawer */}
          {selected ? (
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-[560px] rounded-xl border border-neutral-800 bg-neutral-950/95 backdrop-blur p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{selected.title}</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {selected.source === "wikipedia" ? "Wikipedia" : `OSM • ${selected.kind.replaceAll("_", " ")}`}
                    {selected.distanceM != null ? ` • ${formatDistance(selected.distanceM)}` : ""}
                  </div>

                  <div className="text-sm text-neutral-300 mt-2">
                    {selected.summary ?? "No summary available."}
                  </div>

                  {selected.url ? (
                    <a
                      className="text-sm text-neutral-200 underline mt-3 inline-block"
                      href={selected.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open source
                    </a>
                  ) : null}
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}