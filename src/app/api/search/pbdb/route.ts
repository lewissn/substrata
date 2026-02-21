import { NextResponse } from "next/server";
import type { PlaceCard } from "@/domain/placeCard";

// ---------------------------------------------------------------------------
// PBDB (Paleobiology Database) fossil occurrence search
// https://paleobiodb.org/data1.2/
// ---------------------------------------------------------------------------

const PBDB_BASE = "https://paleobiodb.org/data1.2";

// Simple in-memory cache: key → { data, ts }
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

function cacheKey(lat: number, lng: number, radius: number, maMin: number, maMax: number) {
  return `pbdb:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}:${maMin}:${maMax}`;
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

type PBDBOccurrence = {
  oid: number;
  tna?: string; // accepted name
  rnk?: number; // rank
  lat?: number;
  lng?: number;
  oei?: string; // early interval
  oli?: string; // late interval
  eag?: number; // early age (Ma)
  lag?: number; // late age (Ma)
  cll?: string; // collection name
  cc2?: string; // country code
  sfm?: string; // formation
  idq?: string; // id qualification
  phl?: string; // phylum
  cll_name?: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const radius = Number(searchParams.get("radius") ?? "50"); // km for PBDB
  const limit = Number(searchParams.get("limit") ?? "50");
  const maStr = searchParams.get("ma"); // optional Ma filter

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Missing/invalid lat,lng" }, { status: 400 });
  }

  // PBDB uses degrees for bounding; convert radius km to rough degree
  const degRadius = radius / 111; // ~111 km per degree
  const lng1 = lng - degRadius;
  const lng2 = lng + degRadius;
  const lat1 = lat - degRadius;
  const lat2 = lat + degRadius;

  // Ma filtering: if ma provided, search a window around it
  let maMin = 0;
  let maMax = 4600; // entire Earth history
  if (maStr) {
    const ma = Number(maStr);
    if (Number.isFinite(ma) && ma > 0) {
      // Window: ±30% of Ma, minimum ±5 Ma
      const window = Math.max(ma * 0.3, 5);
      maMin = Math.max(0, ma - window);
      maMax = ma + window;
    }
  }

  // Check cache
  const ck = cacheKey(lat, lng, radius, maMin, maMax);
  const cached = cache.get(ck);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const url =
      `${PBDB_BASE}/occs/list.json` +
      `?lngmin=${lng1.toFixed(4)}&lngmax=${lng2.toFixed(4)}` +
      `&latmin=${lat1.toFixed(4)}&latmax=${lat2.toFixed(4)}` +
      `&min_ma=${maMin}&max_ma=${maMax}` +
      `&show=coords,phylo,strat,loc` +
      `&limit=${Math.min(limit, 200)}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { cards: [], warning: "PBDB unavailable" },
        { status: 200 } // graceful degradation
      );
    }

    const data = await res.json();
    const records: PBDBOccurrence[] = data?.records ?? [];

    const cards: PlaceCard[] = records
      .filter((r) => r.lat != null && r.lng != null && r.tna)
      .map((r) => {
        const dist = haversineM(lat, lng, r.lat!, r.lng!);
        const interval = [r.oei, r.oli].filter(Boolean).join(" – ");
        const formation = r.sfm ? `Formation: ${r.sfm}` : "";
        const summaryParts = [interval, formation, r.phl ? `Phylum: ${r.phl}` : ""]
          .filter(Boolean);

        return {
          id: `pbdb:${r.oid}`,
          source: "pbdb" as const,
          kind: "fossil_occurrence" as const,
          title: r.tna!,
          coords: { lat: r.lat!, lng: r.lng! },
          distanceM: dist,
          summary: summaryParts.join(" · ") || "Fossil occurrence",
          url: `https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=${r.oid}`,
          tags: [
            interval ? `interval=${interval}` : "",
            r.sfm ? `formation=${r.sfm}` : "",
            r.phl ? `phylum=${r.phl}` : "",
          ].filter(Boolean),
          era: "geological" as const,
          time: {
            maStart: r.eag,
            maEnd: r.lag,
          },
          confidence: r.idq === "certain" ? 0.9 : r.idq === "uncertain" ? 0.4 : 0.6,
        } satisfies PlaceCard;
      });

    const result = { cards };
    cache.set(ck, { data: result, ts: Date.now() });

    return NextResponse.json(result);
  } catch {
    // Graceful degradation: PBDB failure shouldn't break the app
    return NextResponse.json({ cards: [], warning: "PBDB request failed" });
  }
}
