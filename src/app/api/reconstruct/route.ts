import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// GPlates Web Service — point reconstruction
// Returns the paleoposition of a modern lat/lng at a given Ma.
// https://gws.gplates.org/
// ---------------------------------------------------------------------------

// Simple in-memory cache
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (pure function, safe to cache long)

function cacheKey(lat: number, lng: number, ma: number, model: string) {
  return `gplates:${lat.toFixed(2)}:${lng.toFixed(2)}:${ma}:${model}`;
}

export type ReconstructionResult = {
  paleoLat: number;
  paleoLng: number;
  ma: number;
  model: string;
  climateBand: string; // rough climate band from paleolatitude
};

function climateBandFromLat(absLat: number): string {
  if (absLat < 10) return "Equatorial";
  if (absLat < 23.5) return "Tropical";
  if (absLat < 35) return "Subtropical";
  if (absLat < 55) return "Temperate";
  if (absLat < 66.5) return "Subpolar";
  return "Polar";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const ma = Number(searchParams.get("ma") ?? "0");
  const model = searchParams.get("model") ?? "SETON2012";

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Missing/invalid lat,lng" }, { status: 400 });
  }

  if (ma <= 0) {
    // Present day — return identity
    return NextResponse.json({
      paleoLat: lat,
      paleoLng: lng,
      ma: 0,
      model,
      climateBand: climateBandFromLat(Math.abs(lat)),
    } satisfies ReconstructionResult);
  }

  // GPlates max supported time is ~1000 Ma for most models
  const clampedMa = Math.min(ma, 750);

  // Check cache
  const ck = cacheKey(lat, lng, clampedMa, model);
  const cached = cache.get(ck);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const url =
      `https://gws.gplates.org/reconstruct/reconstruct_points/` +
      `?points=${lng},${lat}` +
      `&time=${clampedMa}` +
      `&model=${encodeURIComponent(model)}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          paleoLat: lat,
          paleoLng: lng,
          ma: clampedMa,
          model,
          climateBand: climateBandFromLat(Math.abs(lat)),
          warning: "GPlates unavailable, returning present-day position",
        },
        { status: 200 }
      );
    }

    const data = await res.json();

    // GPlates returns: { type: "MultiPoint", coordinates: [[lng, lat], ...] }
    const coords = data?.coordinates?.[0];
    if (!coords || coords.length < 2) {
      return NextResponse.json({
        paleoLat: lat,
        paleoLng: lng,
        ma: clampedMa,
        model,
        climateBand: climateBandFromLat(Math.abs(lat)),
        warning: "GPlates returned no data",
      });
    }

    const [paleoLng, paleoLat] = coords;
    const result: ReconstructionResult = {
      paleoLat,
      paleoLng,
      ma: clampedMa,
      model,
      climateBand: climateBandFromLat(Math.abs(paleoLat)),
    };

    cache.set(ck, { data: result, ts: Date.now() });

    return NextResponse.json(result);
  } catch {
    // Graceful degradation
    return NextResponse.json({
      paleoLat: lat,
      paleoLng: lng,
      ma: clampedMa,
      model,
      climateBand: climateBandFromLat(Math.abs(lat)),
      warning: "GPlates request failed",
    });
  }
}
