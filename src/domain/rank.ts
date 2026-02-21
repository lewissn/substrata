import type { PlaceCard } from "./placeCard";

function kindBoost(kind: PlaceCard["kind"]) {
  switch (kind) {
    case "castle":
    case "archaeological_site":
    case "ruins":
      return 30;
    case "battlefield":
    case "monument":
    case "memorial":
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

export function scoreCard(c: PlaceCard) {
  let s = 0;
  s += kindBoost(c.kind);
  if (c.source === "wikipedia") s += 4;
  if (c.imageUrl) s += 12;
  if (c.summary && c.summary.length > 40) s += 8;
  if (typeof c.distanceM === "number") s += Math.max(0, 20 - c.distanceM / 500); // closer = slightly higher
  // penalise very generic OSM names
  const t = c.title.toLowerCase();
  if (t === "memorial" || t === "war memorial" || t === "monument") s -= 10;
  return s;
}

export function dedupe(cards: PlaceCard[]) {
  const key = (c: PlaceCard) =>
    `${Math.round(c.coords.lat * 1000)}:${Math.round(c.coords.lng * 1000)}:${c.title.toLowerCase()}`;

  const seen = new Set<string>();
  const out: PlaceCard[] = [];

  for (const c of cards) {
    const k = key(c);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}