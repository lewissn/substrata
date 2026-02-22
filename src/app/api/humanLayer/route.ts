// ---------------------------------------------------------------------------
// Human Layer API — tiered human settlement context for a lat/lng + yearsAgo.
//
// Pipeline:
//  1. Wikidata geosearch (15 km radius, up to 15 entities)
//  2. Batch wbgetentities for P31 / P571 / P576 / P18
//  3. Overpass query for historic + place features within 5 km
//  4. Score entities → assign tier (1 = strong settlement, 2 = site, 3 = generic)
//  5. Compose narrative; return HumanContext JSON
//
// Caching: 7-day in-memory TTL + Promise deduplication.
// Only valid for yearsAgo = 1–15,000 (y2k / y5k / y10k stops).
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import type { HumanContext, HumanEvidence } from "@/lib/dossier/humanContext";
import {
  classifyRegion,
  classifyTimeBucket,
  getTier3Narrative,
} from "@/lib/dossier/humanNarrativeCatalog";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CURRENT_YEAR = 2025;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Wikidata P31 QIDs that indicate a strong settlement. */
const SETTLEMENT_QIDS = new Set([
  "Q515",     // city
  "Q1549591", // big city
  "Q7930989", // city/town
  "Q532",     // village
  "Q3957",    // town
  "Q5119",    // capital city
  "Q178803",  // imperial city
  "Q123705",  // suburb
  "Q1758566", // ancient city
  "Q48091959",// historical city
  "Q109739941",// archaeological settlement
  "Q2514025", // walled city
  "Q702492",  // fortified city
  "Q15284",   // municipality
  "Q486972",  // human settlement
  "Q2989575", // city-state
]);

/** Wikidata P31 QIDs that indicate an archaeological site / monument (Tier 2). */
const SITE_QIDS = new Set([
  "Q839954",  // archaeological site
  "Q23413",   // castle
  "Q44613",   // monastery
  "Q16748868",// ancient ruins
  "Q8060",    // fortification
  "Q1142365", // burial mound
  "Q3947",    // house / dwelling
  "Q16970",   // church
  "Q105999",  // palace
  "Q6030690", // military fortification
  "Q4989906", // monument
  "Q570116",  // tourist attraction (if historic)
]);

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

const cache = new Map<string, { data: HumanContext; ts: number }>();
const inFlight = new Map<string, Promise<HumanContext>>();

function makeCacheKey(lat: number, lng: number, yearsAgo: number): string {
  // ~1 km resolution; yearsAgo bucketed to the three relevant stops
  const bucket =
    yearsAgo <= 2500 ? "classical" : yearsAgo <= 5000 ? "bronze" : "neolithic";
  return `${lat.toFixed(2)}:${lng.toFixed(2)}:${bucket}`;
}

// ---------------------------------------------------------------------------
// Wikidata helpers
// ---------------------------------------------------------------------------

async function wikidataGeosearch(
  lat: number,
  lng: number,
): Promise<Array<{ item: string; distKm: number }>> {
  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "geosearch");
  url.searchParams.set("gscoord", `${lat}|${lng}`);
  url.searchParams.set("gsradius", "15000"); // 15 km in metres
  url.searchParams.set("gslimit", "15");
  url.searchParams.set("gsnamespace", "0");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "Substrata/1.0 (geological-time-explorer)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];

  const data = await res.json();
  const items: Array<{ title: string; dist: number }> =
    data?.query?.geosearch ?? [];
  return items.map((i) => ({ item: i.title, distKm: i.dist / 1000 }));
}

type RawWdEntity = {
  labels?: Record<string, { value: string }>;
  descriptions?: Record<string, { value: string }>;
  claims?: Record<string, unknown[]>;
};

async function wikidataGetEntities(
  ids: string[],
): Promise<Record<string, HumanEvidence & { p31Qid?: string }>> {
  if (ids.length === 0) return {};

  const url = new URL("https://www.wikidata.org/w/api.php");
  url.searchParams.set("action", "wbgetentities");
  url.searchParams.set("ids", ids.join("|"));
  url.searchParams.set("props", "labels|descriptions|claims");
  url.searchParams.set("languages", "en");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "Substrata/1.0 (geological-time-explorer)" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return {};

  const data = await res.json();
  const result: Record<string, HumanEvidence & { p31Qid?: string }> = {};

  for (const [id, raw] of Object.entries(
    (data.entities ?? {}) as Record<string, RawWdEntity>,
  )) {
    const claims = raw.claims ?? {};
    const name = raw.labels?.en?.value ?? id;
    const description = raw.descriptions?.en?.value;

    // P31 — instance of (first value, get QID)
    let p31Qid: string | undefined;
    const p31 = claims.P31 as Array<{
      mainsnak?: { datavalue?: { value?: { id?: string } } };
    }> | undefined;
    if (p31?.[0]?.mainsnak?.datavalue?.value?.id) {
      p31Qid = p31[0].mainsnak!.datavalue!.value!.id;
    }

    // P571 — inception date
    let inceptionYear: number | undefined;
    const p571 = claims.P571 as Array<{
      mainsnak?: { datavalue?: { value?: { time?: string } } };
    }> | undefined;
    if (p571?.[0]?.mainsnak?.datavalue?.value?.time) {
      const time = p571[0].mainsnak!.datavalue!.value!.time!;
      const m = time.match(/^([+-])(\d{4,})/);
      if (m) {
        const y = parseInt(m[2], 10);
        inceptionYear = m[1] === "-" ? -y : y;
      }
    }

    // P576 — dissolved / abolished
    let dissolutionYear: number | undefined;
    const p576 = claims.P576 as Array<{
      mainsnak?: { datavalue?: { value?: { time?: string } } };
    }> | undefined;
    if (p576?.[0]?.mainsnak?.datavalue?.value?.time) {
      const time = p576[0].mainsnak!.datavalue!.value!.time!;
      const m = time.match(/^([+-])(\d{4,})/);
      if (m) {
        const y = parseInt(m[2], 10);
        dissolutionYear = m[1] === "-" ? -y : y;
      }
    }

    // P18 — image (Commons filename → Special:FilePath URL)
    let imageUrl: string | undefined;
    const p18 = claims.P18 as Array<{
      mainsnak?: { datavalue?: { value?: string } };
    }> | undefined;
    if (p18?.[0]?.mainsnak?.datavalue?.value) {
      const filename = p18[0].mainsnak!.datavalue!.value!;
      if (typeof filename === "string") {
        const encoded = encodeURIComponent(filename.replace(/ /g, "_"));
        imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=400`;
      }
    }

    result[id] = { entityId: id, name, description, p31Qid, inceptionYear, dissolutionYear, imageUrl };
  }

  return result;
}

// ---------------------------------------------------------------------------
// Overpass helper
// ---------------------------------------------------------------------------

async function overpassHistoricCount(lat: number, lng: number): Promise<number> {
  const query = `[out:json][timeout:8];(
  node["historic"](around:5000,${lat},${lng});
  way["historic"](around:5000,${lat},${lng});
  node["place"~"^(city|town|village)$"](around:5000,${lat},${lng});
  way["place"~"^(city|town|village)$"](around:5000,${lat},${lng});
);out count;`;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return (data?.elements?.[0]?.tags?.total as number) ?? 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreDescription(desc: string | undefined): number {
  if (!desc) return 0;
  const d = desc.toLowerCase();
  const settlementTerms = [
    "city", "town", "village", "settlement", "capital",
    "municipality", "borough", "commune", "urban area",
  ];
  const siteTerms = [
    "archaeological site", "ruins", "fortress", "castle",
    "monastery", "temple", "monument", "burial mound", "fort",
  ];
  for (const t of settlementTerms) {
    if (d.includes(t)) return 3;
  }
  for (const t of siteTerms) {
    if (d.includes(t)) return 2;
  }
  return 0;
}

function scoreEvidence(
  ev: HumanEvidence & { p31Qid?: string },
  targetYear: number,
): number {
  let score = 0;

  // QID-based scoring (most reliable)
  if (ev.p31Qid) {
    if (SETTLEMENT_QIDS.has(ev.p31Qid)) score += 3;
    else if (SITE_QIDS.has(ev.p31Qid)) score += 2;
  }
  // Description-based scoring (fallback / supplement when QID not in set)
  if (score === 0) score += scoreDescription(ev.description);

  // Inception / dissolution temporal scoring
  if (ev.inceptionYear !== undefined) {
    if (ev.inceptionYear <= targetYear + 200) score += 2;
    else if (ev.inceptionYear > targetYear + 500) score -= 2; // Founded too late
  }
  if (ev.dissolutionYear !== undefined) {
    // Entity ceased to exist well before our target time
    if (ev.dissolutionYear < targetYear - 200) score -= 3;
  }

  return score;
}

// ---------------------------------------------------------------------------
// Narrative composer
// ---------------------------------------------------------------------------

function yearLabel(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  if (year > 0 && year < 1000) return `${year} CE`;
  return String(year);
}

function composeNarrative(
  top: HumanEvidence,
  tier: 1 | 2,
): { headline: string; summary: string; wikiUrl: string | undefined } {
  const wikiUrl = top.name
    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(top.name.replace(/ /g, "_"))}`
    : top.entityId
    ? `https://www.wikidata.org/wiki/${top.entityId}`
    : undefined;

  const headline = top.name;
  const parts: string[] = [];

  if (top.description) {
    parts.push(
      top.description.charAt(0).toUpperCase() + top.description.slice(1) + ".",
    );
  }
  if (top.inceptionYear !== undefined) {
    parts.push(`Founded or established around ${yearLabel(top.inceptionYear)}.`);
  }
  if (top.dissolutionYear !== undefined) {
    parts.push(`Dissolved or abandoned around ${yearLabel(top.dissolutionYear)}.`);
  }

  const summary =
    parts.length > 0
      ? parts.join(" ")
      : tier === 1
      ? `${top.name} was a notable settlement in this area at this time.`
      : `An archaeological site or historic feature was recorded near this location.`;

  return { headline, summary, wikiUrl };
}

// ---------------------------------------------------------------------------
// Core computation
// ---------------------------------------------------------------------------

async function computeHumanContext(
  lat: number,
  lng: number,
  yearsAgo: number,
): Promise<HumanContext> {
  const targetYear = CURRENT_YEAR - yearsAgo;
  const region = classifyRegion(lat, lng);
  const bucket = classifyTimeBucket(yearsAgo);

  // Fire Wikidata geosearch and Overpass in parallel
  const [geoHits, historicCount] = await Promise.all([
    wikidataGeosearch(lat, lng).catch(() => []),
    overpassHistoricCount(lat, lng).catch(() => 0),
  ]);

  // Fetch entity details for all hits
  const ids = geoHits.slice(0, 15).map((h) => h.item);
  const rawEntities = await wikidataGetEntities(ids).catch(
    () => ({}) as Record<string, HumanEvidence & { p31Qid?: string }>,
  );

  // Attach distances + compute scores
  const scored: Array<{ ev: HumanEvidence & { p31Qid?: string }; score: number }> = [];
  for (const hit of geoHits) {
    const ev = rawEntities[hit.item];
    if (!ev) continue;
    ev.distanceKm = Math.round(hit.distKm * 10) / 10;
    const s = scoreEvidence(ev, targetYear);
    ev.score = s;
    scored.push({ ev, score: s });
  }
  scored.sort((a, b) => b.score - a.score);

  // Tier assignment
  const topScore = scored[0]?.score ?? 0;
  let tier: 1 | 2 | 3;
  if (topScore >= 4) tier = 1;
  else if (topScore >= 2) tier = 2;
  else tier = 3;

  const topRaw = scored[0]?.ev;
  // Strip internal p31Qid from public output
  const toPublic = (ev: (HumanEvidence & { p31Qid?: string }) | undefined): HumanEvidence | undefined => {
    if (!ev) return undefined;
    const { p31Qid: _omit, ...pub } = ev;
    void _omit;
    return pub;
  };

  const supportingEntities = scored.slice(1, 4).map((s) => toPublic(s.ev)!);

  if (tier === 3) {
    const t3 = getTier3Narrative(region, bucket);
    return {
      tier: 3,
      targetYear,
      entities: supportingEntities,
      headline: t3.headline,
      summary: t3.summary,
      historicFeatureCount: historicCount,
    };
  }

  const { headline, summary, wikiUrl } = composeNarrative(topRaw!, tier);

  return {
    tier,
    targetYear,
    topEntity: toPublic(topRaw),
    entities: supportingEntities,
    headline,
    summary,
    wikiUrl,
    historicFeatureCount: historicCount,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const yearsAgo = parseInt(searchParams.get("yearsAgo") ?? "", 10);

  if (isNaN(lat) || isNaN(lng) || isNaN(yearsAgo)) {
    return NextResponse.json(
      { error: "lat, lng, yearsAgo are required" },
      { status: 400 },
    );
  }
  if (yearsAgo <= 0 || yearsAgo > 15000) {
    return NextResponse.json(
      { error: "yearsAgo must be in range 1–15000" },
      { status: 400 },
    );
  }

  const key = makeCacheKey(lat, lng, yearsAgo);

  // Cache hit
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  // Promise deduplication
  let promise = inFlight.get(key);
  if (!promise) {
    promise = computeHumanContext(lat, lng, yearsAgo)
      .then((data) => {
        cache.set(key, { data, ts: Date.now() });
        inFlight.delete(key);
        return data;
      })
      .catch((err) => {
        inFlight.delete(key);
        throw err;
      });
    inFlight.set(key, promise);
  }

  try {
    const data = await promise;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[humanLayer] computation failed:", err);
    // Graceful degradation: return Tier 3 fallback
    const region = classifyRegion(lat, lng);
    const bucket = classifyTimeBucket(yearsAgo);
    const t3 = getTier3Narrative(region, bucket);
    const fallback: HumanContext = {
      tier: 3,
      targetYear: CURRENT_YEAR - yearsAgo,
      entities: [],
      headline: t3.headline,
      summary: t3.summary,
    };
    return NextResponse.json(fallback);
  }
}
