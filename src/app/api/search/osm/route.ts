import { NextResponse } from "next/server";
import type { PlaceCard, PlaceKind } from "@/domain/placeCard";

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function pickKind(tags: Record<string, string>): PlaceKind {
  // Prefer more specific kinds first
  const historic = tags.historic;
  const ruins = tags.ruins;
  const tourism = tags.tourism;

  if (historic === "castle") return "castle";
  if (historic === "archaeological_site") return "archaeological_site";
  if (historic === "memorial") return "memorial";
  if (historic === "monument") return "monument";
  if (historic === "battlefield") return "battlefield";

  if (ruins && ruins !== "no") return "ruins";

  if (tourism === "attraction") return "attraction";

  if (historic) return "historic";
  return "historic";
}

function elementCoords(el: OverpassElement): { lat: number; lng: number } | null {
  if (typeof el.lat === "number" && typeof el.lon === "number") return { lat: el.lat, lng: el.lon };
  if (el.center && typeof el.center.lat === "number" && typeof el.center.lon === "number") {
    return { lat: el.center.lat, lng: el.center.lon };
  }
  return null;
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radius = Number(searchParams.get("radius") ?? "8000"); // meters
  const limit = Number(searchParams.get("limit") ?? "80"); // raw; we'll filter down

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Missing/invalid lat,lng" }, { status: 400 });
  }

  // Overpass QL: search for historic/ruins/archaeological/castle/monuments in radius.
  // We include node/way/relation; for ways/relations, we request `out center` to get coords.
  const query = `
[out:json][timeout:25];
(
  node(around:${radius},${lat},${lng})[historic];
  way(around:${radius},${lat},${lng})[historic];
  relation(around:${radius},${lat},${lng})[historic];

  node(around:${radius},${lat},${lng})[ruins];
  way(around:${radius},${lat},${lng})[ruins];
  relation(around:${radius},${lat},${lng})[ruins];

  node(around:${radius},${lat},${lng})[tourism=attraction];
  way(around:${radius},${lat},${lng})[tourism=attraction];
  relation(around:${radius},${lat},${lng})[tourism=attraction];
);
out tags center ${Math.min(Math.max(limit, 10), 300)};
`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: query,
    // Overpass can be slow; Next will still handle it but we keep it simple for MVP
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Overpass request failed", status: res.status, details: text.slice(0, 400) },
      { status: 502 }
    );
  }

  const data = await res.json();
  const elements: OverpassElement[] = data?.elements ?? [];

  // Filter: only named things (reduces noise massively)
  const named = elements.filter((el) => el.tags?.name);

  const cards: PlaceCard[] = named
    .map((el) => {
      const coords = elementCoords(el);
      if (!coords || !el.tags?.name) return null;

      const tags = el.tags ?? {};
      const kind = pickKind(tags);

      const dist = haversineM(lat, lng, coords.lat, coords.lng);

      return {
        id: `osm:${el.type}:${el.id}`,
        source: "osm",
        kind,
        title: tags.name,
        coords,
        distanceM: dist,
        // OSM doesn't reliably have nice summaries/images; keep minimal for now
        summary: tags.description || tags["heritage:description"] || tags.historic || tags.tourism,
        url: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        tags: Object.entries(tags)
          .slice(0, 12)
          .map(([k, v]) => `${k}=${v}`),
      } satisfies PlaceCard;
    })
    .filter(Boolean) as PlaceCard[];

  return NextResponse.json({ cards });
}