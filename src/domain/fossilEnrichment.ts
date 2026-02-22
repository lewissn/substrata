// ---------------------------------------------------------------------------
// Fossil Enrichment — client-side PBDB query with caching
// Fetches nearby fossil occurrences for deep-time stops and returns top taxa.
// ---------------------------------------------------------------------------

export type FossilTaxon = {
  name: string;
  count: number;
  interval: string;
  distanceKm: number;
  phylum?: string;
};

export type FossilEnrichment = {
  taxa: FossilTaxon[];
  totalOccurrences: number;
  loading: boolean;
};

const EMPTY: FossilEnrichment = { taxa: [], totalOccurrences: 0, loading: false };

// Module-level cache: "lat:lng:ma" → result
const FOSSIL_CACHE = new Map<string, FossilEnrichment>();

function cacheKey(lat: number, lng: number, ma: number): string {
  return `${lat.toFixed(2)}:${lng.toFixed(2)}:${ma}`;
}

/**
 * Fetch nearby fossil occurrences from our /api/search/pbdb proxy.
 * Returns top 3 taxa grouped by name, sorted by count then proximity.
 * Returns EMPTY immediately for non-deep-time stops (ma === 0).
 */
export async function fetchFossilEnrichment(
  lat: number,
  lng: number,
  ma: number,
): Promise<FossilEnrichment> {
  if (!ma || ma <= 0) return EMPTY;

  const ck = cacheKey(lat, lng, ma);
  const cached = FOSSIL_CACHE.get(ck);
  if (cached) return cached;

  try {
    const res = await fetch(
      `/api/search/pbdb?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&radius=150&ma=${ma}&limit=100`,
      { signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) return EMPTY;

    const data = await res.json();
    const cards: Array<{
      title: string;
      distanceM: number;
      summary: string;
      tags: string[];
    }> = data?.cards ?? [];

    if (cards.length === 0) {
      FOSSIL_CACHE.set(ck, EMPTY);
      return EMPTY;
    }

    // Group by taxon name
    const grouped = new Map<string, { count: number; minDistKm: number; interval: string; phylum?: string }>();
    for (const card of cards) {
      const name = card.title;
      const distKm = (card.distanceM ?? 0) / 1000;
      const interval = card.tags
        ?.find((t: string) => t.startsWith("interval="))
        ?.replace("interval=", "") ?? "";
      const phylum = card.tags
        ?.find((t: string) => t.startsWith("phylum="))
        ?.replace("phylum=", "") ?? undefined;

      const existing = grouped.get(name);
      if (existing) {
        existing.count += 1;
        existing.minDistKm = Math.min(existing.minDistKm, distKm);
      } else {
        grouped.set(name, { count: 1, minDistKm: distKm, interval, phylum });
      }
    }

    // Sort by count desc, then distance asc; take top 7
    const sorted = [...grouped.entries()]
      .sort((a, b) => b[1].count - a[1].count || a[1].minDistKm - b[1].minDistKm)
      .slice(0, 7);

    const taxa: FossilTaxon[] = sorted.map(([name, info]) => ({
      name,
      count: info.count,
      interval: info.interval,
      distanceKm: Math.round(info.minDistKm),
      phylum: info.phylum,
    }));

    const result: FossilEnrichment = {
      taxa,
      totalOccurrences: cards.length,
      loading: false,
    };

    FOSSIL_CACHE.set(ck, result);
    return result;
  } catch {
    return EMPTY;
  }
}
