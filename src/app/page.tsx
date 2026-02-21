"use client";

import { useMemo, useState } from "react";
import Map from "@/components/Map";
import type { Era, PlaceCard, PlaceKind, PlaceSource } from "@/domain/placeCard";
import { scoreCard } from "@/domain/rank";
import { dedupe } from "@/domain/dedupe";
import { ERA_LABELS, formatEraRange } from "@/domain/era";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDistance(m?: number) {
  if (m == null) return "";
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

// ---------------------------------------------------------------------------
// Era badge colours (text only — subtle inline indicator)
// ---------------------------------------------------------------------------

const ERA_BADGE_STYLES: Record<Era, string> = {
  geological: "text-red-400/80",
  prehistoric: "text-amber-400/80",
  ancient: "text-yellow-300/80",
  medieval: "text-sky-400/80",
  modern: "text-zinc-400/70",
};

// ---------------------------------------------------------------------------
// Chip component
// ---------------------------------------------------------------------------

function Chip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: string; // optional CSS colour for active border/bg tint
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
        "backdrop-blur-sm select-none whitespace-nowrap",
        active
          ? accent
            ? ""
            : "bg-[rgba(var(--accent),0.16)] border-[rgba(var(--accent),0.32)] text-zinc-50"
          : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-zinc-400 hover:bg-[rgba(255,255,255,0.06)] hover:text-zinc-200 hover:border-[rgba(255,255,255,0.12)]",
      ].join(" ")}
      style={
        active && accent
          ? {
              backgroundColor: `${accent}22`,
              borderColor: `${accent}55`,
              color: "#f4f4f5",
            }
          : undefined
      }
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Era filter chips config
// ---------------------------------------------------------------------------

type EraChip = { era: Era; label: string; accent: string };

const ERA_CHIPS: EraChip[] = [
  { era: "geological", label: "Geological", accent: "#b44646" },
  { era: "prehistoric", label: "Prehistoric", accent: "#b98c50" },
  { era: "ancient", label: "Ancient", accent: "#d4a850" },
  { era: "medieval", label: "Medieval", accent: "#7894b4" },
  { era: "modern", label: "Modern", accent: "#a0a0b0" },
];

const KIND_CHIPS: Array<{ kind: PlaceKind; label: string }> = [
  { kind: "ruins", label: "Ruins" },
  { kind: "castle", label: "Castles" },
  { kind: "archaeological_site", label: "Archaeology" },
  { kind: "prehistoric_site", label: "Prehistoric Sites" },
  { kind: "megalith", label: "Megaliths" },
  { kind: "memorial", label: "Memorials" },
  { kind: "monument", label: "Monuments" },
  { kind: "battlefield", label: "Battlefields" },
  { kind: "volcano", label: "Volcanoes" },
  { kind: "impact_crater", label: "Craters" },
  { kind: "attraction", label: "Attractions" },
  { kind: "historic", label: "Historic" },
];

// ---------------------------------------------------------------------------
// FeedCard
// ---------------------------------------------------------------------------

function FeedCard({
  card,
  onClick,
  isNew,
}: {
  card: PlaceCard;
  onClick: () => void;
  isNew: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]",
        "p-3.5 hover:bg-[rgba(255,255,255,0.045)] transition-all duration-200",
        "shadow-soft",
        isNew ? "animate-feed-in" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div className="h-[52px] w-[52px] rounded-lg bg-[rgba(255,255,255,0.06)] overflow-hidden flex-shrink-0">
          {card.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs">
              {card.kind === "castle" ? "🏰" :
               card.kind === "ruins" || card.kind === "archaeological_site" ? "🏛" :
               card.kind === "prehistoric_site" || card.kind === "megalith" ? "🗿" :
               card.kind === "volcano" ? "🌋" :
               card.kind === "battlefield" ? "⚔" :
               card.era === "geological" ? "🌍" : "📍"}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2 justify-between">
            <div className="font-medium text-[13.5px] leading-snug text-zinc-100 truncate">
              {card.title}
            </div>
            <div className="text-[11px] text-zinc-600 flex-shrink-0 pt-0.5">
              {formatDistance(card.distanceM)}
            </div>
          </div>

          {/* Sub-meta: era + kind */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[11px] font-medium tracking-wide uppercase ${ERA_BADGE_STYLES[card.era]}`}>
              {ERA_LABELS[card.era]}
            </span>
            <span className="text-zinc-700 text-[11px]">·</span>
            <span className="text-[11px] text-zinc-600">
              {card.source === "wikipedia" ? "Wikipedia" : card.kind.replaceAll("_", " ")}
            </span>
          </div>

          {/* Summary */}
          <div className="text-[12.5px] text-zinc-400 leading-relaxed line-clamp-2 mt-1.5">
            {card.summary ?? (card.source === "osm" ? "OpenStreetMap feature" : "Wikipedia article")}
          </div>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Home() {
  const [query, setQuery] = useState("");
  const [center, setCenter] = useState<[number, number]>([-0.1276, 51.5072]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-0.1276, 51.5072]);

  const [cards, setCards] = useState<PlaceCard[]>([]);
  const [newCardIds, setNewCardIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<PlaceCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeSources, setActiveSources] = useState<PlaceSource[]>(["wikipedia", "osm"]);
  const [activeKinds, setActiveKinds] = useState<PlaceKind[]>([]);
  const [activeEra, setActiveEra] = useState<Era | null>(null);

  const activeCenter = useMemo<[number, number]>(() => mapCenter ?? center, [mapCenter, center]);

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (!activeSources.includes(c.source)) return false;
      if (activeKinds.length > 0 && !activeKinds.includes(c.kind)) return false;
      if (activeEra && c.era !== activeEra) return false;
      return true;
    });
  }, [cards, activeSources, activeKinds, activeEra]);

  // Era-aware sorted view (re-sort when era filter changes)
  const rankedCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => scoreCard(b, activeEra) - scoreCard(a, activeEra));
  }, [filteredCards, activeEra]);

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

      if (osmData?.error) {
        console.warn("OSM search error:", osmData);
      }

      const merged = dedupe([...(wikiData.cards ?? []), ...(osmData.cards ?? [])])
        .sort((a, b) => scoreCard(b, activeEra) - scoreCard(a, activeEra))
        .slice(0, 120);

      // Track which cards are new (for animation)
      const existingIds = new Set(cards.map((c) => c.id));
      const freshIds = new Set(merged.filter((c) => !existingIds.has(c.id)).map((c) => c.id));
      setNewCardIds(freshIds);

      setCards(merged);

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

  // Surprise Me: select and focus the top-ranked card in current view
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

  const toggleEra = (era: Era) => {
    setActiveEra((prev) => (prev === era ? null : era));
  };

  const resetFilters = () => {
    setActiveSources(["wikipedia", "osm"]);
    setActiveKinds([]);
    setActiveEra(null);
  };

  const hasActiveFilters = activeKinds.length > 0 || activeSources.length < 2 || activeEra !== null;

  const tooFewResults = rankedCards.length > 0 && rankedCards.length < 5;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top bar ── */}
      <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.96)] backdrop-blur-md flex gap-2 items-center z-10">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleGeocode(); }}
            placeholder="Navigate to a place…"
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
          {loading ? "Searching…" : "Search area"}
        </button>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Feed sidebar ── */}
        <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,1)] overflow-hidden">
          {/* Feed header */}
          <div className="px-4 pt-4 pb-3 border-b border-[rgba(255,255,255,0.05)]">
            <div className="flex items-baseline justify-between">
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-100">Substrata</h1>
              <span className="text-[11px] text-zinc-600">
                {rankedCards.length > 0 ? `${rankedCards.length} places` : ""}
              </span>
            </div>
            <p className="text-[11.5px] text-zinc-600 mt-0.5 tracking-wide">Explore layers of time</p>
          </div>

          {/* ── Era filter bar ── */}
          <div className="px-4 pt-3 pb-2 border-b border-[rgba(255,255,255,0.05)]">
            <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2 font-medium">Era</div>
            <div className="flex flex-wrap gap-1.5">
              <Chip
                label="All"
                active={activeEra === null}
                onClick={() => setActiveEra(null)}
              />
              {ERA_CHIPS.map(({ era, label, accent }) => (
                <Chip
                  key={era}
                  label={label}
                  active={activeEra === era}
                  onClick={() => toggleEra(era)}
                  accent={accent}
                />
              ))}
            </div>
          </div>

          {/* ── Source + Kind filters ── */}
          <div className="px-4 pt-3 pb-3 border-b border-[rgba(255,255,255,0.05)]">
            <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2 font-medium">Source</div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Chip
                label="Wikipedia"
                active={activeSources.includes("wikipedia")}
                onClick={() => toggleSource("wikipedia")}
              />
              <Chip
                label="OSM"
                active={activeSources.includes("osm")}
                onClick={() => toggleSource("osm")}
              />
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
                Reset filters
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

          {/* ── Feed content ── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
            {error && (
              <div className="text-[12.5px] text-zinc-400 border border-[rgba(255,255,255,0.06)] rounded-xl p-3 bg-[rgba(255,255,255,0.02)]">
                {error}
              </div>
            )}

            {rankedCards.length === 0 && !loading && !error && (
              <p className="text-zinc-600 text-[12.5px] pt-2">
                Move the map then press{" "}
                <span className="text-zinc-400">Search area</span> to explore.
              </p>
            )}

            {tooFewResults && !loading && (
              <div className="text-[11.5px] text-zinc-600 border border-[rgba(255,255,255,0.05)] rounded-xl p-2.5 bg-[rgba(255,255,255,0.015)]">
                Few results here — try zooming out and searching a wider area.
              </div>
            )}

            {rankedCards.map((c) => (
              <FeedCard
                key={c.id}
                card={c}
                isNew={newCardIds.has(c.id)}
                onClick={() => {
                  setSelected(c);
                  setCenter([c.coords.lng, c.coords.lat]);
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Map area ── */}
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
          />

          {/* ── Detail drawer ── */}
          {selected && (
            <div className="absolute bottom-5 left-5 right-5 md:right-auto md:w-[520px] rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(9,9,11,0.97)] backdrop-blur-xl shadow-drawer">
              {/* Drawer image strip (if available) */}
              {selected.imageUrl && (
                <div className="h-32 w-full rounded-t-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {/* Title */}
                    <div className="font-semibold text-[15px] text-zinc-50 leading-snug">
                      {selected.title}
                    </div>

                    {/* Era + time range */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[11px] font-semibold tracking-widest uppercase ${ERA_BADGE_STYLES[selected.era]}`}>
                        {ERA_LABELS[selected.era]}
                      </span>
                      {(selected.yearStart != null || selected.yearEnd != null) && (
                        <>
                          <span className="text-zinc-700 text-[11px]">·</span>
                          <span className="text-[11px] text-zinc-500">
                            {formatEraRange(selected.yearStart, selected.yearEnd)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Source meta */}
                    <div className="text-[11px] text-zinc-600 mt-0.5">
                      {selected.source === "wikipedia"
                        ? "Wikipedia"
                        : `OSM · ${selected.kind.replaceAll("_", " ")}`}
                      {selected.distanceM != null ? ` · ${formatDistance(selected.distanceM)}` : ""}
                    </div>

                    {/* Summary */}
                    <div className="text-[13px] text-zinc-300 leading-relaxed mt-3">
                      {selected.summary ?? "No summary available."}
                    </div>

                    {/* Link */}
                    {selected.url && (
                      <a
                        href={selected.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-3 text-[12px] text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition"
                      >
                        View source →
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setSelected(null)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-zinc-400 hover:text-zinc-200 text-xs transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
