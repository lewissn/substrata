"use client";

import { periodForMa, type GeoPeriod } from "@/domain/periods";
import { formatMa } from "@/domain/time";
import { ERA_LABELS } from "@/domain/era";
import { seaLevelAtMa, formatSeaLevel } from "@/domain/lgm";
import type { Era } from "@/domain/placeCard";

export default function ContextPanel({
  ma,
  activeEra,
  deepTimeEnabled,
  paleoData,
}: {
  ma: number;
  activeEra: Era | null;
  deepTimeEnabled: boolean;
  paleoData?: { paleoLat?: number; paleoLng?: number; climateBand?: string } | null;
}) {
  // Deep Time mode: show period context
  if (deepTimeEnabled && ma > 0) {
    const period = periodForMa(ma);
    if (period) {
      return <PeriodContext period={period} ma={ma} paleoData={paleoData} />;
    }
    // Ma outside known periods
    return (
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
        <div className="text-[11px] text-zinc-600 italic">
          {formatMa(ma)} — beyond mapped geological periods.
        </div>
      </div>
    );
  }

  // Era-first mode: show era summary
  if (activeEra) {
    return <EraContext era={activeEra} />;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Period context (Deep Time)
// ---------------------------------------------------------------------------

function PeriodContext({
  period,
  ma,
  paleoData,
}: {
  period: GeoPeriod;
  ma: number;
  paleoData?: { paleoLat?: number; paleoLng?: number; climateBand?: string } | null;
}) {
  const seaLevel = seaLevelAtMa(ma);
  const isLGM = ma >= 0.015 && ma <= 0.03;

  return (
    <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)] space-y-2 animate-context-in">
      {/* Period name + time */}
      <div className="flex items-baseline gap-2">
        <span
          className="text-[12px] font-semibold tracking-wide uppercase"
          style={{ color: period.color }}
        >
          {period.name}
        </span>
        <span className="text-[10px] text-zinc-600">
          {formatMa(period.maStart)} – {formatMa(period.maEnd)}
        </span>
      </div>

      {/* Summary */}
      <p className="text-[11.5px] text-zinc-400 leading-relaxed">
        {period.summary}
      </p>

      {/* Stats row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-600">
        <span>O₂ {period.oxygen}</span>
        <span>CO₂ {period.co2}</span>
        <span>Sea level {period.seaLevel}</span>
      </div>

      {/* Sea level indicator */}
      <SeaLevelBar seaLevel={seaLevel} isLGM={isLGM} />

      {/* Life */}
      <p className="text-[10.5px] text-zinc-500 italic">
        {period.life}
      </p>

      {/* LGM special context */}
      {isLGM && (
        <div className="text-[10.5px] text-sky-400/70 pt-1 border-t border-[rgba(255,255,255,0.04)]">
          <span className="font-medium">Ice Age active</span> — continental ice sheets shown on map.
          Land bridges exposed. Doggerland, Beringia, Sundaland connected.
        </div>
      )}

      {/* Paleolatitude context */}
      {paleoData?.paleoLat != null && (
        <div className="text-[10.5px] text-zinc-500 pt-1 border-t border-[rgba(255,255,255,0.04)]">
          <span className="text-zinc-400">This location at {formatMa(ma)}:</span>{" "}
          ~{Math.abs(paleoData.paleoLat).toFixed(1)}° {paleoData.paleoLat >= 0 ? "N" : "S"}
          {paleoData.climateBand && (
            <span className="text-zinc-600"> · {paleoData.climateBand}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sea level indicator bar
// ---------------------------------------------------------------------------

function SeaLevelBar({ seaLevel, isLGM }: { seaLevel: number; isLGM: boolean }) {
  // Normalize: -130m to +260m → 0% to 100%
  const min = -130;
  const max = 260;
  const range = max - min;
  const present = ((0 - min) / range) * 100;
  const level = ((seaLevel - min) / range) * 100;

  const barColor = seaLevel < 0
    ? isLGM ? "rgba(120,180,220,0.6)" : "rgba(100,160,200,0.5)"
    : "rgba(100,180,140,0.5)";

  return (
    <div className="pt-1">
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-zinc-600 w-[52px] text-right shrink-0">Sea level</span>
        <div className="flex-1 relative h-[6px] rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
          {/* Present marker */}
          <div
            className="absolute top-0 h-full w-[1px] bg-zinc-600 z-10"
            style={{ left: `${present}%` }}
          />
          {/* Level indicator */}
          <div
            className="absolute top-0 h-full rounded-full transition-all duration-500"
            style={{
              left: `${Math.min(level, present)}%`,
              width: `${Math.abs(level - present)}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
        <span className="text-[9px] text-zinc-500 w-[68px] shrink-0">
          {formatSeaLevel(seaLevel)}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Era context (Era-first mode)
// ---------------------------------------------------------------------------

const ERA_DESCRIPTIONS: Record<Era, string> = {
  geological: "Deep geological time — volcanic events, tectonic processes, and the slow transformation of Earth's crust over billions of years.",
  prehistoric: "Before written records. Stone tools, cave paintings, megaliths, and the emergence of complex human societies.",
  ancient: "Classical civilisations — the empires, temples, and trade routes of Greece, Rome, Egypt, Persia, and beyond.",
  medieval: "The medieval world — castles, monasteries, feudal kingdoms, and the complex societies between antiquity and modernity.",
  modern: "The recent past — industrial age, colonial expansion, world wars, and the making of the contemporary landscape.",
};

function EraContext({ era }: { era: Era }) {
  return (
    <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)] animate-context-in">
      <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium mb-1">
        {ERA_LABELS[era]}
      </div>
      <p className="text-[11.5px] text-zinc-500 leading-relaxed">
        {ERA_DESCRIPTIONS[era]}
      </p>
    </div>
  );
}
