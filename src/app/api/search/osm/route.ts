import { NextResponse } from "next/server";
import type { PlaceCard, PlaceKind } from "@/domain/placeCard";
import { classifyEra } from "@/domain/classifyEra";

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function pickKind(tags: Record<string, string>): PlaceKind {
  const historic = tags.historic;
  const ruins = tags.ruins;
  const tourism = tags.tourism;

  if (historic === "castle") return "castle";
  if (historic === "archaeological_site") return "archaeological_site";
  if (historic === "memorial") return "memorial";
  if (historic === "monument") return "monument";
  if (historic === "battlefield") return "battlefield";
  if (historic === "prehistoric_site") return "prehistoric_site";
  if (historic === "megalith") return "megalith";

  if (tags.geological === "volcanic_vent" || tags.natural === "volcano") return "volcano";
  if (tags.geological === "impact_crater") return "impact_crater";
  if (tags.geological === "fault") return "fault_line";

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

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  const radius = Number(searchParams.get("radius") ?? "8000");
  const limit = Number(searchParams.get("limit") ?? "80");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Missing/invalid lat,lng" }, { status: 400 });
  }

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

  node(around:${radius},${lat},${lng})[natural=volcano];
  way(around:${radius},${lat},${lng})[natural=volcano];

  node(around:${radius},${lat},${lng})[geological];
  way(around:${radius},${lat},${lng})[geological];
);
out tags center ${Math.min(Math.max(limit, 10), 300)};
`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: query,
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

  const named = elements.filter((el) => el.tags?.name);

  const cards: PlaceCard[] = named
    .map((el) => {
      const coords = elementCoords(el);
      if (!coords || !el.tags?.name) return null;

      const tags = el.tags ?? {};
      const kind = pickKind(tags);

      const dist = haversineM(lat, lng, coords.lat, coords.lng);

      const partial: Partial<PlaceCard> = {
        source: "osm",
        kind,
        title: tags.name,
        summary: tags.description || tags["heritage:description"] || tags.historic || tags.tourism,
        tags: Object.entries(tags)
          .slice(0, 12)
          .map(([k, v]) => `${k}=${v}`),
      };

      return {
        id: `osm:${el.type}:${el.id}`,
        source: "osm" as const,
        kind,
        title: tags.name,
        coords,
        distanceM: dist,
        summary: partial.summary,
        url: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        tags: partial.tags,
        era: classifyEra(partial),
      } satisfies PlaceCard;
    })
    .filter(Boolean) as PlaceCard[];

  return NextResponse.json({ cards });
}
