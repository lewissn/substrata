import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// GPlates Web Service — paleocoastline polygons
// Fetches reconstructed coastline geometry for a given Ma.
// https://gws.gplates.org/
// ---------------------------------------------------------------------------

const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ma = Number(searchParams.get("ma") ?? "0");
  const model = searchParams.get("model") ?? "SETON2012";

  if (!Number.isFinite(ma) || ma < 0) {
    return NextResponse.json({ error: "Invalid Ma value" }, { status: 400 });
  }

  if (ma <= 0) {
    // Present day — no reconstruction needed
    return NextResponse.json({ ma: 0, geojson: null });
  }

  const clampedMa = Math.min(ma, 750);
  // Round to nearest 5 Ma for caching efficiency (coastlines don't change rapidly)
  const roundedMa = clampedMa < 1 ? Math.round(clampedMa * 100) / 100 : Math.round(clampedMa / 5) * 5;

  const ck = `coastline:${roundedMa}:${model}`;
  const cached = cache.get(ck);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    // GPlates coastline reconstruction endpoint
    const url =
      `https://gws.gplates.org/reconstruct/coastlines/` +
      `?time=${roundedMa}` +
      `&model=${encodeURIComponent(model)}` +
      `&format=geojson`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json({
        ma: roundedMa,
        geojson: null,
        warning: `GPlates coastlines unavailable (HTTP ${res.status})`,
      });
    }

    const geojson = await res.json();

    const result = {
      ma: roundedMa,
      geojson,
    };

    cache.set(ck, { data: result, ts: Date.now() });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      ma: roundedMa,
      geojson: null,
      warning: "GPlates coastline request failed",
    });
  }
}
