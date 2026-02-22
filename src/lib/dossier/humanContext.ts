// ---------------------------------------------------------------------------
// Human Context — types for the tiered human settlement / history layer.
//
// Produced by /api/humanLayer and consumed by ThisPlacePanel.
// ---------------------------------------------------------------------------

/** Confidence tier for human context.
 * 1 = strong settlement evidence (Wikidata + inception date match)
 * 2 = archaeological / monument evidence
 * 3 = region-aware generic narrative (no local evidence found) */
export type HumanContextTier = 1 | 2 | 3;

export type HumanEvidence = {
  /** Wikidata entity ID (e.g. "Q84" for London). */
  entityId?: string;
  /** Display name of the entity. */
  name: string;
  /** Human-readable description from Wikidata (e.g. "capital city of the United Kingdom"). */
  description?: string;
  /** P31 (instance of) QID — used internally for tier scoring. */
  p31Qid?: string;
  /** Inception year from P571 (negative = BCE). */
  inceptionYear?: number;
  /** Dissolution/abolished year from P576 (negative = BCE). */
  dissolutionYear?: number;
  /** Commons image URL derived from P18. */
  imageUrl?: string;
  /** Distance from query centre in km. */
  distanceKm?: number;
  /** Internal relevance score. */
  score?: number;
};

export type HumanContext = {
  tier: HumanContextTier;
  /** The target calendar year used for relevance scoring (approx. currentYear − yearsAgo). */
  targetYear: number;
  /** Best-matching entity (Tier 1 or 2 only). */
  topEntity?: HumanEvidence;
  /** Supporting entities, up to 3. */
  entities: HumanEvidence[];
  /** Short headline (place name or period label). */
  headline: string;
  /** 1–2 sentence narrative summary. */
  summary: string;
  /** Wikipedia / Wikidata URL for the top entity. */
  wikiUrl?: string;
  /** Number of Overpass-found historic features within 5 km. */
  historicFeatureCount?: number;
};
