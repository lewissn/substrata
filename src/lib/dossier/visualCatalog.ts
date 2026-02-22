// ---------------------------------------------------------------------------
// Visual Catalog — curated biome-aware hero images for Place Dossiers.
//
// Instead of a single generic image per geological period, we select images
// that match (period + biome/setting + latitude band).  All images are public
// domain or CC-licensed from Wikimedia Commons, served via the FilePath
// redirect which the browser follows to the CDN thumbnail.
//
// Missing combos fall back to:  period-level → setting placeholder.
// ---------------------------------------------------------------------------

import type { Img, VisualPlaceholder, PaleolatBand, LandSea } from "./types";

// ── Helpers ─────────────────────────────────────────────────────────────────

function fp(filename: string, width = 800): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}

type CatalogEntry = {
  url: string;
  credit?: string;
};

// ── Biome-keyed catalog ─────────────────────────────────────────────────────
// Keys follow placeNarrative.ts: `${stopKey}_${latBand}_${seaSetting}`
// plus `${stopKey}_any_land`, `${stopKey}_any_sea` as catch-alls.

const BIOME_IMAGES: Record<string, CatalogEntry> = {
  // === NOW ===
  now_equatorial_land: { url: fp("Tropical_forest_near_Fonds-Saint-Denis.jpg"), credit: "Wikimedia Commons" },
  now_tropical_land:   { url: fp("Savanna_towards_the_Serengeti.jpg"), credit: "Wikimedia Commons" },
  now_temperate_land:  { url: fp("Schwarzwald_Herbst.jpg"), credit: "Wikimedia Commons" },
  now_subpolar_land:   { url: fp("Picea_glauca_taiga.jpg"), credit: "Wikimedia Commons" },
  now_polar_land:      { url: fp("Greenland_tundra.jpg"), credit: "Wikimedia Commons" },
  now_any_sea:         { url: fp("Water_surface.jpg"), credit: "Wikimedia Commons" },

  // === 2,000 YEARS AGO ===
  y2k_tropical_land:   { url: fp("Roman_aqueduct_in_Caesarea.jpg"), credit: "Wikimedia Commons" },
  y2k_temperate_land:  { url: fp("Pont_du_Gard_BLS.jpg"), credit: "Wikimedia Commons / Benh LIEU SONG (CC BY-SA 3.0)" },
  y2k_any_sea:         { url: fp("Trireme.jpg"), credit: "Wikimedia Commons" },

  // === 5,000 YEARS AGO ===
  y5k_tropical_land:   { url: fp("All_Gizah_Pyramids.jpg"), credit: "Wikimedia Commons / Ricardo Liberato (CC BY-SA 2.0)" },
  y5k_temperate_land:  { url: fp("Stonehenge2007_07_30.jpg"), credit: "Wikimedia Commons / garethwiscombe (CC BY 2.0)" },

  // === 10,000 YEARS AGO ===
  y10k_tropical_land:  { url: fp("GobsklTepe_site.jpg"), credit: "Wikimedia Commons" },
  y10k_temperate_land: { url: fp("Star_Carr_Archaeological_Site.jpg"), credit: "Wikimedia Commons" },
  y10k_subpolar_land:  { url: fp("Moreno_glacier_Perito.jpg"), credit: "Wikimedia Commons" },

  // === 20,000 YEARS AGO (LGM) ===
  ka20_equatorial_land: { url: fp("African_savanna.jpg"), credit: "Wikimedia Commons" },
  ka20_tropical_land:   { url: fp("Saharan_sand_dunes.jpg"), credit: "Wikimedia Commons" },
  ka20_temperate_land:  { url: fp("Woolly_mammoth.jpg"), credit: "Wikimedia Commons / Charles R. Knight (public domain)" },
  ka20_subpolar_land:   { url: fp("Ice_age_earth.jpg"), credit: "Wikimedia Commons" },
  ka20_polar_land:      { url: fp("AntarcticaRocky.jpg"), credit: "Wikimedia Commons" },
  ka20_any_sea:         { url: fp("Ice_age_earth.jpg"), credit: "Wikimedia Commons" },

  // === 66 Ma (End Cretaceous) ===
  ma66_equatorial_land: { url: fp("Cretaceous_Montana_Scene.png"), credit: "Wikimedia Commons / Davide Bonadonna" },
  ma66_tropical_land:   { url: fp("Cretaceous_Montana_Scene.png"), credit: "Wikimedia Commons / Davide Bonadonna" },
  ma66_temperate_land:  { url: fp("Edmontosaurus_BW.jpg"), credit: "Wikimedia Commons / Nobu Tamura (CC BY-SA 3.0)" },
  ma66_any_sea:         { url: fp("Mosasaurus_beaugei1DB.jpg"), credit: "Wikimedia Commons / Dmitry Bogdanov (CC BY-SA 3.0)" },

  // === 120 Ma (Early Cretaceous) ===
  ma120_equatorial_land: { url: fp("Sauropod_tracks.jpg"), credit: "Wikimedia Commons" },
  ma120_tropical_land:   { url: fp("Iguanodon_v2.jpg"), credit: "Wikimedia Commons / Nobu Tamura (CC BY-SA 3.0)" },
  ma120_any_sea:         { url: fp("Plesiosaur_bazaar.jpg"), credit: "Wikimedia Commons" },

  // === 250 Ma (End-Permian) ===
  ma250_any_land:   { url: fp("Putorana_Plateau.jpg"), credit: "Wikimedia Commons" },
  ma250_any_sea:    { url: fp("Permian_Sea_Diorama.jpg"), credit: "Wikimedia Commons" },

  // === 300 Ma (Carboniferous) ===
  ma300_equatorial_land: { url: fp("Carboniferous_coal_swamp.jpg"), credit: "Wikimedia Commons" },
  ma300_tropical_land:   { url: fp("Carboniferous_coal_swamp.jpg"), credit: "Wikimedia Commons" },
  ma300_polar_land:      { url: fp("Late_Paleozoic_icehouse.jpg"), credit: "Wikimedia Commons" },
  ma300_any_sea:         { url: fp("Crinoid_on_the_reef.jpg"), credit: "Wikimedia Commons" },

  // === ~500 Ma (Cambrian) ===
  ma500_any_land:       { url: fp("Barren_landscape.jpg"), credit: "Wikimedia Commons" },
  ma500_equatorial_sea: { url: fp("Cambrian_Explosion.jpg"), credit: "Wikimedia Commons" },
  ma500_tropical_sea:   { url: fp("Cambrian_Explosion.jpg"), credit: "Wikimedia Commons" },
  ma500_any_sea:        { url: fp("Cambrian_Explosion.jpg"), credit: "Wikimedia Commons" },
};

// Period-level fallbacks (when no biome match)
const PERIOD_IMAGES: Record<string, CatalogEntry> = {
  now:   { url: fp("The_Earth_seen_from_Apollo_17.jpg"), credit: "NASA (public domain)" },
  y2k:   { url: fp("Roman_Empire_Trajan_117AD.png"), credit: "Wikimedia Commons" },
  y5k:   { url: fp("All_Gizah_Pyramids.jpg"), credit: "Wikimedia Commons" },
  y10k:  { url: fp("GobsklTepe_site.jpg"), credit: "Wikimedia Commons" },
  ka20:  { url: fp("Ice_age_earth.jpg"), credit: "Wikimedia Commons" },
  ma66:  { url: fp("Chicxulub_radar_topography.jpg"), credit: "Wikimedia Commons / USGS / NASA" },
  ma120: { url: fp("Early_Cretaceous.jpg"), credit: "Wikimedia Commons" },
  ma250: { url: fp("Putorana_Plateau.jpg"), credit: "Wikimedia Commons" },
  ma300: { url: fp("Carboniferous_coal_swamp.jpg"), credit: "Wikimedia Commons" },
  ma500: { url: fp("Cambrian_Explosion.jpg"), credit: "Wikimedia Commons" },
};

// ── Setting-based placeholders ──────────────────────────────────────────────

const PLACEHOLDERS: Record<string, VisualPlaceholder> = {
  ocean: {
    kind: "ocean",
    gradient: "linear-gradient(180deg, rgba(18,48,72,0.9) 0%, rgba(8,24,40,0.95) 100%)",
  },
  land: {
    kind: "land",
    gradient: "linear-gradient(180deg, rgba(42,56,36,0.9) 0%, rgba(28,36,24,0.95) 100%)",
  },
  ice: {
    kind: "ice",
    gradient: "linear-gradient(180deg, rgba(180,200,220,0.8) 0%, rgba(120,140,160,0.9) 100%)",
  },
  desert: {
    kind: "desert",
    gradient: "linear-gradient(180deg, rgba(180,150,100,0.8) 0%, rgba(120,95,60,0.9) 100%)",
  },
  forest: {
    kind: "forest",
    gradient: "linear-gradient(180deg, rgba(28,60,30,0.85) 0%, rgba(16,36,18,0.95) 100%)",
  },
  volcanic: {
    kind: "volcanic",
    gradient: "linear-gradient(180deg, rgba(90,40,20,0.85) 0%, rgba(40,18,10,0.95) 100%)",
  },
};

function placeholderForSetting(landSea: LandSea, stopKey: string, band: PaleolatBand): VisualPlaceholder {
  if (landSea === "sea") return PLACEHOLDERS.ocean;
  if (stopKey === "ka20" && (band === "subpolar" || band === "polar")) return PLACEHOLDERS.ice;
  if (stopKey === "ma250") return PLACEHOLDERS.volcanic;
  if (band === "polar" || band === "subpolar") return PLACEHOLDERS.ice;
  if (band === "tropical" && (stopKey === "ka20" || stopKey === "y10k")) return PLACEHOLDERS.desert;
  return PLACEHOLDERS.forest;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolve a hero visual for a given stop + biome classification.
 *
 * Priority:
 * 1. Exact biome key match from catalog
 * 2. "any" land/sea fallback for the stop
 * 3. Period-level image fallback
 * 4. If `resolvedImageUrl` is provided (e.g. from Wikipedia fetch), use that
 * 5. Setting-based CSS placeholder
 */
export function resolveHeroVisual(
  stopKey: string,
  band: PaleolatBand,
  landSea: LandSea,
  resolvedImageUrl?: string | null,
): Img | VisualPlaceholder {
  // Modern (Now): Wikipedia / Wikidata / Commons first, then catalog/placeholder
  if (stopKey === "now" && resolvedImageUrl) {
    return { url: resolvedImageUrl, credit: "Wikipedia" };
  }

  // 1. Exact biome key
  const biomeKey = `${stopKey}_${band}_${landSea}`;
  const exact = BIOME_IMAGES[biomeKey];
  if (exact) return { url: exact.url, credit: exact.credit };

  // 2. "any" land/sea for this stop
  const anyKey = `${stopKey}_any_${landSea}`;
  const any = BIOME_IMAGES[anyKey];
  if (any) return { url: any.url, credit: any.credit };

  // 3. Period-level fallback
  const period = PERIOD_IMAGES[stopKey];
  if (period) return { url: period.url, credit: period.credit };

  // 4. Externally resolved image (Wikipedia etc.) for non-now stops
  if (resolvedImageUrl) return { url: resolvedImageUrl, credit: "Wikipedia" };

  // 5. CSS placeholder
  return placeholderForSetting(landSea, stopKey, band);
}

/**
 * Get the Wikipedia page to use for thumbnail fetching (biome-aware).
 * Returns the wikiPage from the narrative biome profile if available.
 * This allows fallback image fetching when the catalog has no match.
 */
export function wikiPageForFallback(
  stopKey: string,
  band: PaleolatBand,
  landSea: LandSea,
): boolean {
  const biomeKey = `${stopKey}_${band}_${landSea}`;
  const anyKey = `${stopKey}_any_${landSea}`;
  return !BIOME_IMAGES[biomeKey] && !BIOME_IMAGES[anyKey] && !PERIOD_IMAGES[stopKey];
}
