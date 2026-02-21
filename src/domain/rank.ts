import type { Era, PlaceCard } from "./placeCard";
import { timeMatches } from "./time";

function kindBoost(kind: PlaceCard["kind"]): number {
  switch (kind) {
    case "castle":
    case "archaeological_site":
    case "ruins":
    case "prehistoric_site":
    case "megalith":
    case "impact_crater":
    case "fossil_occurrence":
      return 30;
    case "battlefield":
    case "monument":
    case "memorial":
    case "volcano":
    case "fault_line":
      return 18;
    case "historic":
    case "attraction":
      return 10;
    case "article":
      return 22;
    default:
      return 0;
  }
}

export function scoreCard(
  c: PlaceCard,
  activeEra?: Era | null,
  activeMa?: number | null,
): number {
  let s = 0;
  s += kindBoost(c.kind);
  if (c.source === "wikipedia") s += 4;
  if (c.source === "pbdb") s += 2; // fossils get a small boost
  if (c.imageUrl) s += 12;
  if (c.summary && c.summary.length > 40) s += 8;
  if (typeof c.distanceM === "number") s += Math.max(0, 20 - c.distanceM / 500);

  // Era match boost
  if (activeEra && c.era === activeEra) s += 20;

  // Deep Time (Ma) match boost
  if (activeMa != null && activeMa > 0 && c.time) {
    if (timeMatches(activeMa, c.time)) s += 25;
  }

  // Boost items with rich temporal data
  if (c.time?.maStart != null || c.time?.startYear != null) s += 5;

  // Confidence boost
  if (c.confidence != null && c.confidence > 0.7) s += 3;

  // Penalise very generic OSM names
  const t = c.title.toLowerCase();
  if (t === "memorial" || t === "war memorial" || t === "monument") s -= 10;

  return s;
}
