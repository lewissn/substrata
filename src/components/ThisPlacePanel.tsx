"use client";

import { useEffect, useRef, useState } from "react";
import { TIME_STOPS, formatCoords } from "@/domain/thisPlace";
import type { ActivePlace, TimeStopDef } from "@/domain/thisPlace";
import type { ReconstructionResult } from "@/app/api/reconstruct/route";
import { generatePlaceNarrative } from "@/domain/placeNarrative";
import type { PlaceNarrative } from "@/domain/placeNarrative";
import { fetchFossilEnrichment } from "@/domain/fossilEnrichment";
import type { FossilEnrichment } from "@/domain/fossilEnrichment";

// ---------------------------------------------------------------------------
// Wikipedia thumbnail cache (shared session-level cache)
// ---------------------------------------------------------------------------

const IMG_CACHE: Record<string, string | null> = {};

async function fetchWikiThumb(wikiPage: string): Promise<string | null> {
  if (wikiPage in IMG_CACHE) return IMG_CACHE[wikiPage];
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiPage)}`,
      { headers: { Accept: "application/json" } }
    );
    const data = await res.json();
    const src: string | null =
      data?.thumbnail?.source ?? data?.originalimage?.source ?? null;
    IMG_CACHE[wikiPage] = src;
    return src;
  } catch {
    IMG_CACHE[wikiPage] = null;
    return null;
  }
}

// ---------------------------------------------------------------------------
// Onboarding hint — shown once per session
// ---------------------------------------------------------------------------

const HINT_KEY = "substrata_place_hinted";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type Props = {
  activePlace: ActivePlace | null;
  paleoData: ReconstructionResult | null;
  dropPinMode: boolean;
  onActivateDropPin: () => void;
  onClearPlace: () => void;
  onSetTimeStop: (stop: TimeStopDef) => void;
  onFlyToPlace: () => void;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ThisPlacePanel({
  activePlace,
  paleoData,
  dropPinMode,
  onActivateDropPin,
  onClearPlace,
  onSetTimeStop,
  onFlyToPlace,
}: Props) {
  const [selectedKey, setSelectedKey] = useState("now");
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgVisible, setImgVisible] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(true);
  const [narrative, setNarrative] = useState<PlaceNarrative | null>(null);
  const [fossils, setFossils] = useState<FossilEnrichment | null>(null);
  const prevNarrativeKey = useRef("");

  // Check onboarding hint (client-only)
  useEffect(() => {
    setHintDismissed(!!localStorage.getItem(HINT_KEY));
  }, []);

  const dismissHint = () => {
    setHintDismissed(true);
    localStorage.setItem(HINT_KEY, "1");
  };

  const selectedStop = TIME_STOPS.find((s) => s.key === selectedKey) ?? TIME_STOPS[0];

  // Generate narrative + fetch image when stop or place changes
  useEffect(() => {
    if (!activePlace) {
      setNarrative(null);
      setFossils(null);
      return;
    }

    const nKey = `${activePlace.lat.toFixed(4)}:${activePlace.lng.toFixed(4)}:${selectedStop.key}:${paleoData?.paleoLat?.toFixed(1) ?? "m"}`;
    if (nKey === prevNarrativeKey.current) return;
    prevNarrativeKey.current = nKey;

    // Generate narrative (sync, memoized)
    const n = generatePlaceNarrative({
      lat: activePlace.lat,
      lng: activePlace.lng,
      stopKey: selectedStop.key,
      paleoLat: paleoData?.paleoLat ?? null,
    });
    setNarrative(n);

    // Fetch biome-aware image (from narrative wikiPage, not static stop wikiPage)
    setImgSrc(null);
    setImgVisible(false);
    const wikiPage = n.biome.wikiPage;
    if (wikiPage) {
      fetchWikiThumb(wikiPage).then((src) => {
        if (src) setImgSrc(src);
      });
    }

    // Fetch fossils for deep time stops
    if (selectedStop.kind === "deep" && selectedStop.ma) {
      setFossils({ taxa: [], totalOccurrences: 0, loading: true });
      fetchFossilEnrichment(activePlace.lat, activePlace.lng, selectedStop.ma).then(
        (result) => setFossils(result),
      );
    } else {
      setFossils(null);
    }
  }, [activePlace, selectedStop, paleoData]);

  const handleSelectStop = (stop: TimeStopDef) => {
    setSelectedKey(stop.key);
    onSetTimeStop(stop);
  };

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  if (!activePlace) {
    return (
      <div className="flex flex-col">
        {/* ── Wordmark ── */}
        <Wordmark />

        <div className="flex flex-col items-center px-5 py-5 text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[rgba(31,90,92,0.12)] border border-[rgba(44,111,116,0.20)] flex items-center justify-center mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(44,111,116,0.7)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>

          <h2 className="text-[14px] font-semibold text-zinc-200 mb-1">This Place Through Time</h2>
          <p className="text-[12px] text-zinc-500 leading-relaxed mb-5 max-w-[240px]">
            Drop a pin anywhere on the map — or select a place — to explore what was here across deep
            time and human history.
          </p>

          {/* Primary CTA */}
          <button
            onClick={() => { dismissHint(); onActivateDropPin(); }}
            className={[
              "px-5 py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-150",
              dropPinMode
                ? "bg-[rgba(44,111,116,0.25)] border-[rgba(44,111,116,0.60)] text-[#89CDD1]"
                : "bg-[rgba(31,90,92,0.18)] border-[rgba(44,111,116,0.40)] text-[#89CDD1] hover:bg-[rgba(31,90,92,0.28)]",
            ].join(" ")}
          >
            {dropPinMode ? "Tap map to place pin…" : "Drop Pin"}
          </button>

          {/* Onboarding hint */}
          {!hintDismissed && (
            <div className="mt-4 px-3 py-2 rounded-lg border border-[rgba(44,111,116,0.20)] bg-[rgba(9,9,11,0.60)] flex items-start gap-2">
              <span className="text-[10px] text-zinc-600 leading-relaxed text-left">
                Tip: Long-press anywhere on the map to drop a pin instantly.
              </span>
              <button
                onClick={dismissHint}
                className="text-zinc-700 hover:text-zinc-500 shrink-0 mt-0.5"
                aria-label="Dismiss hint"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Active place — full view
  // ---------------------------------------------------------------------------

  // Determine image wikiPage: use biome-aware page from narrative, or static stop page as fallback
  const hasImage = !!imgSrc;
  const hasWikiPage = !!(narrative?.biome.wikiPage ?? selectedStop.wikiPage);

  return (
    <div className="flex flex-col">
      {/* ── Wordmark ── */}
      <Wordmark />

      {/* ── Place header ── */}
      <div className="px-4 pt-3 pb-2 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-zinc-100 leading-snug truncate">
              {activePlace.title}
            </div>
            <div className="text-[10px] text-zinc-600 mt-0.5 font-mono">
              {formatCoords(activePlace.lat, activePlace.lng)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onActivateDropPin}
              title="Drop new pin"
              className={[
                "px-2 py-1 rounded-md text-[10px] font-medium border transition-all duration-150",
                dropPinMode
                  ? "border-[rgba(44,111,116,0.55)] text-[#89CDD1] bg-[rgba(31,90,92,0.20)]"
                  : "border-[rgba(255,255,255,0.07)] text-zinc-500 hover:text-zinc-300 bg-[rgba(255,255,255,0.03)]",
              ].join(" ")}
            >
              {dropPinMode ? "Tap map…" : "New pin"}
            </button>
            <button
              onClick={onClearPlace}
              title="Clear"
              className="p-1 rounded-md text-zinc-600 hover:text-zinc-400 transition"
              aria-label="Clear place"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Period image ── */}
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc!}
          alt={narrative?.biome.biomeLabel ?? selectedStop.fullLabel}
          loading="lazy"
          onLoad={() => setImgVisible(true)}
          onError={() => setImgSrc(null)}
          className="w-full h-36 object-cover transition-opacity duration-700"
          style={{ opacity: imgVisible ? 0.78 : 0 }}
        />
      )}
      {!hasImage && hasWikiPage && (
        <div className="w-full h-36 bg-[rgba(255,255,255,0.02)] flex items-center justify-center">
          <div className="text-[9px] text-zinc-700 uppercase tracking-widest">Loading image…</div>
        </div>
      )}

      {/* ── Time stop chips ── */}
      <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.05)]">
        <div className="text-[9px] uppercase tracking-widest text-zinc-700 font-medium mb-2">
          Time stops
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TIME_STOPS.map((stop) => (
            <button
              key={stop.key}
              onClick={() => handleSelectStop(stop)}
              className={[
                "shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150",
                stop.kind === "deep" ? "rounded-lg" : "rounded-full",
                selectedKey === stop.key
                  ? "bg-[rgba(31,90,92,0.22)] border-[rgba(44,111,116,0.50)] text-[#89CDD1]"
                  : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-zinc-400 hover:text-zinc-200 hover:border-[rgba(255,255,255,0.12)]",
              ].join(" ")}
            >
              {stop.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Story card ── */}
      <StoryCard
        stop={selectedStop}
        narrative={narrative}
        fossils={fossils}
        paleoData={paleoData}
        onFlyToPlace={onFlyToPlace}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wordmark — always sits at the top of the panel, very low profile
// ---------------------------------------------------------------------------

function Wordmark() {
  return (
    <div className="px-4 pt-3 pb-1 flex items-baseline gap-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-700">
        Substrata
      </span>
      <span className="text-zinc-800 text-[9px]">·</span>
      <span className="text-[9px] tracking-wide text-zinc-700">
        Explore layers of time
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Biome badges — compact pills showing classification result
// ---------------------------------------------------------------------------

function BiomeBadges({ narrative }: { narrative: PlaceNarrative }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {/* Biome label */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(140,158,96,0.12)] border border-[rgba(140,158,96,0.25)] text-[9px] font-medium text-[#B0C478]">
        {narrative.biome.biomeLabel}
      </span>
      {/* Setting */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(44,111,116,0.10)] border border-[rgba(44,111,116,0.22)] text-[9px] font-medium text-[#89CDD1]">
        {narrative.biome.settingLabel}
      </span>
      {/* Latitude band */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[9px] font-medium text-zinc-500">
        {narrative.latBandLabel}
      </span>
      {/* Confidence */}
      {narrative.usedPaleoLat && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[9px] text-zinc-600">
          GPlates-verified
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fossil section — shows top taxa from PBDB
// ---------------------------------------------------------------------------

function FossilSection({ fossils }: { fossils: FossilEnrichment }) {
  if (fossils.loading) {
    return (
      <div className="text-[10px] text-zinc-600 animate-pulse">
        Searching for nearby fossils…
      </div>
    );
  }

  if (fossils.taxa.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="text-[9px] uppercase tracking-widest text-zinc-700 font-medium">
        Nearby fossils ({fossils.totalOccurrences} occurrences)
      </div>
      <div className="space-y-1">
        {fossils.taxa.map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-zinc-300 italic truncate">
                {t.name}
              </div>
              <div className="text-[9px] text-zinc-600">
                {[
                  t.interval,
                  t.phylum,
                  t.distanceKm > 0 ? `~${t.distanceKm} km away` : null,
                ].filter(Boolean).join(" · ")}
              </div>
            </div>
            {t.count > 1 && (
              <span className="text-[9px] text-zinc-600 font-mono shrink-0">
                ×{t.count}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story card — now powered by the narrative engine
// ---------------------------------------------------------------------------

function StoryCard({
  stop,
  narrative,
  fossils,
  paleoData,
  onFlyToPlace,
}: {
  stop: TimeStopDef;
  narrative: PlaceNarrative | null;
  fossils: FossilEnrichment | null;
  paleoData: ReconstructionResult | null;
  onFlyToPlace: () => void;
}) {
  // Use narrative-engine content when available, fall back to static stop content
  const displayNarrative = narrative?.biome.narrative ?? stop.narrative;
  const displayBullets = narrative?.biome.bullets ?? stop.bullets;

  // Location note for deep time when we have paleo data
  const locationNote = buildLocationNote(stop, paleoData);

  return (
    <div className="px-4 py-3 space-y-2.5">
      {/* Period label */}
      <div>
        <div
          className={[
            "text-[11px] font-semibold uppercase tracking-wide",
            stop.kind === "deep" ? "text-[#8C9E60]" : "text-[#89CDD1]",
          ].join(" ")}
        >
          {stop.kind === "deep" ? "Deep Time" : "Human History"}
        </div>
        <div className="text-[14px] font-semibold text-zinc-100 leading-snug mt-0.5">
          {stop.fullLabel}
        </div>
      </div>

      {/* Biome badges */}
      {narrative && <BiomeBadges narrative={narrative} />}

      {/* Narrative */}
      <p className="text-[12px] text-zinc-400 leading-relaxed">{displayNarrative}</p>

      {/* Location-specific note from paleoData */}
      {locationNote && (
        <div className="text-[11px] text-zinc-500 italic leading-relaxed border-l-2 border-[rgba(44,111,116,0.30)] pl-2.5">
          {locationNote}
        </div>
      )}

      {/* Bullet facts */}
      <ul className="space-y-1">
        {displayBullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-500">
            <span className="text-zinc-700 mt-0.5 shrink-0">·</span>
            <span className="leading-snug">{b}</span>
          </li>
        ))}
      </ul>

      {/* Fossils */}
      {fossils && <FossilSection fossils={fossils} />}

      {/* Actions */}
      <div className="pt-1 flex items-center gap-2">
        <button
          onClick={onFlyToPlace}
          className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-zinc-400 hover:text-zinc-200 text-[11px] font-medium transition"
        >
          View on map
        </button>
        {stop.kind === "deep" && (
          <span className="text-[9px] text-zinc-700 italic">
            Paleogeography enabled automatically
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Build location-specific note from paleoData (deep time only)
// ---------------------------------------------------------------------------

function buildLocationNote(
  stop: TimeStopDef,
  paleoData: ReconstructionResult | null
): string | null {
  if (stop.kind !== "deep" || !paleoData) return null;
  const { paleoLat, climateBand } = paleoData;
  if (paleoLat == null) return null;

  const latAbs = Math.abs(paleoLat);
  const latDir = paleoLat >= 0 ? "N" : "S";
  const latDesc =
    latAbs < 10 ? "near the equator"
    : latAbs < 30 ? "in the tropics"
    : latAbs < 50 ? "in the mid-latitudes"
    : latAbs < 65 ? "in the sub-polar region"
    : "near the pole";

  const parts: string[] = [
    `At this time, this location was approximately ${latAbs.toFixed(1)}° ${latDir} — ${latDesc}.`,
  ];
  if (climateBand) {
    parts.push(`Climate zone: ${climateBand}.`);
  }

  return parts.join(" ");
}
