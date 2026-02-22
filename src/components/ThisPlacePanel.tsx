"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TIME_STOPS, formatCoords } from "@/domain/thisPlace";
import type { ActivePlace, TimeStopDef } from "@/domain/thisPlace";
import type { ReconstructionResult } from "@/app/api/reconstruct/route";
import { fetchFossilEnrichment } from "@/domain/fossilEnrichment";
import type { FossilEnrichment } from "@/domain/fossilEnrichment";
import { buildPlaceDossier, wikiPageForFallback } from "@/lib/dossier/buildPlaceDossier";
import type { PlaceDossier, DossierLife, DossierGeology, DossierSource } from "@/lib/dossier/types";
import { isImg } from "@/lib/dossier/types";
import type { HumanContext } from "@/lib/dossier/humanContext";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HUMAN_LAYER_STOPS = new Set(["y2k", "y5k", "y10k"]);

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
  const [imgVisible, setImgVisible] = useState(false);
  const [fossils, setFossils] = useState<FossilEnrichment | null>(null);
  const [wikiThumbUrl, setWikiThumbUrl] = useState<string | null>(null);
  const [humanContext, setHumanContext] = useState<HumanContext | null>(null);
  const prevFetchKey = useRef("");
  const prevHumanKey = useRef("");

  const selectedStop = TIME_STOPS.find((s) => s.key === selectedKey) ?? TIME_STOPS[0];

  // Fetch async enrichments when stop or place changes
  useEffect(() => {
    if (!activePlace) {
      setFossils(null);
      setWikiThumbUrl(null);
      return;
    }

    const fetchKey = `${activePlace.lat.toFixed(4)}:${activePlace.lng.toFixed(4)}:${selectedStop.key}:${paleoData?.paleoLat?.toFixed(1) ?? "m"}`;
    if (fetchKey === prevFetchKey.current) return;
    prevFetchKey.current = fetchKey;

    // Reset image loading
    setImgVisible(false);
    setWikiThumbUrl(null);

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

  // Fetch human layer for recent-history stops (y2k / y5k / y10k)
  useEffect(() => {
    if (!activePlace || !HUMAN_LAYER_STOPS.has(selectedStop.key) || !selectedStop.yearsAgo) {
      setHumanContext(null);
      return;
    }
    const humanKey = `${activePlace.lat.toFixed(3)}:${activePlace.lng.toFixed(3)}:${selectedStop.key}`;
    if (humanKey === prevHumanKey.current) return;
    prevHumanKey.current = humanKey;

    setHumanContext(null);
    fetch(
      `/api/humanLayer?lat=${activePlace.lat}&lng=${activePlace.lng}&yearsAgo=${selectedStop.yearsAgo}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: HumanContext | null) => {
        if (data) setHumanContext(data);
      })
      .catch(() => {});
  }, [activePlace, selectedStop.key, selectedStop.yearsAgo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build dossier (synchronous, recalculates when inputs change)
  const dossier: PlaceDossier | null = useMemo(() => {
    if (!activePlace) return null;
    return buildPlaceDossier({
      place: activePlace,
      stop: selectedStop,
      paleoData,
      fossils,
      heroImageUrl: wikiThumbUrl,
      humanContext,
    });
  }, [activePlace, selectedStop, paleoData, fossils, wikiThumbUrl, humanContext]);

  // Fetch Wikipedia fallback image only if visual catalog has no match
  useEffect(() => {
    if (!dossier) return;
    const needsFallback = wikiPageForFallback(
      dossier.time.stopKey,
      dossier.setting.paleolatBand,
      dossier.setting.landSea,
    );
    if (!needsFallback) return;
    // Use narrative biome wikiPage or stop wikiPage as fallback
    const wikiPage = selectedStop.wikiPage;
    if (wikiPage) {
      fetchWikiThumb(wikiPage).then((src) => {
        if (src) setWikiThumbUrl(src);
      });
    }
  }, [dossier?.time.stopKey, dossier?.setting.paleolatBand, dossier?.setting.landSea, selectedStop.wikiPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectStop = (stop: TimeStopDef) => {
    setSelectedKey(stop.key);
    onSetTimeStop(stop);
  };

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  if (!activePlace || !dossier) {
    return (
      <div className="flex flex-col">
        <Wordmark />
        <div className="flex flex-col items-center px-5 py-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(31,90,92,0.12)] border border-[rgba(44,111,116,0.20)] flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(44,111,116,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <h2 className="text-[14px] font-semibold text-zinc-200 mb-1">This Place Through Time</h2>
          <p className="text-[12px] text-zinc-500 leading-relaxed mb-5 max-w-[240px]">
            Drop a pin anywhere on the map — or select a place — to explore what was here across deep time and human history.
          </p>
          <button
            onClick={onActivateDropPin}
            className={[
              "px-5 py-2.5 rounded-xl text-[12px] font-semibold border transition-all duration-150",
              dropPinMode
                ? "bg-[rgba(44,111,116,0.25)] border-[rgba(44,111,116,0.60)] text-[#89CDD1]"
                : "bg-[rgba(31,90,92,0.18)] border-[rgba(44,111,116,0.40)] text-[#89CDD1] hover:bg-[rgba(31,90,92,0.28)]",
            ].join(" ")}
          >
            {dropPinMode ? "Tap map to place pin\u2026" : "Drop Pin"}
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Active place — full dossier view
  // ---------------------------------------------------------------------------

  const heroIsImg = isImg(dossier.visuals.hero);

  return (
    <div className="flex flex-col">
      <Wordmark />

      {/* ── Place header ── */}
      <div className="px-4 pt-3 pb-2 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-zinc-100 leading-snug truncate">
              {dossier.place.title}
            </div>
            <div className="text-[10px] text-zinc-600 mt-0.5 font-mono">
              {formatCoords(dossier.place.lat, dossier.place.lng)}
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
              {dropPinMode ? "Tap map\u2026" : "New pin"}
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

      {/* ── Hero visual ── */}
      {heroIsImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(dossier.visuals.hero as { url: string }).url}
          alt={dossier.setting.biome}
          loading="lazy"
          onLoad={() => setImgVisible(true)}
          onError={() => setImgVisible(false)}
          className="w-full h-36 object-cover transition-opacity duration-700"
          style={{ opacity: imgVisible ? 0.78 : 0 }}
        />
      ) : (
        <div
          className="w-full h-28 flex items-end justify-start px-4 pb-2"
          style={{ background: (dossier.visuals.hero as { gradient: string }).gradient }}
        >
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
            {dossier.setting.biome}
          </span>
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

      {/* ── Dossier card ── */}
      <DossierCard
        dossier={dossier}
        onFlyToPlace={onFlyToPlace}
        fossilsLoading={fossils?.loading ?? false}
        humanLayerLoading={
          HUMAN_LAYER_STOPS.has(selectedKey) && humanContext === null
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wordmark
// ---------------------------------------------------------------------------

function Wordmark() {
  return (
    <div className="px-4 pt-3 pb-1 flex items-baseline gap-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-zinc-700">
        Substrata
      </span>
      <span className="text-zinc-800 text-[9px]">&middot;</span>
      <span className="text-[9px] tracking-wide text-zinc-700">
        Explore layers of time
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Setting badges
// ---------------------------------------------------------------------------

function SettingBadges({ dossier }: { dossier: PlaceDossier }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(140,158,96,0.12)] border border-[rgba(140,158,96,0.25)] text-[9px] font-medium text-[#B0C478]">
        {dossier.setting.biome}
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(44,111,116,0.10)] border border-[rgba(44,111,116,0.22)] text-[9px] font-medium text-[#89CDD1]">
        {dossier.setting.settingLabel}
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[9px] font-medium text-zinc-500">
        {dossier.setting.paleolatBand.charAt(0).toUpperCase() + dossier.setting.paleolatBand.slice(1)}
      </span>
      {dossier.confidence === "high" && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[9px] text-zinc-600">
          GPlates-verified
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fossil section
// ---------------------------------------------------------------------------

function FossilSection({ life, loading }: { life: DossierLife; loading: boolean }) {
  if (loading) {
    return (
      <div className="text-[10px] text-zinc-600 animate-pulse">
        Searching for nearby fossils\u2026
      </div>
    );
  }

  const hasTaxa = life.taxa.length > 0;
  const hasInferred = (life.flora && life.flora.length > 0) || (life.fauna && life.fauna.length > 0);

  if (!hasTaxa && !hasInferred) return null;

  return (
    <div className="space-y-2">
      {/* PBDB fossil occurrences */}
      {hasTaxa && (
        <div className="space-y-1.5">
          <div className="text-[9px] uppercase tracking-widest text-zinc-700 font-medium">
            {life.headline ?? `Nearby fossils (${life.totalOccurrences} occurrences)`}
          </div>
          <div className="space-y-1">
            {life.taxa.map((t) => (
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
                      t.distanceKm != null && t.distanceKm > 0 ? `~${t.distanceKm} km away` : null,
                    ].filter(Boolean).join(" \u00B7 ")}
                  </div>
                </div>
                {t.count > 1 && (
                  <span className="text-[9px] text-zinc-600 font-mono shrink-0">
                    \u00D7{t.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inferred flora/fauna */}
      {hasInferred && (
        <div className="space-y-1">
          {life.fauna && life.fauna.length > 0 && (
            <div>
              <div className="text-[9px] uppercase tracking-widest text-zinc-700 font-medium mb-1">
                Representative fauna
              </div>
              <div className="flex flex-wrap gap-1">
                {life.fauna.map((f) => (
                  <span key={f} className="px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[10px] text-zinc-500">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
          {life.flora && life.flora.length > 0 && (
            <div>
              <div className="text-[9px] uppercase tracking-widest text-zinc-700 font-medium mb-1">
                Representative flora
              </div>
              <div className="flex flex-wrap gap-1">
                {life.flora.map((f) => (
                  <span key={f} className="px-2 py-0.5 rounded-md bg-[rgba(140,158,96,0.08)] border border-[rgba(140,158,96,0.15)] text-[10px] text-[#9AB06A]">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Geology section
// ---------------------------------------------------------------------------

function GeologySection({ geology }: { geology: DossierGeology }) {
  if (!geology.lithology && geology.notes.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="text-[9px] uppercase tracking-widest text-zinc-700 font-medium">
        Geology &mdash; {geology.periodName}
      </div>
      {geology.lithology && (
        <div className="text-[11px] text-zinc-500 leading-snug">
          <span className="text-zinc-600 font-medium">Typical rocks:</span>{" "}
          {geology.lithology}
        </div>
      )}
      {geology.notes.length > 0 && (
        <ul className="space-y-0.5">
          {geology.notes.slice(0, 3).map((n, i) => (
            <li key={i} className="flex items-start gap-2 text-[10px] text-zinc-600">
              <span className="text-zinc-700 mt-0.5 shrink-0">&middot;</span>
              <span className="leading-snug">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expandable section (for "More detail")
// ---------------------------------------------------------------------------

function ExpandableSection({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-l-2 border-[rgba(44,111,116,0.20)] pl-2.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition w-full text-left"
      >
        <svg
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {title}
      </button>
      {open && (
        <p className="text-[11px] text-zinc-500 leading-relaxed mt-1.5 pl-3.5">
          {text}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sources list
// ---------------------------------------------------------------------------

function SourcesList({ sources }: { sources: DossierSource[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="text-[9px] uppercase tracking-widest text-zinc-700 font-medium">
        Sources
      </div>
      <div className="flex flex-wrap gap-1">
        {sources.map((s, i) => (
          <span key={i} className="text-[9px] text-zinc-600">
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-zinc-700 hover:text-zinc-400 transition"
              >
                {s.label}
              </a>
            ) : (
              s.label
            )}
            {i < sources.length - 1 && <span className="text-zinc-800 mx-1">&middot;</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dossier card — the main content area powered by the dossier engine
// ---------------------------------------------------------------------------

function DossierCard({
  dossier,
  onFlyToPlace,
  fossilsLoading,
  humanLayerLoading,
}: {
  dossier: PlaceDossier;
  onFlyToPlace: () => void;
  fossilsLoading: boolean;
  humanLayerLoading: boolean;
}) {
  const { time, narrative, life, geology, sources } = dossier;

  return (
    <div className="px-4 py-3 space-y-2.5">
      {/* Period label */}
      <div>
        <div
          className={[
            "text-[11px] font-semibold uppercase tracking-wide",
            time.ma != null ? "text-[#8C9E60]" : "text-[#89CDD1]",
          ].join(" ")}
        >
          {time.ma != null ? "Deep Time" : "Human History"}
          {time.periodName && (
            <span className="normal-case tracking-normal font-normal text-zinc-600 ml-1.5">
              {time.periodName}
            </span>
          )}
        </div>
        <div className="text-[14px] font-semibold text-zinc-100 leading-snug mt-0.5">
          {time.fullLabel}
        </div>
      </div>

      {/* Human layer — above environmental context for recent-history stops */}
      {dossier.humanContext ? (
        <HumanContextBlock ctx={dossier.humanContext} />
      ) : humanLayerLoading ? (
        <div className="text-[10px] text-zinc-700 animate-pulse">
          Identifying historical context\u2026
        </div>
      ) : null}

      {/* Setting badges */}
      <SettingBadges dossier={dossier} />

      {/* Narrative summary */}
      <p className="text-[12px] text-zinc-400 leading-relaxed">{narrative.summary}</p>

      {/* Bullet facts */}
      <ul className="space-y-1">
        {narrative.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-500">
            <span className="text-zinc-700 mt-0.5 shrink-0">&middot;</span>
            <span className="leading-snug">{b}</span>
          </li>
        ))}
      </ul>

      {/* Expandable deeper sections */}
      {narrative.deeper && narrative.deeper.sections.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          {narrative.deeper.sections.map((s, i) => (
            <ExpandableSection key={i} title={s.title} text={s.text} />
          ))}
        </div>
      )}

      {/* Local evidence: fossils + flora/fauna */}
      <FossilSection life={life} loading={fossilsLoading} />

      {/* Geology */}
      <GeologySection geology={geology} />

      {/* Sources */}
      <SourcesList sources={sources} />

      {/* Actions */}
      <div className="pt-1 flex items-center gap-2">
        <button
          onClick={onFlyToPlace}
          className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-zinc-400 hover:text-zinc-200 text-[11px] font-medium transition"
        >
          View on map
        </button>
        {dossier.visuals.mapOverlays.paleogeography && (
          <span className="text-[9px] text-zinc-700 italic">
            Paleogeography enabled automatically
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Human context block
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: "Settlement",
  2: "Archaeological",
  3: "Regional context",
};

function HumanContextBlock({ ctx }: { ctx: HumanContext }) {
  const [imgErrored, setImgErrored] = useState(false);

  return (
    <div className="rounded-lg border border-[rgba(44,111,116,0.18)] bg-[rgba(31,90,92,0.07)] p-3 space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-[9px] uppercase tracking-widest font-semibold text-[#89CDD1]">
          Human layer
        </div>
        <span
          className={[
            "text-[8px] px-1.5 py-0.5 rounded-md border font-medium",
            ctx.tier === 1
              ? "bg-[rgba(44,111,116,0.15)] border-[rgba(44,111,116,0.30)] text-[#89CDD1]"
              : ctx.tier === 2
              ? "bg-[rgba(140,158,96,0.10)] border-[rgba(140,158,96,0.22)] text-[#B0C478]"
              : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-zinc-600",
          ].join(" ")}
        >
          {TIER_LABELS[ctx.tier]}
        </span>
      </div>

      {/* Thumbnail (Tier 1 / 2 only, if available and not errored) */}
      {ctx.tier !== 3 && ctx.topEntity?.imageUrl && !imgErrored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ctx.topEntity.imageUrl}
          alt={ctx.topEntity.name}
          loading="lazy"
          onError={() => setImgErrored(true)}
          className="w-full h-16 object-cover rounded-md opacity-60"
        />
      )}

      {/* Headline */}
      <div className="text-[12px] font-semibold text-zinc-200 leading-snug">
        {ctx.headline}
      </div>

      {/* Summary */}
      <p className="text-[11px] text-zinc-400 leading-relaxed">{ctx.summary}</p>

      {/* Supporting entities (Tier 1 / 2 only) */}
      {ctx.tier !== 3 && ctx.entities.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {ctx.entities.slice(0, 3).map((e, i) => (
            <span
              key={i}
              className="text-[9px] px-1.5 py-0.5 rounded-md bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] text-zinc-600"
            >
              {e.name}
              {e.distanceKm != null && e.distanceKm > 0 && (
                <span className="text-zinc-700"> · {e.distanceKm} km</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Wikipedia link */}
      {ctx.wikiUrl && (
        <a
          href={ctx.wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[9px] text-zinc-600 underline decoration-zinc-800 hover:text-zinc-400 hover:decoration-zinc-600 transition"
        >
          More on Wikipedia →
        </a>
      )}
    </div>
  );
}
