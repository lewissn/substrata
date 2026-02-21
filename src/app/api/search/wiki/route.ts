import { NextResponse } from "next/server";
import type { PlaceCard } from "@/domain/placeCard";

const WIKI = "https://en.wikipedia.org/w/api.php";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radius = Number(searchParams.get("radius") ?? "8000"); // meters
  const limit = Number(searchParams.get("limit") ?? "30");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Missing/invalid lat,lng" }, { status: 400 });
  }

  // 1) GeoSearch for nearby pages
  const geoUrl =
    `${WIKI}?action=query&format=json&origin=*` +
    `&list=geosearch&gscoord=${lat}%7C${lng}` +
    `&gsradius=${radius}&gslimit=${Math.min(limit, 50)}`;

  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();

  const hits: Array<{ pageid: number; title: string; lat: number; lon: number; dist: number }> =
    geoData?.query?.geosearch ?? [];

  if (hits.length === 0) {
    return NextResponse.json({ cards: [] satisfies PlaceCard[] });
  }

  const pageIds = hits.map((h) => h.pageid).join("|");

  // 2) Fetch extracts + thumbnails for those pages
  const detailsUrl =
    `${WIKI}?action=query&format=json&origin=*` +
    `&pageids=${pageIds}` +
    `&prop=extracts|pageimages|info` +
    `&exintro=1&explaintext=1&exsentences=2` +
    `&piprop=thumbnail&pithumbsize=320` +
    `&inprop=url`;

  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  const pages: Record<
    string,
    { pageid: number; title: string; extract?: string; fullurl?: string; thumbnail?: { source: string } }
  > = detailsData?.query?.pages ?? {};

  const byId = new Map(Object.values(pages).map((p) => [p.pageid, p]));

  const cards: PlaceCard[] = hits.map((h) => {
    const p = byId.get(h.pageid);
    return {
      id: `wiki:${h.pageid}`,
      source: "wikipedia",
      kind: "article",
      title: h.title,
      coords: { lat: h.lat, lng: h.lon },
      distanceM: h.dist,
      summary: p?.extract,
      imageUrl: p?.thumbnail?.source,
      url: p?.fullurl,
    };
  });

  return NextResponse.json({ cards });
}