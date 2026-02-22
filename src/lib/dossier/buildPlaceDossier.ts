// ---------------------------------------------------------------------------
// buildPlaceDossier — assembles a unified PlaceDossier from all available data.
//
// Pure/synchronous: all async enrichment (fossils, images) is pre-fetched and
// passed in via `input`.  The caller (e.g. ThisPlacePanel) manages the fetch
// lifecycle and can call this function repeatedly as data arrives for
// progressive rendering.
// ---------------------------------------------------------------------------

import type {
  PlaceDossier,
  DossierConfidence,
  DossierLife,
  DossierNarrative,
  DossierSource,
  DossierVisuals,
} from "./types";
import type { HumanContext } from "./humanContext";
import type { ActivePlace, TimeStopDef } from "@/domain/thisPlace";
import type { ReconstructionResult } from "@/app/api/reconstruct/route";
import type { FossilEnrichment } from "@/domain/fossilEnrichment";
import { generatePlaceNarrative } from "@/domain/placeNarrative";
import type { PlaceNarrative } from "@/domain/placeNarrative";
import { periodForMa } from "@/domain/periods";
import { seaLevelAtMa } from "@/domain/lgm";
import { getGeologyForStop } from "./geologyCatalog";
import { resolveHeroVisual, wikiPageForFallback } from "./visualCatalog";

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export type BuildDossierInput = {
  place: ActivePlace;
  stop: TimeStopDef;
  paleoData: ReconstructionResult | null;
  /** Pre-fetched fossil enrichment (null = not yet loaded). */
  fossils?: FossilEnrichment | null;
  /** Pre-fetched hero image URL (from Wikipedia or other). */
  heroImageUrl?: string | null;
  /** Pre-fetched human layer context (y2k / y5k / y10k stops). */
  humanContext?: HumanContext | null;
};

// ---------------------------------------------------------------------------
// Builder — strict time branching (no shared generic fallback between branches)
// ---------------------------------------------------------------------------

export function buildPlaceDossier(input: BuildDossierInput): PlaceDossier {
  const { place, stop, paleoData, fossils, heroImageUrl, humanContext } = input;

  const yearsAgo = stop.yearsAgo ?? (stop.ma != null && stop.ma > 0 ? undefined : 0);
  const isModern = yearsAgo === 0;
  const isRecentHuman = yearsAgo != null && yearsAgo > 0 && yearsAgo <= 10_000;
  const isDeepTime = stop.ma != null && stop.ma > 0;

  if (isModern) {
    return buildModernDossier(input);
  }
  if (isRecentHuman) {
    return buildRecentHumanDossier(input);
  }
  if (isDeepTime) {
    return buildDeepTimeDossier(input);
  }

  // Fallback only for edge cases (e.g. ka20 with yearsAgo)
  return buildDeepTimeDossier(input);
}

// ---------------------------------------------------------------------------
// Modern (Now) — urban/latitude only; no paleo; hero = Wikipedia first
// ---------------------------------------------------------------------------

function buildModernDossier(input: BuildDossierInput): PlaceDossier {
  const { place, stop, heroImageUrl } = input;
  const narrative = generatePlaceNarrative({
    lat: place.lat,
    lng: place.lng,
    stopKey: "now",
    paleoLat: null,
  });
  const geology = getGeologyForStop(stop);
  const hero = resolveHeroVisual(
    "now",
    narrative.latBand,
    narrative.seaSetting,
    heroImageUrl ?? undefined,
  );
  const dossierNarrative = buildNarrative(stop, narrative, null);
  const life = buildLifeSection(stop, narrative, null);
  const visuals = buildVisuals(stop, hero);
  const sources = buildSources(narrative, null, null);
  const periodName = derivePeriodName(stop);

  return {
    place: { id: place.id, title: place.title, lat: place.lat, lng: place.lng, source: place.source },
    time: {
      label: stop.label,
      fullLabel: stop.fullLabel,
      stopKey: stop.key,
      ma: stop.ma,
      yearsAgo: stop.yearsAgo,
      periodName,
    },
    confidence: "low",
    setting: {
      paleolatBand: narrative.latBand,
      landSea: narrative.seaSetting,
      biome: narrative.biome.biomeLabel,
      settingLabel: narrative.biome.settingLabel,
    },
    narrative: dossierNarrative,
    life,
    geology,
    visuals,
    sources,
  };
}

// ---------------------------------------------------------------------------
// Recent Human (2k–10k years) — tiered humanContext narrative
// ---------------------------------------------------------------------------

function buildRecentHumanDossier(input: BuildDossierInput): PlaceDossier {
  const { place, stop, paleoData, humanContext } = input;
  const narrative = generatePlaceNarrative({
    lat: place.lat,
    lng: place.lng,
    stopKey: stop.key,
    paleoLat: null,
  });
  const geology = getGeologyForStop(stop);
  const hero: PlaceDossier["visuals"]["hero"] = humanContext?.topEntity?.imageUrl
    ? { url: humanContext.topEntity.imageUrl, credit: "Wikidata / Commons" }
    : resolveHeroVisual(stop.key, narrative.latBand, narrative.seaSetting, undefined);
  const dossierNarrative = buildNarrativeRecentHuman(stop, narrative, humanContext);
  const life = buildLifeSection(stop, narrative, null);
  const visuals = buildVisuals(stop, hero);
  const sources = buildSources(narrative, null, null);
  const periodName = derivePeriodName(stop);

  return {
    place: { id: place.id, title: place.title, lat: place.lat, lng: place.lng, source: place.source },
    time: {
      label: stop.label,
      fullLabel: stop.fullLabel,
      stopKey: stop.key,
      ma: stop.ma,
      yearsAgo: stop.yearsAgo,
      periodName,
    },
    confidence: humanContext?.tier === 1 ? "high" : humanContext?.tier === 2 ? "medium" : "low",
    setting: {
      paleolatBand: narrative.latBand,
      landSea: narrative.seaSetting,
      biome: narrative.biome.biomeLabel,
      settingLabel: narrative.biome.settingLabel,
    },
    narrative: dossierNarrative,
    humanContext: humanContext ?? undefined,
    life,
    geology,
    visuals,
    sources,
  };
}

// ---------------------------------------------------------------------------
// Deep Time — location-sensitive (paleolat, land/sea, biome, PBDB)
// ---------------------------------------------------------------------------

function buildDeepTimeDossier(input: BuildDossierInput): PlaceDossier {
  const { place, stop, paleoData, fossils, heroImageUrl } = input;
  const narrative = generatePlaceNarrative({
    lat: place.lat,
    lng: place.lng,
    stopKey: stop.key,
    paleoLat: paleoData?.paleoLat ?? null,
  });
  const confidence = deriveConfidence(narrative, paleoData);
  const geology = getGeologyForStop(stop);
  const hero = resolveHeroVisual(
    stop.key,
    narrative.latBand,
    narrative.seaSetting,
    heroImageUrl ?? undefined,
  );
  const dossierNarrative = buildNarrative(stop, narrative, paleoData);
  const life = buildLifeSection(stop, narrative, fossils ?? null);
  const visuals = buildVisuals(stop, hero);
  const sources = buildSources(narrative, paleoData, fossils ?? null);
  const periodName = derivePeriodName(stop);

  return {
    place: { id: place.id, title: place.title, lat: place.lat, lng: place.lng, source: place.source },
    time: {
      label: stop.label,
      fullLabel: stop.fullLabel,
      stopKey: stop.key,
      ma: stop.ma,
      yearsAgo: stop.yearsAgo,
      periodName,
    },
    confidence,
    setting: {
      paleolatBand: narrative.latBand,
      landSea: narrative.seaSetting,
      biome: narrative.biome.biomeLabel,
      settingLabel: narrative.biome.settingLabel,
    },
    narrative: dossierNarrative,
    life,
    geology,
    visuals,
    sources,
  };
}

// ---------------------------------------------------------------------------
// Helpers: whether the Wikipedia fallback image path is needed
// ---------------------------------------------------------------------------

export { wikiPageForFallback };

// ---------------------------------------------------------------------------
// Internal builders
// ---------------------------------------------------------------------------

function deriveConfidence(
  narrative: PlaceNarrative,
  paleoData: ReconstructionResult | null,
): DossierConfidence {
  if (narrative.usedPaleoLat) return "high";
  if (paleoData) return "medium";
  return "low";
}

function derivePeriodName(stop: TimeStopDef): string | undefined {
  if (stop.ma != null && stop.ma > 0) {
    const period = periodForMa(stop.ma);
    return period?.name;
  }
  return undefined;
}

function buildNarrativeRecentHuman(
  stop: TimeStopDef,
  narrative: PlaceNarrative,
  humanContext: HumanContext | null | undefined,
): DossierNarrative {
  if (humanContext && (humanContext.tier === 1 || humanContext.tier === 2) && humanContext.topEntity) {
    const name = humanContext.topEntity.name;
    const summary =
      humanContext.summary ||
      `${name} was a notable settlement or historic place in this area at this time.`;
    return {
      summary,
      bullets: stop.bullets,
      deeper: undefined,
    };
  }
  if (humanContext?.headline && humanContext?.summary) {
    return {
      summary: humanContext.summary,
      bullets: stop.bullets,
      deeper: undefined,
    };
  }
  const summary = narrative.biome.narrative ?? stop.narrative;
  return {
    summary,
    bullets: narrative.biome.bullets ?? stop.bullets,
    deeper: undefined,
  };
}

function buildNarrative(
  stop: TimeStopDef,
  narrative: PlaceNarrative,
  paleoData: ReconstructionResult | null,
): DossierNarrative {
  const summary = narrative.biome.narrative ?? stop.narrative;
  const bullets = narrative.biome.bullets ?? stop.bullets;

  // Build expandable deeper sections when we have enough context
  const sections: Array<{ title: string; text: string }> = [];

  // Location note from paleodata
  if (stop.kind === "deep" && paleoData?.paleoLat != null) {
    const latAbs = Math.abs(paleoData.paleoLat);
    const latDir = paleoData.paleoLat >= 0 ? "N" : "S";
    const latDesc =
      latAbs < 10 ? "near the equator"
        : latAbs < 30 ? "in the tropics"
        : latAbs < 50 ? "in the mid-latitudes"
        : latAbs < 65 ? "in the sub-polar region"
        : "near the pole";

    let text = `At ${stop.label}, this location was approximately ${latAbs.toFixed(1)}\u00B0 ${latDir} \u2014 ${latDesc}.`;
    if (paleoData.climateBand) {
      text += ` The reconstructed climate zone was ${paleoData.climateBand.toLowerCase()}.`;
    }
    text += " These coordinates are derived from GPlates tectonic plate reconstructions and represent the approximate position of the continental crust at this time.";
    sections.push({ title: "Paleoposition", text });
  }

  // Environmental context from biome setting
  if (narrative.seaSetting === "sea") {
    sections.push({
      title: "Marine Environment",
      text: `This location was likely covered by ocean at this time. ${narrative.biome.settingLabel} conditions would have shaped the local marine ecosystem. Ocean chemistry, temperature, and depth all varied significantly across geological time, influencing which organisms could thrive here.`,
    });
  } else {
    const biomeNote = narrative.biome.biomeLabel !== "Terrestrial Environment"
      ? `The biome classification \u2014 ${narrative.biome.biomeLabel} \u2014 is based on the reconstructed latitude band and the known climate conditions of this period.`
      : "The specific environmental conditions depend on the period and paleolatitude.";
    sections.push({
      title: "Environmental Setting",
      text: `This was a terrestrial (land) setting: ${narrative.biome.settingLabel.toLowerCase()}. ${biomeNote} Climate, vegetation, and fauna at any given location were shaped by the interplay of latitude, continental position, atmospheric composition, and ocean circulation patterns.`,
    });
  }

  // Global context from the stop definition
  if (stop.narrative && stop.narrative !== summary) {
    sections.push({
      title: "Global Context",
      text: stop.narrative,
    });
  }

  return {
    summary,
    bullets,
    deeper: sections.length > 0 ? { sections } : undefined,
  };
}

function buildLifeSection(
  stop: TimeStopDef,
  narrative: PlaceNarrative,
  fossils: FossilEnrichment | null,
): DossierLife {
  const life: DossierLife = {
    taxa: [],
    totalOccurrences: 0,
  };

  // From fossils
  if (fossils && fossils.taxa.length > 0) {
    life.taxa = fossils.taxa.map((t) => ({
      name: t.name,
      count: t.count,
      interval: t.interval,
      distanceKm: t.distanceKm,
      phylum: t.phylum,
    }));
    life.totalOccurrences = fossils.totalOccurrences;
    life.headline = `${fossils.totalOccurrences} fossil occurrence${fossils.totalOccurrences !== 1 ? "s" : ""} recorded nearby`;
  }

  // Infer representative fauna/flora from biome label
  const biome = narrative.biome.biomeLabel.toLowerCase();
  if (stop.kind === "deep") {
    if (biome.includes("coal swamp") || biome.includes("carboniferous")) {
      life.flora = ["Lepidodendron (clubmoss trees)", "Sigillaria", "Tree ferns", "Seed ferns"];
      life.fauna = ["Meganeura (giant dragonfly)", "Arthropleura (giant millipede)", "Early amphibians"];
    } else if (biome.includes("cretaceous") && narrative.seaSetting === "land") {
      life.flora = ["Conifers", "Ferns", "Early angiosperms (flowering plants)"];
      life.fauna = ["Dinosaurs (hadrosaurs, ceratopsians, theropods)", "Pterosaurs", "Small mammals"];
    } else if (biome.includes("cretaceous") && narrative.seaSetting === "sea") {
      life.fauna = ["Ammonites", "Mosasaurs", "Plesiosaurs", "Giant sea turtles"];
    } else if (biome.includes("cambrian")) {
      life.fauna = ["Trilobites", "Anomalocaris", "Brachiopods", "Early echinoderms"];
    } else if (biome.includes("permian") || biome.includes("devastated")) {
      life.fauna = ["Synapsids (mammal ancestors)", "Early reptiles", "Surviving brachiopods"];
    } else if (biome.includes("mammoth")) {
      life.fauna = ["Woolly mammoth", "Cave lion", "Woolly rhinoceros", "Steppe bison"];
      life.flora = ["Grasses", "Artemisia (wormwood)", "Sparse shrubs"];
    }
  }

  return life;
}

function buildVisuals(
  stop: TimeStopDef,
  hero: DossierVisuals["hero"],
): DossierVisuals {
  const isDeep = stop.kind === "deep" && stop.ma != null && stop.ma > 0;
  const isLGM = stop.key === "ka20";

  return {
    hero,
    supporting: [],
    mapOverlays: {
      paleogeography: isDeep,
      seaLevel: isDeep && stop.ma != null ? seaLevelAtMa(stop.ma) : null,
      lgm: isLGM,
    },
  };
}

function buildSources(
  narrative: PlaceNarrative,
  paleoData: ReconstructionResult | null,
  fossils: FossilEnrichment | null,
): DossierSource[] {
  const sources: DossierSource[] = [];

  // Biome narrative source (Wikipedia)
  if (narrative.biome.wikiPage) {
    sources.push({
      label: narrative.biome.biomeLabel,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(narrative.biome.wikiPage)}`,
      kind: "wiki",
    });
  }

  // GPlates
  if (paleoData) {
    sources.push({
      label: `GPlates reconstruction (${paleoData.model})`,
      url: "https://gws.gplates.org",
      kind: "gplates",
    });
  }

  // PBDB
  if (fossils && fossils.totalOccurrences > 0) {
    sources.push({
      label: `Paleobiology Database (${fossils.totalOccurrences} occurrences)`,
      url: "https://paleobiodb.org",
      kind: "pbdb",
    });
  }

  return sources;
}
