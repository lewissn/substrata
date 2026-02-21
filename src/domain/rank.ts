import type { Era, PlaceCard } from "./placeCard";

function kindBoost(kind: PlaceCard["kind"]): number {
  switch (kind) {
    case "castle":
    case "archaeological_site":
    case "ruins":
    case "prehistoric_site":
    case "megalith":
    case "impact_crater":
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
      return 22; // wiki is usually rich
    default:
      return 0;
  }
}

export function scoreCard(c: PlaceCard, activeEra?: Era | null): number {
  let s = 0;
  s += kindBoost(c.kind);
  if (c.source === "wikipedia") s += 4;
  if (c.imageUrl) s += 12;
  if (c.summary && c.summary.length > 40) s += 8;
  if (typeof c.distanceM === "number") s += Math.max(0, 20 - c.distanceM / 500);

  // Era match boost — applied when user has selected a specific era
  if (activeEra && c.era === activeEra) s += 20;

  // Boost items with rich temporal data
  if (c.yearStart != null) s += 5;

  // Penalise very generic OSM names
  const t = c.title.toLowerCase();
  if (t === "memorial" || t === "war memorial" || t === "monument") s -= 10;

  return s;
}
