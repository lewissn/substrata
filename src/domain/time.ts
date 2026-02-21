import type { Era, TimeSpan } from "./placeCard";

// ---------------------------------------------------------------------------
// Conversion: derive Ma from year-based time spans
// ---------------------------------------------------------------------------

/** Convert a TimeSpan to Ma values. Years CE/BCE → Ma. */
export function toMa(span?: TimeSpan): { maStart?: number; maEnd?: number } {
  if (!span) return {};
  // If Ma already populated, prefer it
  if (span.maStart != null || span.maEnd != null) {
    return { maStart: span.maStart, maEnd: span.maEnd };
  }
  // Convert from years: year CE → Ma
  // 2025 CE = ~0 Ma; 10000 BCE (-10000) = 0.012 Ma
  const currentYear = 2025;
  const yearToMa = (y: number) => Math.max(0, (currentYear - y) / 1_000_000);
  return {
    maStart: span.startYear != null ? yearToMa(span.startYear) : undefined,
    maEnd: span.endYear != null ? yearToMa(span.endYear) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Match: does a card's time span overlap with a given Ma value?
// ---------------------------------------------------------------------------

/** Check if a given Ma value falls within a time span (with tolerance). */
export function timeMatches(ma: number, span?: TimeSpan): boolean {
  if (!span) return false;
  const { maStart, maEnd } = toMa(span);
  if (maStart == null && maEnd == null) return false;

  const older = maStart ?? maEnd!;
  const younger = maEnd ?? maStart!;

  // Add 10% tolerance or 0.5 Ma minimum, whichever is larger
  const tolerance = Math.max(older * 0.1, 0.5);
  return ma <= older + tolerance && ma >= Math.max(0, younger - tolerance);
}

// ---------------------------------------------------------------------------
// Era ↔ Ma mapping
// ---------------------------------------------------------------------------

/** Map a Ma value to the most appropriate Era for display. */
export function eraFromMa(ma: number): Era {
  if (ma > 2.6) return "geological";    // before Quaternary
  if (ma > 0.012) return "prehistoric"; // Pleistocene (before Holocene ~12ka)
  if (ma > 0.003) return "ancient";     // ~3000 BCE to ~12000 BP
  if (ma > 0.0005) return "medieval";   // ~500 CE to ~3000 BCE
  return "modern";                      // ~500 years ago to present
}

/** Map an Era to a representative Ma value (for slider default position). */
export function maFromEra(era: Era): number {
  switch (era) {
    case "geological": return 100;
    case "prehistoric": return 0.1;   // ~100 ka
    case "ancient": return 0.003;     // ~3000 BCE
    case "medieval": return 0.001;    // ~1000 CE
    case "modern": return 0;
  }
}

// ---------------------------------------------------------------------------
// Display formatting
// ---------------------------------------------------------------------------

/** Format a TimeSpan for human display in the drawer. */
export function formatTimeSpan(span?: TimeSpan): string {
  if (!span) return "";

  // Prefer Ma display for geological timescales
  if (span.maStart != null || span.maEnd != null) {
    const fmtMa = (v: number) => {
      if (v >= 1000) return `${(v / 1000).toFixed(1)} Ga`;
      if (v >= 1) return `${v.toFixed(v < 10 ? 1 : 0)} Ma`;
      if (v >= 0.001) return `${(v * 1000).toFixed(0)} ka`;
      return `${(v * 1_000_000).toFixed(0)} years ago`;
    };
    if (span.maStart != null && span.maEnd != null) {
      return `${fmtMa(span.maStart)} – ${fmtMa(span.maEnd)}`;
    }
    if (span.maStart != null) return `~${fmtMa(span.maStart)}`;
    return `~${fmtMa(span.maEnd!)}`;
  }

  // Year-based display
  const fmtYear = (y: number) => {
    const abs = Math.abs(y);
    return y < 0 ? `${abs} BCE` : `${y} CE`;
  };
  if (span.startYear != null && span.endYear != null) {
    return `c. ${fmtYear(span.startYear)} – ${fmtYear(span.endYear)}`;
  }
  if (span.startYear != null) return `c. ${fmtYear(span.startYear)}`;
  if (span.endYear != null) return `c. ${fmtYear(span.endYear)}`;
  return "";
}

/** Format a single Ma value for display (slider labels, etc). */
export function formatMa(ma: number): string {
  if (ma === 0) return "Present";
  if (ma < 0.001) return `${Math.round(ma * 1_000_000)} yr`;
  if (ma < 1) return `${Math.round(ma * 1000)} ka`;
  if (ma >= 1000) return `${(ma / 1000).toFixed(1)} Ga`;
  if (ma >= 100) return `${Math.round(ma)} Ma`;
  if (ma >= 10) return `${Math.round(ma)} Ma`;
  return `${ma.toFixed(1)} Ma`;
}

// ---------------------------------------------------------------------------
// Ma slider presets
// ---------------------------------------------------------------------------

export type MaPreset = { label: string; ma: number; description: string };

export const MA_PRESETS: MaPreset[] = [
  { label: "Present", ma: 0, description: "Now" },
  { label: "LGM", ma: 0.021, description: "Last Glacial Maximum (~21 ka)" },
  { label: "Eemian", ma: 0.125, description: "Last Interglacial (~125 ka)" },
  { label: "Early Pleist.", ma: 2.6, description: "Start of ice ages (~2.6 Ma)" },
  { label: "Miocene", ma: 15, description: "Warm Earth, grasslands spread" },
  { label: "K–Pg", ma: 66, description: "End of the dinosaurs (~66 Ma)" },
  { label: "Jurassic", ma: 150, description: "Age of dinosaurs" },
  { label: "Triassic", ma: 230, description: "Pangaea intact, first dinosaurs" },
  { label: "Carbonif.", ma: 310, description: "Giant insects, vast forests" },
  { label: "Devonian", ma: 380, description: "Age of fishes" },
  { label: "Cambrian", ma: 520, description: "Explosion of life" },
  { label: "Ediacaran", ma: 600, description: "First complex life" },
];
