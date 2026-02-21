import type { PlaceCard } from "./placeCard";

export function dedupe(cards: PlaceCard[]): PlaceCard[] {
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
