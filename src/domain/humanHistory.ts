// ---------------------------------------------------------------------------
// Human History Bridge — periods and utilities for the "Recent History" mode
// Covers 0–12,000 years ago (ka) in a meaningful narrative layer.
// ---------------------------------------------------------------------------

import type { Era } from "./placeCard";

export type HistoricalPeriod = {
  name: string;
  /** Lower bound in years ago (exclusive) */
  yearsAgoMin: number;
  /** Upper bound in years ago (inclusive) */
  yearsAgoMax: number;
  description: string;
  era: Era;
  /** Example sites / keywords for the user */
  examples: string;
};

export const HISTORICAL_PERIODS: HistoricalPeriod[] = [
  {
    name: "Modern Era",
    yearsAgoMin: 0,
    yearsAgoMax: 250,
    description:
      "The contemporary world — Industrial Revolution, World Wars, and the present day.",
    era: "modern",
    examples: "Historic railways, WWI & WWII sites, 20th-century landmarks",
  },
  {
    name: "Early Modern",
    yearsAgoMin: 250,
    yearsAgoMax: 600,
    description:
      "Age of Exploration and Enlightenment (c. 1400–1800 CE). European expansion, the Renaissance, and the birth of science.",
    era: "modern",
    examples: "Colonial forts, early modern city centres, Reformation churches",
  },
  {
    name: "Medieval",
    yearsAgoMin: 600,
    yearsAgoMax: 1500,
    description:
      "The Middle Ages across Europe, the Islamic Golden Age, and Mongol empires (c. 500–1400 CE).",
    era: "medieval",
    examples: "Castles, cathedrals, Viking settlements, Silk Road oasis cities",
  },
  {
    name: "Late Antiquity",
    yearsAgoMin: 1500,
    yearsAgoMax: 2000,
    description:
      "The decline of Rome and rise of Byzantium, early Christianity and Islam (c. 300–500 CE).",
    era: "ancient",
    examples: "Roman ruins, early basilicas, late Roman villas",
  },
  {
    name: "Classical Antiquity",
    yearsAgoMin: 2000,
    yearsAgoMax: 3000,
    description:
      "Peak of Greek, Roman, Persian, and Han Chinese civilisations (c. 1000 BCE–300 CE).",
    era: "ancient",
    examples: "Roman forums, Greek temples, Persian palaces, Han tombs",
  },
  {
    name: "Iron Age",
    yearsAgoMin: 3000,
    yearsAgoMax: 3500,
    description:
      "Iron-working cultures, early Celtic tribes, and Assyrian / Babylonian empires (c. 1200–1000 BCE).",
    era: "ancient",
    examples: "Hillforts, Phoenician ports, early Greek settlements",
  },
  {
    name: "Bronze Age",
    yearsAgoMin: 3500,
    yearsAgoMax: 5500,
    description:
      "Egypt, Mesopotamia, Indus Valley, Minoan Crete, and Mycenae (c. 3500–1200 BCE).",
    era: "ancient",
    examples: "Pyramids, Stonehenge, Minoan palaces, Indus cities",
  },
  {
    name: "Neolithic",
    yearsAgoMin: 5500,
    yearsAgoMax: 12000,
    description:
      "First farming cultures, megalithic monuments, and proto-cities (c. 10,000–3500 BCE).",
    era: "prehistoric",
    examples: "Göbekli Tepe, Çatalhöyük, megalithic passage tombs",
  },
];

/** Return the matching period for a given years-ago value, or null if ≤ 0. */
export function periodFromYears(yearsAgo: number): HistoricalPeriod | null {
  if (yearsAgo <= 0) return null;
  const found = HISTORICAL_PERIODS.find(
    (p) => yearsAgo > p.yearsAgoMin && yearsAgo <= p.yearsAgoMax
  );
  // Beyond 12,000 years — treat as Neolithic (deepest)
  return found ?? HISTORICAL_PERIODS[HISTORICAL_PERIODS.length - 1];
}

/** Map years-ago to the nearest Era for card ranking. */
export function eraFromYears(yearsAgo: number): Era {
  const p = periodFromYears(yearsAgo);
  return p?.era ?? "modern";
}

/** Year presets shown as quick-select buttons. */
export const YEAR_PRESETS = [
  { label: "Now",     years: 0 },
  { label: "500y",    years: 500 },
  { label: "1,000y",  years: 1000 },
  { label: "2,000y",  years: 2000 },
  { label: "5,000y",  years: 5000 },
  { label: "10,000y", years: 10000 },
] as const;

/** Human-readable label for a years-ago value. */
export function formatYearsAgo(years: number): string {
  if (years === 0) return "Now";
  if (years < 1000) return `${years} years ago`;
  const ka = years / 1000;
  return `${ka < 10 ? ka.toFixed(1) : Math.round(ka)}k years ago`;
}
