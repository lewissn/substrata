"use client";

import { useEffect, useRef, useState } from "react";
import { YEAR_PRESETS, periodFromYears, formatYearsAgo } from "@/domain/humanHistory";

// ---------------------------------------------------------------------------
// Wikipedia thumbnail cache (in-memory, shared with ContextPanel pattern)
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
// RecentHistoryPanel — year selector + period narrative for Human History mode
// Appears in the Time sheet when "Recent History" is the active time scale.
// ---------------------------------------------------------------------------

export default function RecentHistoryPanel({
  historicalYears,
  onChange,
}: {
  historicalYears: number;
  onChange: (years: number) => void;
}) {
  const period = periodFromYears(historicalYears);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgVisible, setImgVisible] = useState(false);
  const prevPeriod = useRef<string>("");

  // Fetch Wikipedia thumbnail when the period changes (not on every slider tick)
  useEffect(() => {
    if (!period?.wikiPage) {
      setImgSrc(null);
      setImgVisible(false);
      return;
    }
    if (period.name === prevPeriod.current) return;
    prevPeriod.current = period.name;
    setImgSrc(null);
    setImgVisible(false);
    fetchWikiThumb(period.wikiPage).then((src) => {
      if (src) setImgSrc(src);
    });
  }, [period]);

  return (
    <div className="flex flex-col">
      {/* ── Period image strip — fades in when loaded ── */}
      {imgSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={period?.name ?? ""}
          loading="lazy"
          onLoad={() => setImgVisible(true)}
          onError={() => setImgSrc(null)}
          className="w-full h-32 object-cover transition-opacity duration-700"
          style={{ opacity: imgVisible ? 0.72 : 0 }}
        />
      )}

      <div className="px-4 py-3">
        {/* ── Year presets ── */}
        <div className="mb-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-700 font-medium">
            Years ago
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {YEAR_PRESETS.map(({ label, years }) => (
            <button
              key={years}
              onClick={() => onChange(years)}
              className={[
                "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 select-none",
                historicalYears === years
                  ? "bg-[rgba(31,90,92,0.20)] border-[rgba(44,111,116,0.45)] text-[#89CDD1]"
                  : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-zinc-400 hover:text-zinc-200 hover:border-[rgba(255,255,255,0.12)]",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Period narrative card ── */}
        {period ? (
          <div className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-3.5">
            {/* Time label */}
            <div className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1 font-medium">
              {formatYearsAgo(historicalYears)}
            </div>

            {/* Period name */}
            <div className="text-[13px] font-semibold text-zinc-200 leading-snug mb-1">
              {period.name}
            </div>

            {/* Description */}
            <div className="text-[11px] text-zinc-400 leading-relaxed mb-2">
              {period.description}
            </div>

            {/* Examples */}
            <div className="flex items-start gap-1.5">
              <span className="text-[9px] uppercase tracking-widest text-zinc-700 font-medium mt-0.5 shrink-0">
                e.g.
              </span>
              <span className="text-[11px] text-zinc-500 leading-snug">
                {period.examples}
              </span>
            </div>

            {/* Honest disclaimer */}
            <div className="mt-3 pt-2.5 border-t border-[rgba(255,255,255,0.05)] text-[10px] text-zinc-700 leading-snug">
              Geological change is minimal at this scale. This mode surfaces
              relevant historical and archaeological places nearby.
            </div>
          </div>
        ) : (
          /* Present day — no period card, just a hint */
          <div className="text-[11px] text-zinc-600 py-1">
            Select a time above to explore historical places and periods.
          </div>
        )}
      </div>
    </div>
  );
}
