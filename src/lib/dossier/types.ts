// ---------------------------------------------------------------------------
// Place Dossier — canonical types for a unified, location-aware narrative.
//
// A PlaceDossier is the single source of truth consumed by "This Place
// Through Time", archive entries, marker detail drawers, and share snippets.
// ---------------------------------------------------------------------------

/** Confidence in the dossier's classification accuracy. */
export type DossierConfidence = "high" | "medium" | "low";

/** Paleolatitude band. */
export type PaleolatBand =
  | "equatorial"
  | "tropical"
  | "temperate"
  | "subpolar"
  | "polar";

/** Land vs sea classification. */
export type LandSea = "land" | "sea";

// ---------------------------------------------------------------------------
// Setting — environmental classification at a given place + time
// ---------------------------------------------------------------------------

export type DossierSetting = {
  paleolatBand: PaleolatBand;
  landSea: LandSea;
  biome: string; // human-readable biome label
  settingLabel: string; // human-readable setting label
};

// ---------------------------------------------------------------------------
// Narrative — structured story content
// ---------------------------------------------------------------------------

export type DossierNarrative = {
  /** 1-2 sentence summary (always present). */
  summary: string;
  /** 4-6 bullet facts. */
  bullets: string[];
  /** Optional expandable "More detail" sections. */
  deeper?: {
    sections: Array<{ title: string; text: string }>;
  };
};

// ---------------------------------------------------------------------------
// Life — fossil evidence and flora/fauna
// ---------------------------------------------------------------------------

export type DossierTaxon = {
  name: string;
  count: number;
  interval?: string;
  distanceKm?: number;
  phylum?: string;
};

export type DossierLife = {
  headline?: string;
  taxa: DossierTaxon[];
  totalOccurrences: number;
  flora?: string[];
  fauna?: string[];
};

// ---------------------------------------------------------------------------
// Geology — bedrock, formation, lithology
// ---------------------------------------------------------------------------

export type DossierGeology = {
  periodName: string;
  bedrockAge?: string;
  lithology?: string;
  notes: string[];
};

// ---------------------------------------------------------------------------
// Visuals — hero image, supporting images, map overlays
// ---------------------------------------------------------------------------

export type Img = {
  url: string;
  credit?: string;
  sourceUrl?: string;
};

export type VisualPlaceholder = {
  kind: "ocean" | "land" | "ice" | "desert" | "forest" | "volcanic";
  gradient: string; // CSS gradient string
};

export type DossierVisuals = {
  hero: Img | VisualPlaceholder;
  /** Max 2 supporting images. */
  supporting: Img[];
  mapOverlays: {
    paleogeography: boolean;
    seaLevel: number | null;
    lgm: boolean;
  };
};

/** Type guard: is the hero an actual image (not a placeholder)? */
export function isImg(v: Img | VisualPlaceholder): v is Img {
  return "url" in v;
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export type DossierSourceKind =
  | "wiki"
  | "wikidata"
  | "commons"
  | "pbdb"
  | "gplates"
  | "bgs"
  | "osm"
  | "other";

export type DossierSource = {
  label: string;
  url?: string;
  kind: DossierSourceKind;
};

// ---------------------------------------------------------------------------
// PlaceDossier — the unified type
// ---------------------------------------------------------------------------

export type PlaceDossier = {
  place: {
    id: string;
    title: string;
    lat: number;
    lng: number;
    source: string;
  };
  time: {
    label: string;
    fullLabel: string;
    stopKey: string;
    ma?: number;
    yearsAgo?: number;
    periodName?: string;
  };
  confidence: DossierConfidence;
  setting: DossierSetting;
  narrative: DossierNarrative;
  life: DossierLife;
  geology: DossierGeology;
  visuals: DossierVisuals;
  sources: DossierSource[];
};
