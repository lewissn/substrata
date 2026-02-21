import type { Era, PlaceCard, PlaceKind } from "./placeCard";

// ---------------------------------------------------------------------------
// Keyword scoring tables
// ---------------------------------------------------------------------------

const GEOLOGICAL_KEYWORDS: string[] = [
  "volcano", "volcanic", "lava", "magma", "tectonic", "fault", "seismic",
  "earthquake", "crater", "caldera", "geothermal", "geyser", "basalt",
  "igneous", "metamorphic", "geological", "geology",
];

const PREHISTORIC_KEYWORDS: string[] = [
  "neolithic", "paleolithic", "mesolithic", "megalith", "dolmen", "menhir",
  "standing stone", "stone circle", "bronze age", "iron age", "barrow",
  "tumulus", "earthwork", "fossil", "dinosaur", "jurassic", "cretaceous",
  "triassic", "permian", "prehistoric", "hominid", "homo sapiens", "flint",
  "lithic", "mound", "cairn",
];

const ANCIENT_KEYWORDS: string[] = [
  "roman", "roman empire", "greco-roman", "classical", "hellenistic",
  "byzantine", "greek", "ancient", "temple", "amphitheatre", "amphitheater",
  "forum", "aqueduct", "colosseum", "acropolis", "pharaoh", "egyptian",
  "mesopotamia", "assyrian", "sumerian", "persian empire", "carthaginian",
  "celtic", "iron age roman", "late antique", "early christian",
  "phoenician", "minoan", "mycenaean",
];

const MEDIEVAL_KEYWORDS: string[] = [
  "medieval", "middle ages", "norman", "saxon", "anglo-saxon", "gothic",
  "romanesque", "crusade", "crusader", "feudal", "monastery", "priory",
  "abbey", "cathedral", "bishop", "pope", "papal", "medieval castle",
  "12th century", "13th century", "14th century", "15th century",
  "1100s", "1200s", "1300s", "1400s",
  "knights", "templar", "hospitaller",
  "plantagenet", "carolingian", "merovingian", "viking",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      // longer phrases score higher (more specific signal)
      score += kw.includes(" ") ? 3 : 1;
    }
  }
  return score;
}

function textFrom(card: Partial<PlaceCard>): string {
  return [card.title ?? "", card.summary ?? "", ...(card.tags ?? [])].join(" ");
}

// ---------------------------------------------------------------------------
// Kind → era mapping (OSM structural kinds)
// ---------------------------------------------------------------------------

const KIND_ERA: Partial<Record<PlaceKind, Era>> = {
  castle: "medieval",
  ruins: "ancient",        // default; text scoring may override
  archaeological_site: "ancient",
  prehistoric_site: "prehistoric",
  megalith: "prehistoric",
  volcano: "geological",
  impact_crater: "geological",
  fault_line: "geological",
  monument: "modern",
  memorial: "modern",
  attraction: "modern",
  historic: "modern",
  article: "modern",       // default; text scoring may override
  battlefield: "modern",   // default; text scoring may override
};

// ---------------------------------------------------------------------------
// Main classifier
// ---------------------------------------------------------------------------

export function classifyEra(card: Partial<PlaceCard>): Era {
  // 1. Structural kind override for clear-cut cases
  const kindEra = card.kind ? KIND_ERA[card.kind] : undefined;

  // 2. Score text across all era categories
  const text = textFrom(card);

  const scores: Record<Era, number> = {
    geological: scoreKeywords(text, GEOLOGICAL_KEYWORDS),
    prehistoric: scoreKeywords(text, PREHISTORIC_KEYWORDS),
    ancient: scoreKeywords(text, ANCIENT_KEYWORDS),
    medieval: scoreKeywords(text, MEDIEVAL_KEYWORDS),
    modern: 0,
  };

  // 3. Find highest-scoring era from text
  let bestEra: Era = "modern";
  let bestScore = 0;
  for (const [era, score] of Object.entries(scores) as [Era, number][]) {
    if (score > bestScore) {
      bestScore = score;
      bestEra = era;
    }
  }

  // 4. Decision logic
  // If text gives a strong signal (score >= 2), trust it over kind defaults
  if (bestScore >= 2) return bestEra;

  // If text gives a weak signal (score 1) and kind has a default, split:
  // geological/prehistoric/ancient signals override even kind defaults
  if (bestScore === 1 && (bestEra === "geological" || bestEra === "prehistoric" || bestEra === "ancient")) {
    return bestEra;
  }

  // Fall back to kind-based era if available
  if (kindEra) return kindEra;

  // Final fallback
  return bestEra;
}
