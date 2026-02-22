"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DISCOVER_ENTRIES, TAG_LABELS, type DiscoverEntry, type DiscoverTag } from "@/data/discover";
import { TIME_STOPS } from "@/domain/thisPlace";
import type { ActivePlace, TimeStopDef } from "@/domain/thisPlace";
import { buildPlaceDossier } from "@/lib/dossier/buildPlaceDossier";
import type { PlaceDossier } from "@/lib/dossier/types";

// ---------------------------------------------------------------------------
// DiscoverSheet — curated geological and historical archive
// First-class sheet: rich cards, read state, Random Article, imagery fallbacks.
// ---------------------------------------------------------------------------

const READ_STORAGE_KEY = "substrata_read_archive";

function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      return new Set(Array.isArray(arr) ? arr : []);
    }
  } catch {
    // ignore
  }
  return new Set();
}

function markAsRead(id: string): void {
  try {
    const set = getReadIds();
    set.add(id);
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatEntryTime(entry: DiscoverEntry): string {
  if (entry.ma !== undefined) {
    const ma = entry.ma;
    if (ma >= 1000) return `${(ma / 1000).toFixed(1)} Ga`;
    if (ma >= 1) return `${ma % 1 === 0 ? ma : ma.toFixed(1)} Ma`;
    if (ma >= 0.001) return `${Math.round(ma * 1000)} ka`;
    return `${Math.round(ma * 1_000_000)} yr`;
  }
  if (entry.year !== undefined) {
    if (entry.year > 0) return String(entry.year);
    return `${Math.abs(entry.year)} BCE`;
  }
  return "";
}

/** Metadata label for card: e.g. "Permian Period · 252 Ma" */
function entryMetadataLabel(entry: DiscoverEntry): string {
  const time = formatEntryTime(entry);
  if (time && entry.era) return `${entry.era} · ${time}`;
  return entry.era || time || "";
}

/** Contextual placeholder gradient when image fails (by tag/period) */
function getPlaceholderStyle(entry: DiscoverEntry): React.CSSProperties {
  if (entry.tags.includes("ice")) {
    return { background: "linear-gradient(180deg, rgba(180,200,220,0.85) 0%, rgba(100,120,140,0.95) 100%)" };
  }
  if (entry.tags.includes("eruption") || entry.tags.includes("extinction")) {
    return { background: "linear-gradient(180deg, rgba(90,40,20,0.85) 0%, rgba(50,22,12,0.95) 100%)" };
  }
  if (entry.tags.includes("tectonics")) {
    return { background: "linear-gradient(180deg, rgba(60,50,45,0.9) 0%, rgba(35,28,24,0.95) 100%)" };
  }
  if (entry.ma != null && entry.ma > 200) {
    return { background: "linear-gradient(180deg, rgba(28,48,36,0.9) 0%, rgba(18,28,22,0.95) 100%)" };
  }
  return { background: "linear-gradient(180deg, rgba(18,48,72,0.9) 0%, rgba(8,24,40,0.95) 100%)" };
}

// ── Image with fade-in + contextual placeholder on error ─────────────────────

function EntryImage({
  src,
  alt,
  className = "",
  placeholderStyle,
}: {
  src: string;
  alt: string;
  className?: string;
  placeholderStyle?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={errored && placeholderStyle ? placeholderStyle : undefined}
    >
      {!errored && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={[
            "w-full h-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      )}
      {errored && !placeholderStyle && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(255,255,255,0.03)]">
          <span className="text-[9px] text-zinc-600 italic">Image unavailable</span>
        </div>
      )}
    </div>
  );
}

// ── Filter chips ─────────────────────────────────────────────────────────────

const ALL_FILTERS: Array<{ key: DiscoverTag | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "life", label: TAG_LABELS.life },
  { key: "extinction", label: TAG_LABELS.extinction },
  { key: "eruption", label: TAG_LABELS.eruption },
  { key: "ice", label: TAG_LABELS.ice },
  { key: "tectonics", label: TAG_LABELS.tectonics },
];

function FilterChips({
  active,
  onChange,
}: {
  active: DiscoverTag | "all";
  onChange: (f: DiscoverTag | "all") => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 -mx-4 px-4">
      {ALL_FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={[
            "flex-shrink-0 px-2.5 py-1.5 min-h-[44px] rounded-full text-[10px] border transition-all duration-150 whitespace-nowrap flex items-center",
            active === f.key
              ? "bg-[rgba(31,90,92,0.22)] border-[rgba(44,111,116,0.42)] text-zinc-100 font-medium"
              : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-zinc-500 hover:text-zinc-300",
          ].join(" ")}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

function DiscoverList({
  filter,
  onFilterChange,
  onSelect,
  readIds,
  onRandomArticle,
}: {
  filter: DiscoverTag | "all";
  onFilterChange: (f: DiscoverTag | "all") => void;
  onSelect: (entry: DiscoverEntry) => void;
  readIds: Set<string>;
  onRandomArticle: () => void;
}) {
  const filtered =
    filter === "all"
      ? DISCOVER_ENTRIES
      : DISCOVER_ENTRIES.filter((e) => e.tags.includes(filter));

  return (
    <div className="flex flex-col h-full">
      {/* Header — first-class Archive identity */}
      <div className="px-4 pb-3 border-b border-[rgba(255,255,255,0.05)] flex-shrink-0 space-y-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-50">
            Archive
          </h1>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            Events and intervals across Earth&apos;s past
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onRandomArticle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(160,130,95,0.45)] bg-[rgba(160,130,95,0.12)] hover:bg-[rgba(160,130,95,0.18)] text-[#B8986E] text-[12px] font-medium transition min-h-[44px]"
            aria-label="Open a random article"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5" />
              <path d="M4 20L21 3" />
              <path d="M21 16v5h-5" />
              <path d="M15 15l6 6" />
              <path d="M4 4l5 5" />
            </svg>
            Random Article
          </button>
          <span className="text-[10px] text-zinc-600">
            {filter === "all"
              ? `${DISCOVER_ENTRIES.length} entries`
              : `${filtered.length} of ${DISCOVER_ENTRIES.length}`}
          </span>
        </div>

        <FilterChips active={filter} onChange={onFilterChange} />
      </div>

      {/* Entry list — rich cards with thumbnail, metadata, read state */}
      <div className="flex-1 overflow-y-auto sheet-container divide-y divide-[rgba(255,255,255,0.04)]">
        {filtered.length === 0 ? (
          <div className="px-4 pt-10 text-center text-[12px] text-zinc-600">
            No entries in this category.
          </div>
        ) : (
          filtered.map((entry) => {
            const isRead = readIds.has(entry.id);
            const metaLabel = entryMetadataLabel(entry);
            const descLine = entry.subtitle ?? entry.description.split("\n\n")[0].slice(0, 100);
            return (
              <button
                key={entry.id}
                onClick={() => onSelect(entry)}
                className="w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-[rgba(255,255,255,0.025)] transition group min-h-[44px]"
              >
                {/* Thumbnail — always visible, fallback gradient on error */}
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[rgba(255,255,255,0.03)]">
                  <EntryImage
                    src={entry.image}
                    alt=""
                    className="w-full h-full"
                    placeholderStyle={getPlaceholderStyle(entry)}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className={[
                        "text-[13px] font-medium leading-snug",
                        isRead ? "text-zinc-500 opacity-80" : "text-zinc-200",
                      ].join(" ")}
                    >
                      {entry.title}
                    </span>
                    {isRead && (
                      <span className="text-[9px] font-medium uppercase tracking-wider text-[#B8986E]">
                        Read
                      </span>
                    )}
                  </div>
                  {metaLabel && (
                    <span className="text-[10px] text-zinc-600 mt-0.5 block">
                      {metaLabel}
                    </span>
                  )}
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug line-clamp-2">
                    {descLine}
                  </p>
                </div>

                {/* Chevron */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 text-zinc-600 group-hover:text-zinc-400 transition mt-1"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            );
          })
        )}

        {/* Footer */}
        <div className="px-4 py-4 text-[10px] text-zinc-700 leading-relaxed">
          Images: public domain or Creative Commons via Wikimedia Commons.
        </div>
      </div>
    </div>
  );
}

// ── Related articles (same tags, exclude current) ─────────────────────────────

function RelatedArticles({
  entry,
  onSelect,
}: {
  entry: DiscoverEntry;
  onSelect: (e: DiscoverEntry) => void;
}) {
  const related = useMemo(() => {
    const sameTag = entry.tags[0];
    if (!sameTag) return [];
    return DISCOVER_ENTRIES.filter(
      (e) => e.id !== entry.id && e.tags.includes(sameTag)
    ).slice(0, 3);
  }, [entry]);

  if (related.length === 0) return null;

  return (
    <div className="pt-6 mt-6 border-t border-[rgba(255,255,255,0.06)]">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
        Related Articles
      </div>
      <div className="space-y-2">
        {related.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => onSelect(e)}
            className="block w-full text-left text-[12px] text-[#B8986E] hover:text-[#C4A86A] transition py-1 min-h-[44px] flex items-center"
          >
            {e.title}
            <span className="text-[10px] text-zinc-600 ml-1.5 tabular-nums">
              {formatEntryTime(e)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────────

function DiscoverDetail({
  entry,
  onBack,
  onViewOnMap,
  onSelectRelated,
}: {
  entry: DiscoverEntry;
  onBack: () => void;
  onViewOnMap?: (params: { lat: number; lng: number; ma?: number }) => void;
  onSelectRelated: (e: DiscoverEntry) => void;
}) {
  const paragraphs = entry.description.split("\n\n").filter(Boolean);
  const timeLabel = formatEntryTime(entry);
  const canNavigate = entry.lat !== undefined && entry.lng !== undefined && onViewOnMap;

  useEffect(() => {
    markAsRead(entry.id);
  }, [entry.id]);

  return (
    <div className="flex flex-col h-full">
      {/* Back button */}
      <div className="px-4 pb-2 flex items-center flex-shrink-0">
        <button
          onClick={onBack}
          className="text-[12px] text-zinc-400 hover:text-zinc-200 transition min-h-[44px] flex items-center gap-1.5"
        >
          <span aria-hidden="true">&larr;</span> Archive
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto sheet-container">
        {/* Image (full-width, 16:9) — placeholder on error */}
        <div className="w-full aspect-video flex-shrink-0 bg-[rgba(255,255,255,0.03)]">
          <EntryImage
            src={entry.image}
            alt={entry.title}
            className="w-full h-full"
            placeholderStyle={getPlaceholderStyle(entry)}
          />
        </div>

        {/* Credit */}
        {entry.imageCredit && (
          <p className="px-4 pt-1 text-[9px] text-zinc-700 italic">{entry.imageCredit}</p>
        )}

        {/* Content */}
        <div className="px-4 pt-4 pb-8 space-y-4">
          {/* Time + era badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {timeLabel && (
              <span className="text-[10px] font-medium tabular-nums px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.05)] text-zinc-400 border border-[rgba(255,255,255,0.07)]">
                {timeLabel}
              </span>
            )}
            <span className="text-[10px] text-zinc-600">{entry.era}</span>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-[20px] font-semibold text-zinc-50 leading-tight tracking-tight">
              {entry.title}
            </h2>
            {entry.subtitle && (
              <p className="text-[13px] text-zinc-500 mt-1 italic">{entry.subtitle}</p>
            )}
          </div>

          {/* Teal accent rule */}
          <div className="w-8 h-[1.5px] bg-[rgba(44,111,116,0.55)] rounded-full" />

          {/* Description paragraphs */}
          <div className="space-y-3.5">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[13px] text-zinc-300 leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Mini-dossier: local environmental context */}
          {entry.lat != null && entry.lng != null && entry.ma != null && (
            <MiniDossier lat={entry.lat} lng={entry.lng} ma={entry.ma} />
          )}

          {/* View on Map */}
          {canNavigate && (
            <div className="pt-2">
              <button
                onClick={() =>
                  onViewOnMap({ lat: entry.lat!, lng: entry.lng!, ma: entry.ma })
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(44,111,116,0.50)] bg-[rgba(31,90,92,0.20)] hover:bg-[rgba(31,90,92,0.35)] text-[#89CDD1] text-[12px] font-medium transition min-h-[44px]"
              >
                <svg
                  width="13" height="13"
                  viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                </svg>
                View on Map
                {entry.ma && entry.ma > 0 && (
                  <span className="text-[10px] text-[#5BA8AD] font-normal">
                    — enables Deep Time
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Related Articles */}
          <RelatedArticles entry={entry} onSelect={onSelectRelated} />
        </div>
      </div>
    </div>
  );
}

// ── Mini dossier — local environmental context for geolocated entries ────────

function findNearestStop(ma: number): TimeStopDef {
  const deepStops = TIME_STOPS.filter((s) => s.ma != null && s.ma > 0);
  let best = deepStops[0];
  let bestDist = Math.abs((best.ma ?? 0) - ma);
  for (const s of deepStops) {
    const d = Math.abs((s.ma ?? 0) - ma);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

function MiniDossier({ lat, lng, ma }: { lat: number; lng: number; ma: number }) {
  const dossier: PlaceDossier | null = useMemo(() => {
    if (ma <= 0) return null;
    const stop = findNearestStop(ma);
    const place: ActivePlace = {
      id: `archive-${lat}-${lng}`,
      title: "Archive location",
      lat,
      lng,
      source: "custom",
    };
    return buildPlaceDossier({ place, stop, paleoData: null });
  }, [lat, lng, ma]);

  if (!dossier) return null;

  return (
    <div className="rounded-lg border border-[rgba(44,111,116,0.20)] bg-[rgba(31,90,92,0.06)] p-3 space-y-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#89CDD1]">
        What was here
      </div>

      {/* Setting badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[rgba(140,158,96,0.12)] border border-[rgba(140,158,96,0.25)] text-[9px] font-medium text-[#B0C478]">
          {dossier.setting.biome}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[rgba(44,111,116,0.10)] border border-[rgba(44,111,116,0.22)] text-[9px] font-medium text-[#89CDD1]">
          {dossier.setting.settingLabel}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[9px] font-medium text-zinc-500">
          {dossier.setting.paleolatBand.charAt(0).toUpperCase() + dossier.setting.paleolatBand.slice(1)}
        </span>
      </div>

      {/* Brief narrative */}
      <p className="text-[11px] text-zinc-400 leading-relaxed">
        {dossier.narrative.summary}
      </p>

      {/* Geology note */}
      {dossier.geology.lithology && (
        <div className="text-[10px] text-zinc-600">
          <span className="font-medium text-zinc-500">Typical rocks:</span>{" "}
          {dossier.geology.lithology}
        </div>
      )}
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function DiscoverSheet({
  onViewOnMap,
}: {
  onViewOnMap?: (params: { lat: number; lng: number; ma?: number }) => void;
}) {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selected, setSelected] = useState<DiscoverEntry | null>(null);
  const [filter, setFilter] = useState<DiscoverTag | "all">("all");
  const [readIds, setReadIds] = useState<Set<string>>(getReadIds);

  const handleSelect = useCallback((entry: DiscoverEntry) => {
    setSelected(entry);
    setView("detail");
  }, []);

  const handleBack = useCallback(() => {
    setView("list");
    setSelected(null);
    setReadIds(getReadIds());
  }, []);

  const handleRandomArticle = useCallback(() => {
    const entry = DISCOVER_ENTRIES[Math.floor(Math.random() * DISCOVER_ENTRIES.length)];
    handleSelect(entry);
  }, [handleSelect]);

  if (view === "detail" && selected) {
    return (
      <DiscoverDetail
        entry={selected}
        onBack={handleBack}
        onViewOnMap={onViewOnMap}
        onSelectRelated={handleSelect}
      />
    );
  }

  return (
    <DiscoverList
      filter={filter}
      onFilterChange={setFilter}
      onSelect={handleSelect}
      readIds={readIds}
      onRandomArticle={handleRandomArticle}
    />
  );
}
