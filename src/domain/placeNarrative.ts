// ---------------------------------------------------------------------------
// Place Narrative Engine
// Generates location-aware narratives for each time stop using a 4-layer
// classification pipeline: paleolatitude → sea/land → biome → narrative.
// LGM: ice narrative only when point is inside published ice extent mask.
// ---------------------------------------------------------------------------

import { isPointInLGMIce } from "./lgm";

// ── Types ──────────────────────────────────────────────────────────────────

export type LatBand = "equatorial" | "tropical" | "temperate" | "subpolar" | "polar";
export type SeaSetting = "land" | "sea";
export type Confidence = "high" | "moderate" | "low";

export type BiomeProfile = {
  biomeLabel: string;
  settingLabel: string;
  narrative: string;
  bullets: string[];
  wikiPage: string;
};

export type PlaceNarrative = {
  latBand: LatBand;
  latBandLabel: string;
  seaSetting: SeaSetting;
  biome: BiomeProfile;
  confidence: Confidence;
  usedPaleoLat: boolean;
};

export type GenerateParams = {
  lat: number;
  lng: number;
  stopKey: string;
  paleoLat: number | null;
};

// ── Layer 1: Paleolatitude classification ──────────────────────────────────

export function classifyLatBand(lat: number): LatBand {
  const a = Math.abs(lat);
  if (a < 15) return "equatorial";
  if (a < 30) return "tropical";
  if (a < 50) return "temperate";
  if (a < 65) return "subpolar";
  return "polar";
}

const LAT_BAND_LABELS: Record<LatBand, string> = {
  equatorial: "Equatorial",
  tropical: "Tropical",
  temperate: "Temperate",
  subpolar: "Sub-polar",
  polar: "Polar",
};

export function latBandLabel(b: LatBand): string {
  return LAT_BAND_LABELS[b];
}

// human-readable, hedged description — never raw degrees
export function latBandNarrativePhrase(b: LatBand): string {
  switch (b) {
    case "equatorial": return "near the equator";
    case "tropical": return "in the tropics";
    case "temperate": return "in the mid-latitudes";
    case "subpolar": return "in the sub-polar region";
    case "polar": return "near the pole";
  }
}

// ── Layer 2: Land vs sea classification ────────────────────────────────────
// Uses known paleoseaways (approximate bounding boxes) per period.
// Default = "land" because most user pin-drops are on visible land.

type BBox = [number, number, number, number]; // [latMin, latMax, lngMin, lngMax]

const PALEOSEAWAYS: Record<string, BBox[]> = {
  ma66: [
    [25, 72, -120, -65],   // Western Interior Seaway
    [10, 55, -10, 80],     // Tethys
  ],
  ma120: [
    [30, 70, -115, -70],   // Proto-WIS
    [-45, 70, -40, -5],    // Proto-Atlantic
    [5, 50, 0, 100],       // Tethys
  ],
  ma250: [
    [-15, 45, 0, 120],     // Tethys
  ],
  ma300: [
    [-10, 40, -10, 100],   // Paleo-Tethys / Rheic
  ],
  // ma500: handled specially — most areas were sea
};

function pointInBBox(lat: number, lng: number, box: BBox): boolean {
  return lat >= box[0] && lat <= box[1] && lng >= box[2] && lng <= box[3];
}

export function estimateSeaSetting(
  stopKey: string,
  lat: number,
  lng: number,
): SeaSetting {
  // Cambrian: sea level ~200m higher, most continental shelves flooded.
  // Default to sea unless clearly on a craton core.
  if (stopKey === "ma500") {
    // Major craton cores that were above water:
    const cratons: BBox[] = [
      [35, 60, -110, -70],  // Laurentia core
      [55, 70, 10, 40],     // Baltica core
      [-35, -15, 115, 150], // East Australia craton
      [-35, -10, 15, 35],   // Kaapvaal / southern Africa
    ];
    return cratons.some((b) => pointInBBox(lat, lng, b)) ? "land" : "sea";
  }

  // Check known seaways for deep time stops
  const seaways = PALEOSEAWAYS[stopKey];
  if (seaways) {
    if (seaways.some((b) => pointInBBox(lat, lng, b))) return "sea";
  }

  // All other stops: default land (user pins are almost always on visible land)
  return "land";
}

// ── Layer 3: Biome lookup ──────────────────────────────────────────────────
// Keyed as `${stopKey}_${latBand}_${seaSetting}` with fallbacks.

function biomeKey(stop: string, band: LatBand, sea: SeaSetting): string {
  return `${stop}_${band}_${sea}`;
}

export function getBiomeProfile(
  stopKey: string,
  band: LatBand,
  sea: SeaSetting,
): BiomeProfile {
  const exact = BIOME_MAP[biomeKey(stopKey, band, sea)];
  if (exact) return exact;

  // fallback: try "any" lat band
  const anyBand = BIOME_MAP[`${stopKey}_any_${sea}`];
  if (anyBand) return anyBand;

  // fallback: adjacent band
  const adjacent: Record<LatBand, LatBand[]> = {
    equatorial: ["tropical"],
    tropical: ["equatorial", "temperate"],
    temperate: ["tropical", "subpolar"],
    subpolar: ["temperate", "polar"],
    polar: ["subpolar"],
  };
  for (const alt of adjacent[band]) {
    const altProfile = BIOME_MAP[biomeKey(stopKey, alt, sea)];
    if (altProfile) return altProfile;
  }

  // absolute fallback
  return sea === "sea" ? DEFAULT_SEA : DEFAULT_LAND;
}

// ── Main generator ─────────────────────────────────────────────────────────

const NARRATIVE_CACHE = new Map<string, PlaceNarrative>();

export function generatePlaceNarrative(params: GenerateParams): PlaceNarrative {
  const { lat, lng, stopKey, paleoLat } = params;

  const cacheKey = `${lat.toFixed(2)}:${lng.toFixed(2)}:${stopKey}:${paleoLat?.toFixed(1) ?? "m"}`;
  const cached = NARRATIVE_CACHE.get(cacheKey);
  if (cached) return cached;

  const usedPaleoLat = paleoLat != null;
  const effectiveLat = paleoLat ?? lat;
  let band = classifyLatBand(effectiveLat);

  // LGM: ice narrative only when point is inside published ice extent mask (no latitude-based ice inference).
  if (stopKey === "ka20") {
    const insideIce = isPointInLGMIce(lat, lng);
    if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
      console.debug("LGM ice mask result:", { lat, lng, insideIce });
    }
    if (insideIce) {
      const biome = BIOME_MAP["ka20_ice_land"];
      const result: PlaceNarrative = {
        latBand: "temperate",
        latBandLabel: "Temperate",
        seaSetting: "land",
        biome: biome ?? {
          biomeLabel: "Ice-covered",
          settingLabel: "Continental Ice Sheet",
          narrative: "This location lay under LGM ice sheet extent.",
          bullets: ["Within mapped LGM ice extent.", "Sea level ~120 m lower globally."],
          wikiPage: "Last_Glacial_Maximum",
        },
        confidence: "high",
        usedPaleoLat: false,
      };
      NARRATIVE_CACHE.set(cacheKey, result);
      return result;
    }
    // Outside ice: use band/sea but for subpolar/polar use periglacial (not "Under Ice Sheet").
    if (band === "subpolar" || band === "polar") {
      const biome = BIOME_MAP["ka20_periglacial_land"];
      const result: PlaceNarrative = {
        latBand: band,
        latBandLabel: latBandLabel(band),
        seaSetting: "land",
        biome: biome ?? getBiomeProfile(stopKey, "temperate", "land"),
        confidence: "high",
        usedPaleoLat: false,
      };
      NARRATIVE_CACHE.set(cacheKey, result);
      return result;
    }
  }

  // Safety clamp: for "now", abs(lat) < 60 → never output taiga/tundra/subpolar unless proven by data
  if (stopKey === "now" && Math.abs(lat) < 60 && (band === "subpolar" || band === "polar")) {
    band = "temperate";
  }
  const sea = estimateSeaSetting(stopKey, lat, lng);
  const biome = getBiomeProfile(stopKey, band, sea);
  const confidence: Confidence = usedPaleoLat ? "high" : "moderate";

  const result: PlaceNarrative = {
    latBand: band,
    latBandLabel: latBandLabel(band),
    seaSetting: sea,
    biome,
    confidence,
    usedPaleoLat,
  };

  NARRATIVE_CACHE.set(cacheKey, result);
  return result;
}

// ── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_LAND: BiomeProfile = {
  biomeLabel: "Terrestrial Environment",
  settingLabel: "Continental",
  narrative: "This location was likely part of a continental landmass. Specific environmental details depend on the period and latitude.",
  bullets: [
    "Continental setting",
    "Climate conditions varied by latitude and period",
    "Life on land evolved dramatically across geological time",
  ],
  wikiPage: "Paleogeography",
};

const DEFAULT_SEA: BiomeProfile = {
  biomeLabel: "Marine Environment",
  settingLabel: "Ocean Basin",
  narrative: "This location was likely covered by ocean. Marine ecosystems have been the dominant habitat for life throughout most of Earth's history.",
  bullets: [
    "Marine setting",
    "Ocean chemistry and temperature varied across periods",
    "Marine biodiversity has undergone major expansions and extinctions",
  ],
  wikiPage: "Marine_biology",
};

// ── Biome Catalog ──────────────────────────────────────────────────────────
// Structured as ${stopKey}_${latBand}_${seaSetting}
// Content is calm, hedged, educational. No over-certainty.

const BIOME_MAP: Record<string, BiomeProfile> = {
  // ===================================================================
  //  NOW  (Present day)
  // ===================================================================
  now_equatorial_land: {
    biomeLabel: "Tropical Rainforest",
    settingLabel: "Equatorial Lowland",
    narrative: "Today this region likely supports dense tropical rainforest or tropical agriculture — the most biodiverse terrestrial biome on Earth, with warm temperatures and high rainfall year-round.",
    bullets: [
      "Mean temperature ~25–28°C, rainfall often >2000 mm/year",
      "Mega-biodiversity: canopy layers, epiphytes, insects",
      "Rapid nutrient cycling in thin, ancient soils",
      "Under pressure from deforestation and land-use change",
    ],
    wikiPage: "Tropical_rainforest",
  },
  now_tropical_land: {
    biomeLabel: "Tropical Savanna",
    settingLabel: "Subtropical",
    narrative: "This region likely features tropical savanna, dry forest, or seasonal woodland — characterised by a pronounced wet-dry cycle that shapes fire ecology and grassland-forest mosaics.",
    bullets: [
      "Pronounced wet and dry seasons",
      "Grasslands interspersed with scattered trees",
      "Fire-adapted ecosystems",
      "Large herbivore communities in many regions",
    ],
    wikiPage: "Tropical_and_subtropical_grasslands,_savannas,_and_shrublands",
  },
  now_temperate_land: {
    biomeLabel: "Temperate Forest / Grassland",
    settingLabel: "Mid-latitude Continental",
    narrative: "At this latitude, the landscape today likely features temperate broadleaf forest, mixed woodland, or agricultural land — shaped by four distinct seasons and moderate rainfall.",
    bullets: [
      "Four distinct seasons with moderate precipitation",
      "Deciduous and mixed forests or converted farmland",
      "Rich soils, historically among the most productive biomes",
      "Heavily modified by agriculture in most regions",
    ],
    wikiPage: "Temperate_broadleaf_and_mixed_forests",
  },
  now_subpolar_land: {
    biomeLabel: "Boreal Forest (Taiga)",
    settingLabel: "Sub-polar Continental",
    narrative: "This sub-polar region is likely covered by boreal conifer forest — the world's largest terrestrial biome, dominated by spruce, larch, and pine across vast expanses of permafrost and peatland.",
    bullets: [
      "Long, cold winters; short growing seasons",
      "Dominated by cold-tolerant conifers",
      "Extensive permafrost and peat bogs",
      "Critical carbon store — large quantities of soil carbon",
    ],
    wikiPage: "Taiga",
  },
  now_polar_land: {
    biomeLabel: "Tundra / Ice Sheet",
    settingLabel: "Polar",
    narrative: "At this high latitude, the landscape is likely tundra — treeless, wind-swept terrain with permafrost close to the surface — or covered by permanent ice sheet.",
    bullets: [
      "Mean annual temperature well below 0°C",
      "Permafrost underlies the thin active soil layer",
      "Sparse vegetation: mosses, lichens, low shrubs",
      "Migratory species dominate summer months",
    ],
    wikiPage: "Tundra",
  },
  now_any_sea: {
    biomeLabel: "Modern Ocean",
    settingLabel: "Open Marine",
    narrative: "This location is currently in open ocean — a marine ecosystem shaped by depth, temperature, currents, and nutrient upwelling patterns.",
    bullets: [
      "Ocean covers ~71% of Earth's surface",
      "Marine biodiversity concentrated on shelves and reefs",
      "Deep ocean below 200 m is Earth's largest habitat by volume",
      "Ocean absorbs ~30% of anthropogenic CO₂",
    ],
    wikiPage: "Marine_ecosystem",
  },

  // ===================================================================
  //  2,000 YEARS AGO  (Classical Antiquity)
  // ===================================================================
  y2k_equatorial_land: {
    biomeLabel: "Equatorial Forest",
    settingLabel: "Tropical Lowland",
    narrative: "Two thousand years ago this equatorial region was likely dense tropical forest, with scattered settlements practising shifting cultivation. Many areas remained largely untouched by large-scale agriculture.",
    bullets: [
      "Dense tropical forest with minimal large-scale clearing",
      "Shifting cultivation and forest-garden systems in some regions",
      "Climate and sea level very similar to present",
      "Trade networks connecting coastal and interior communities",
    ],
    wikiPage: "History_of_agriculture",
  },
  y2k_tropical_land: {
    biomeLabel: "Classical-Era Subtropical",
    settingLabel: "Mediterranean / Subtropical",
    narrative: "At this latitude, the landscape two thousand years ago was shaped by classical civilisations — Roman provinces, Ptolemaic Egypt, Mauryan India, or Han-dynasty China depending on longitude. Agriculture was well established.",
    bullets: [
      "Mediterranean scrub, dry grassland, or irrigated farmland",
      "Roman Empire, Han dynasty, or Mauryan successor states nearby",
      "Extensive road networks and trade routes",
      "Climate very similar to present, sea level within ~1 m",
    ],
    wikiPage: "Classical_antiquity",
  },
  y2k_temperate_land: {
    biomeLabel: "Temperate Forest / Farmland",
    settingLabel: "Mid-latitude",
    narrative: "In the temperate mid-latitudes, this location was likely forested or partially cleared for agriculture. In Europe, the Roman Empire shaped the landscape; in East Asia, the Han dynasty.",
    bullets: [
      "Mixed deciduous forest, partially cleared for farming",
      "Iron Age or classical-era settlements in many regions",
      "Road and river trade networks",
      "Climate and landscape broadly similar to today",
    ],
    wikiPage: "Roman_Empire",
  },
  y2k_subpolar_land: {
    biomeLabel: "Northern Forest",
    settingLabel: "Sub-polar",
    narrative: "At this latitude, dense boreal forest covered the landscape with sparse human populations — small hunting and fishing communities with seasonal migration patterns.",
    bullets: [
      "Dense conifer forest, little permanent settlement",
      "Hunter-gatherer and early pastoral communities",
      "Climate similar to present, slightly warmer in some regions",
      "Fur-bearing animals abundant",
    ],
    wikiPage: "Subarctic_peoples",
  },
  y2k_polar_land: {
    biomeLabel: "Arctic Wilderness",
    settingLabel: "Polar",
    narrative: "This polar region was treeless tundra or ice, inhabited by specialised Arctic peoples with sophisticated cold-weather survival strategies.",
    bullets: [
      "Treeless tundra or permanent ice",
      "Small nomadic populations in some Arctic regions",
      "Marine mammal hunting where coastal",
      "Landscape effectively unchanged from present",
    ],
    wikiPage: "Arctic_peoples",
  },
  y2k_any_sea: {
    biomeLabel: "Ancient Sea",
    settingLabel: "Marine",
    narrative: "This marine location was navigated by classical-era sailors — Polynesian, Roman, Chinese, or Arab depending on the region. The sea itself was ecologically similar to today.",
    bullets: [
      "Sea level within ~1 m of present",
      "Active maritime trade routes in many regions",
      "Marine ecosystems similar to modern",
      "Coral reefs and fisheries broadly intact",
    ],
    wikiPage: "Ancient_maritime_history",
  },

  // ===================================================================
  //  5,000 YEARS AGO  (Bronze Age)
  // ===================================================================
  y5k_equatorial_land: {
    biomeLabel: "Equatorial Forest",
    settingLabel: "Tropical Lowland",
    narrative: "Five thousand years ago the equatorial zone was almost entirely pristine tropical forest, with only the earliest traces of agricultural clearing. Human populations were small and widely scattered.",
    bullets: [
      "Dense, largely unbroken tropical forest",
      "Small-scale farming beginning in some river valleys",
      "Holocene Climatic Optimum — slightly warmer northern latitudes",
      "Sea level 0–2 m lower than present in many regions",
    ],
    wikiPage: "Neolithic_Revolution",
  },
  y5k_tropical_land: {
    biomeLabel: "Bronze Age Landscape",
    settingLabel: "Subtropical",
    narrative: "In the subtropics, the Bronze Age was beginning. Egyptian pyramids were rising, Sumerian cities flourished, and early Harappan settlements dotted the Indus. The Sahara was transitioning from green savanna to desert.",
    bullets: [
      "Egyptian Old Kingdom — pyramids under construction",
      "Sumerian city-states in Mesopotamia",
      "Sahara shifting from grassland to desert (Green Sahara ending)",
      "Climate slightly warmer than present in many subtropical regions",
      "Bronze metallurgy spreading",
    ],
    wikiPage: "Bronze_Age",
  },
  y5k_temperate_land: {
    biomeLabel: "Megalithic Forest",
    settingLabel: "Temperate",
    narrative: "At temperate latitudes, most of the landscape was dense post-glacial forest. Neolithic farming communities were beginning to clear patches, and megalithic monuments were being erected across Atlantic Europe.",
    bullets: [
      "Dense deciduous and mixed forest cover",
      "Neolithic farming slowly expanding from southeast",
      "Megalithic monument building (Stonehenge era)",
      "Sea level still rising slowly from post-glacial lows",
    ],
    wikiPage: "Neolithic_Europe",
  },
  y5k_subpolar_land: {
    biomeLabel: "Mesolithic Northern Forest",
    settingLabel: "Sub-polar",
    narrative: "At sub-polar latitudes, dense boreal forest hosted small bands of hunter-gatherers following reindeer, elk, and seasonal fish runs. The landscape was barely touched by human activity.",
    bullets: [
      "Dense boreal forest, post-glacial expansion complete",
      "Hunter-gatherer bands with seasonal camps",
      "Rich freshwater and marine resources",
      "Holocene Thermal Maximum ending — cooling trend beginning",
    ],
    wikiPage: "Mesolithic",
  },
  y5k_any_sea: {
    biomeLabel: "Post-glacial Sea",
    settingLabel: "Marine",
    narrative: "This marine area was experiencing the final stages of post-glacial sea level rise. Coastlines were still stabilising, and many shallow shelf areas had only recently been flooded.",
    bullets: [
      "Sea level 0–2 m lower than present, still rising slowly",
      "Coral reefs expanding on newly flooded shelves",
      "Early maritime navigation in some coastal regions",
      "Marine productivity increasing as ocean circulation stabilised",
    ],
    wikiPage: "Holocene_sea_level",
  },

  // ===================================================================
  //  10,000 YEARS AGO  (Neolithic transition)
  // ===================================================================
  y10k_equatorial_land: {
    biomeLabel: "Post-glacial Tropical Forest",
    settingLabel: "Equatorial",
    narrative: "Ten thousand years ago, tropical forests were expanding into areas that had been drier during the ice age. The equatorial zone was wetter and warmer than during the glacial maximum, supporting dense jungle and early foraging communities.",
    bullets: [
      "Tropical forest recovering and expanding from glacial refugia",
      "Sea level ~40–60 m lower — extensive coastal plains now submerged",
      "Small hunter-gatherer populations",
      "Post-glacial warming accelerating",
    ],
    wikiPage: "Neolithic",
  },
  y10k_tropical_land: {
    biomeLabel: "Fertile Crescent Transition",
    settingLabel: "Subtropical",
    narrative: "In the subtropical zone, this was the dawn of agriculture. In the Fertile Crescent, the first crops were being domesticated. Across the Sahara, green grasslands supported lakes, hippos, and pastoralists.",
    bullets: [
      "First domestication of wheat, barley, and pulses (Levant)",
      "Green Sahara — lakes and savanna where desert exists today",
      "Global human population ~5–10 million",
      "Post-glacial warming driving rapid landscape change",
      "Sea level rising rapidly (~40–60 m below present)",
    ],
    wikiPage: "Neolithic_Revolution",
  },
  y10k_temperate_land: {
    biomeLabel: "Expanding Post-glacial Forest",
    settingLabel: "Mid-latitude",
    narrative: "Across the temperate mid-latitudes, forests were rapidly advancing northward as ice sheets retreated. Birch and pine colonised former tundra, followed by oak and elm. Mesolithic hunter-gatherers followed the expanding forest edge.",
    bullets: [
      "Rapid northward forest expansion (birch → pine → deciduous)",
      "Mesolithic hunter-gatherers with sophisticated toolkits",
      "Large post-glacial lakes and wetlands",
      "Megafauna (aurochs, elk) still present",
      "Sea level ~40–60 m lower — coastal geography very different",
    ],
    wikiPage: "Mesolithic",
  },
  y10k_subpolar_land: {
    biomeLabel: "Retreating Ice Margin",
    settingLabel: "Periglacial",
    narrative: "At this sub-polar latitude, the great ice sheets were in full retreat. The landscape was raw — recently deglaciated terrain with pioneer plants colonising bare moraine. Meltwater carved vast river systems.",
    bullets: [
      "Ice sheets retreating at ~100–200 m per year",
      "Bare moraine, pioneer vegetation (lichens, mosses, grasses)",
      "Enormous meltwater rivers and proglacial lakes",
      "Permafrost thawing southward",
    ],
    wikiPage: "Deglaciation",
  },
  y10k_polar_land: {
    biomeLabel: "Ice Sheet Margin",
    settingLabel: "Glacial",
    narrative: "This location was likely still covered by retreating ice sheet or was very recently deglaciated. The landscape was a raw frontier of rock, meltwater, and pioneer organisms.",
    bullets: [
      "Glacial ice retreating or recently melted",
      "Exposed bedrock scoured by ice",
      "Meltwater channels and proglacial lakes",
      "No established vegetation",
    ],
    wikiPage: "Last_glacial_period",
  },
  y10k_any_sea: {
    biomeLabel: "Transgressive Shallow Sea",
    settingLabel: "Rising Sea",
    narrative: "Sea level was 40–60 m lower than today, meaning much of the modern continental shelf was dry land. This location may have been exposed land, a tidal estuary, or a newly forming shallow sea.",
    bullets: [
      "Sea level ~40–60 m below present, rising rapidly",
      "Modern coastlines did not yet exist",
      "Land bridges connected many modern islands to continents",
      "Marine ecosystems recolonising flooding shelves",
    ],
    wikiPage: "Post-glacial_sea_level_rise",
  },

  // ===================================================================
  //  20,000 YEARS AGO  (Last Glacial Maximum)
  //  Ice-covered only when point is inside LGM ice extent mask (see isPointInLGMIce).
  // ===================================================================
  ka20_ice_land: {
    biomeLabel: "Ice-covered",
    settingLabel: "Continental Ice Sheet",
    narrative: "This location lay under the margin of a major LGM ice sheet. Thickness varied; the ice extended from an interior accumulation zone and sculpted the landscape.",
    bullets: [
      "Within the mapped extent of LGM continental ice",
      "Ice thickness varied with distance from the centre",
      "Sea level was ~120 m lower globally",
      "Land would be exposed only after ice retreat",
    ],
    wikiPage: "Last_Glacial_Maximum",
  },
  ka20_periglacial_land: {
    biomeLabel: "Periglacial / Tundra Steppe",
    settingLabel: "Cold Grassland at Ice Margin",
    narrative: "During the LGM this area lay outside the main ice sheets. Cold, dry conditions supported tundra steppe or periglacial grassland — part of the mammoth steppe biome, with sea level ~120 m lower exposing coastal plains.",
    bullets: [
      "Outside the mapped LGM ice sheet extent",
      "Cold grassland or tundra steppe",
      "Sea level ~120 m lower — exposed shelves",
      "Woolly mammoth, horse, bison in many regions",
    ],
    wikiPage: "Mammoth_steppe",
  },
  ka20_equatorial_land: {
    biomeLabel: "Glacial Dry Savanna",
    settingLabel: "Equatorial (Arid Phase)",
    narrative: "During the Last Glacial Maximum, even equatorial regions were drier than today. Tropical rainforests contracted into refugia, replaced by grassland and dry woodland across large areas.",
    bullets: [
      "Tropical rainforest contracted to smaller refugia",
      "Expanded savanna and dry woodland",
      "Lower rainfall — ~30% less than present in many areas",
      "Temperature ~3–4°C cooler at equatorial latitudes",
      "CO₂ at ~180 ppm — lowest in 800,000 years",
    ],
    wikiPage: "Last_Glacial_Maximum",
  },
  ka20_tropical_land: {
    biomeLabel: "Glacial Arid Steppe",
    settingLabel: "Subtropical Desert/Steppe",
    narrative: "At subtropical latitudes during the LGM, aridity was extreme. Deserts expanded, grasslands replaced forests, and many regions that are green today were cold, windswept steppe.",
    bullets: [
      "Sahara hyper-arid — much larger than today",
      "Arabian and central Asian deserts expanded",
      "Cold, dry steppe in Mediterranean regions",
      "Global average temperature ~6°C colder",
      "Sea level ~120 m lower — vast coastal plains exposed",
    ],
    wikiPage: "Last_Glacial_Maximum",
  },
  ka20_temperate_land: {
    biomeLabel: "Mammoth Steppe",
    settingLabel: "Periglacial Grassland",
    narrative: "At temperate latitudes, the LGM landscape was the iconic mammoth steppe — a vast, cold, dry grassland unlike anything on Earth today, supporting woolly mammoths, horses, bison, and cave lions.",
    bullets: [
      "Cold, dry grassland — the 'mammoth steppe' biome",
      "Woolly mammoth, cave lion, woolly rhinoceros, steppe bison",
      "Wind-deposited loess mantling the landscape",
      "Human (Homo sapiens) presence in many regions",
      "Sea level ~120 m lower — Doggerland, Beringia exposed",
    ],
    wikiPage: "Mammoth_steppe",
  },
  ka20_subpolar_land: {
    biomeLabel: "Under Ice Sheet",
    settingLabel: "Continental Ice Sheet",
    narrative: "At this latitude, the landscape was likely buried under kilometres of glacial ice — the Laurentide, Fennoscandian, or Patagonian ice sheets depending on the hemisphere.",
    bullets: [
      "Buried under 1–3 km of glacial ice",
      "Ice surface well above surrounding terrain",
      "Glacial flow eroding and sculpting bedrock",
      "Periglacial conditions at the ice margin",
      "This landscape would not be exposed for thousands of years",
    ],
    wikiPage: "Laurentide_Ice_Sheet",
  },
  ka20_polar_land: {
    biomeLabel: "Deep Ice Sheet",
    settingLabel: "Polar Ice",
    narrative: "Deep polar ice covered this location, forming the core of massive continental ice sheets. The ice here was kilometres thick and had been accumulating for tens of thousands of years.",
    bullets: [
      "Ice sheet core — 2–4 km thick",
      "Oldest ice at the base dating to previous glacial cycles",
      "Trapped air bubbles record atmospheric composition",
      "Bedrock depressed hundreds of metres by ice weight",
    ],
    wikiPage: "Ice_sheet",
  },
  ka20_any_sea: {
    biomeLabel: "Glacial Ocean",
    settingLabel: "Exposed Shelf / Cold Ocean",
    narrative: "With sea level 120 m lower, many modern shelf areas were dry land. If this was deep ocean, it was colder, with expanded sea ice and altered circulation patterns.",
    bullets: [
      "Sea level ~120 m lower than today",
      "Continental shelves widely exposed as land",
      "Ocean circulation patterns significantly different",
      "Sea ice extended much further equatorward",
      "Marine productivity reduced in many regions",
    ],
    wikiPage: "Last_Glacial_Maximum",
  },

  // ===================================================================
  //  66 Ma  (End of the Cretaceous / K-Pg)
  // ===================================================================
  ma66_equatorial_land: {
    biomeLabel: "Cretaceous Tropical Jungle",
    settingLabel: "Equatorial Lowland",
    narrative: "At equatorial latitudes in the latest Cretaceous, this region likely supported lush, humid forest dominated by flowering plants, ferns, and conifers — with titanosaur sauropods and diverse theropod predators.",
    bullets: [
      "Dense angiosperm-dominated forest with fern understorey",
      "Titanosaur sauropods, hadrosaurs, ceratopsians (regionally)",
      "CO₂ ~600–1500 ppm; temperature ~8°C warmer than today",
      "No ice caps; sea level ~100–200 m higher",
      "Insects and early mammals diversifying in understorey",
    ],
    wikiPage: "Late_Cretaceous",
  },
  ma66_tropical_land: {
    biomeLabel: "Cretaceous Subtropical Forest",
    settingLabel: "Subtropical",
    narrative: "At subtropical latitudes, the late Cretaceous landscape was warm broadleaf and conifer forest. Dinosaurs dominated the ecosystem; flowering plants were diversifying rapidly.",
    bullets: [
      "Mixed angiosperm-conifer forest",
      "Hadrosaurs, ceratopsians, and tyrannosaurs (in North America)",
      "Warm, humid conditions year-round",
      "No polar ice — warm ocean currents reached high latitudes",
      "Asteroid impact imminent — ending this ecosystem abruptly",
    ],
    wikiPage: "Cretaceous–Paleogene_extinction_event",
  },
  ma66_temperate_land: {
    biomeLabel: "Warm Cretaceous Forest",
    settingLabel: "Mid-latitude (warm)",
    narrative: "Even at temperate latitudes, the Cretaceous world was warm enough for broad forests with no permanent frost. Mixed conifer and flowering-plant communities supported diverse dinosaur faunas.",
    bullets: [
      "No permanent frost at any latitude",
      "Deciduous and evergreen forests",
      "Diverse dinosaur communities including large herbivores",
      "Primitive mammals — small, nocturnal, insectivorous",
      "CO₂ levels several times modern — very warm greenhouse",
    ],
    wikiPage: "Cretaceous",
  },
  ma66_subpolar_land: {
    biomeLabel: "Cretaceous Polar Forest",
    settingLabel: "Sub-polar (warm)",
    narrative: "Remarkably, even sub-polar regions in the Cretaceous supported forests. These experienced months of winter darkness but remained above freezing. Small dinosaurs adapted to these extreme photoperiod conditions.",
    bullets: [
      "Forests grew within the polar circle",
      "Months of winter darkness but above-freezing temperatures",
      "Specialised small dinosaurs (hypsilophodonts and similar)",
      "Deciduous conifers shedding needles for polar winter",
      "No permanent ice at either pole",
    ],
    wikiPage: "Dinosaur_Park_Formation",
  },
  ma66_polar_land: {
    biomeLabel: "Cretaceous Polar Woodland",
    settingLabel: "Polar (ice-free)",
    narrative: "At polar latitudes, the Cretaceous world was ice-free. Open woodland and seasonal bogs experienced extreme photoperiods — continuous summer light and winter darkness — yet remained habitable.",
    bullets: [
      "No permanent ice caps",
      "Open deciduous woodland adapted to polar light cycles",
      "Temperatures above freezing even in winter at many sites",
      "Fossil evidence of diverse polar ecosystems",
    ],
    wikiPage: "Polar_forests_of_the_Cretaceous",
  },
  ma66_any_sea: {
    biomeLabel: "Cretaceous Epicontinental Sea",
    settingLabel: "Shallow Marine / Seaway",
    narrative: "This location was likely covered by warm, shallow sea — possibly part of the Western Interior Seaway, the Tethys, or another epicontinental sea. Ammonites, mosasaurs, and giant marine turtles inhabited these waters.",
    bullets: [
      "Warm shallow seas — much of continental area flooded",
      "Ammonites, belemnites, and rudist reef-builders",
      "Mosasaurs — apex marine predators up to 15 m long",
      "Giant sea turtles (Archelon) and plesiosaurs",
      "Sea level ~100–200 m higher than today",
    ],
    wikiPage: "Western_Interior_Seaway",
  },

  // ===================================================================
  //  120 Ma  (Early Cretaceous)
  // ===================================================================
  ma120_equatorial_land: {
    biomeLabel: "Early Cretaceous Tropical Forest",
    settingLabel: "Equatorial Lowland",
    narrative: "During the Early Cretaceous, this equatorial region was likely dense forest of conifers, ferns, and cycads — with the very first flowering plants just beginning to appear. Sauropod dinosaurs dominated.",
    bullets: [
      "Conifer-fern-cycad forests (angiosperms just emerging)",
      "Sauropod dinosaurs at peak diversity",
      "CO₂ ~1,000–2,000 ppm; very warm greenhouse",
      "No ice caps; sea level ~150–250 m higher than today",
      "Atlantic Ocean was still a narrow, young seaway",
    ],
    wikiPage: "Early_Cretaceous",
  },
  ma120_tropical_land: {
    biomeLabel: "Cretaceous Subtropical Woodland",
    settingLabel: "Subtropical",
    narrative: "At subtropical latitudes, the Early Cretaceous featured open woodland and wetlands dominated by conifers and ferns. Iguanodon-like ornithopods and large predatory theropods were common.",
    bullets: [
      "Open conifer-fern woodland with seasonal wetlands",
      "Iguanodontids, early hadrosaur ancestors, and theropods",
      "Climate warm and humid year-round",
      "Continents still drifting apart — Atlantic widening",
    ],
    wikiPage: "Iguanodon",
  },
  ma120_temperate_land: {
    biomeLabel: "Cretaceous Mixed Forest",
    settingLabel: "Mid-latitude",
    narrative: "At mid-latitudes, the Early Cretaceous landscape was cool but ice-free — mixed conifer forests with fern undergrowth, supporting a range of small to medium dinosaurs and early birds.",
    bullets: [
      "Conifer-dominated forests with fern understory",
      "Early birds diversifying from small theropod ancestors",
      "Small mammals — shrew-sized, nocturnal",
      "No frost — warmer than equivalent latitudes today",
    ],
    wikiPage: "Cretaceous",
  },
  ma120_any_sea: {
    biomeLabel: "Cretaceous Marine Seaway",
    settingLabel: "Shallow to Open Marine",
    narrative: "This location was likely part of a warm Cretaceous sea — home to ichthyosaurs, plesiosaurs, and abundant ammonites. The oceans were warmer and higher than today.",
    bullets: [
      "Ichthyosaurs, plesiosaurs, and early mosasaurs",
      "Abundant ammonites and belemnites",
      "Warm ocean temperatures — no polar sea ice",
      "Sea level ~150–250 m higher than present",
    ],
    wikiPage: "Plesiosauria",
  },

  // ===================================================================
  //  250 Ma  (End-Permian extinction)
  // ===================================================================
  // The Great Dying — special case. All biomes are in catastrophic collapse.
  ma250_any_land: {
    biomeLabel: "Devastated Permian Landscape",
    settingLabel: "Pangaean Interior (dying)",
    narrative: "This was the time of the Great Dying — the worst mass extinction in Earth's history. Siberian flood basalts had been erupting for hundreds of thousands of years, injecting CO₂ and toxins. The landscape was likely desolate, with dying vegetation and collapsing ecosystems.",
    bullets: [
      "96% of marine and ~70% of land species going extinct",
      "Supercontinent Pangaea — vast, arid continental interior",
      "Siberian Traps eruptions — massive CO₂ and methane release",
      "Global temperature +8–10°C above normal",
      "Acid rain, ozone depletion, toxic metal pollution",
      "Recovery would take ~10 million years",
    ],
    wikiPage: "Permian–Triassic_extinction_event",
  },
  ma250_any_sea: {
    biomeLabel: "Anoxic Permian Ocean",
    settingLabel: "Dying Marine Ecosystem",
    narrative: "The Permian oceans were in catastrophic collapse — warm, stratified, and increasingly depleted of oxygen. Hydrogen sulphide may have poisoned shallow waters. Marine life was being annihilated.",
    bullets: [
      "96% of marine species going extinct",
      "Widespread ocean anoxia (oxygen depletion)",
      "Possible euxinia — toxic hydrogen sulphide in shallow seas",
      "Reef ecosystems completely destroyed",
      "Ocean acidification from volcanic CO₂",
      "Marine ecosystems would not recover for millions of years",
    ],
    wikiPage: "Permian–Triassic_extinction_event",
  },

  // ===================================================================
  //  300 Ma  (Carboniferous)
  // ===================================================================
  ma300_equatorial_land: {
    biomeLabel: "Coal Swamp Forest",
    settingLabel: "Equatorial Lowland",
    narrative: "This location lay in the equatorial belt of the Carboniferous — the iconic coal swamp forest. Towering clubmoss trees (Lepidodendron) up to 40 m tall grew in vast tropical wetlands. Atmospheric oxygen was at ~35%, enabling giant insects.",
    bullets: [
      "Giant clubmoss trees (Lepidodendron, Sigillaria) up to 40 m",
      "Atmospheric O₂ ~35% — highest in Earth history",
      "Giant dragonflies (Meganeura, 70 cm wingspan)",
      "Giant millipedes (Arthropleura, 2 m long)",
      "These forests formed the coal deposits we mine today",
      "First reptiles appearing — freed from water by amniote egg",
    ],
    wikiPage: "Coal_forest",
  },
  ma300_tropical_land: {
    biomeLabel: "Tropical Carboniferous Forest",
    settingLabel: "Tropical Swamp Margin",
    narrative: "At tropical latitudes, the Carboniferous landscape was humid forest transitioning between the iconic coal swamps and drier upland communities. Giant amphibians and early reptiles inhabited these environments.",
    bullets: [
      "Humid forest and wetland mosaics",
      "Tree ferns and seed ferns abundant",
      "Giant amphibians in waterways",
      "Early reptiles diversifying on drier ground",
      "High atmospheric oxygen supporting large body sizes",
    ],
    wikiPage: "Carboniferous",
  },
  ma300_temperate_land: {
    biomeLabel: "Carboniferous Seasonal Forest",
    settingLabel: "Mid-latitude",
    narrative: "At mid-latitudes, the Carboniferous featured seasonal forests of seed ferns and early conifers. The climate was cooler than the equatorial belt, with some glacial influence from the southern hemisphere.",
    bullets: [
      "Seed fern and early conifer forests",
      "Seasonal climate with cooler winters",
      "Less coal formation than equatorial regions",
      "Early reptiles — the first fully terrestrial vertebrates",
      "Southern-hemisphere glaciation affecting global climate",
    ],
    wikiPage: "Carboniferous",
  },
  ma300_polar_land: {
    biomeLabel: "Gondwana Ice Sheet",
    settingLabel: "Glacial (Southern Hemisphere)",
    narrative: "At polar latitudes — particularly in the southern hemisphere (Gondwana) — the Carboniferous featured significant glaciation. Ice sheets advanced and retreated cyclically.",
    bullets: [
      "Gondwana (southern) ice sheet — cyclical advance and retreat",
      "Glacial till and striations in the rock record",
      "Sea-level changes driven by ice sheet oscillation",
      "Sparse polar vegetation between glacial advances",
    ],
    wikiPage: "Late_Paleozoic_icehouse",
  },
  ma300_any_sea: {
    biomeLabel: "Carboniferous Marine Shelf",
    settingLabel: "Shallow Marine Shelf",
    narrative: "Carboniferous shallow seas were rich ecosystems — crinoid gardens, coral reefs, and diverse invertebrate communities covered the continental shelves. Early sharks were the top marine predators.",
    bullets: [
      "Crinoid 'meadows' covering vast shelf areas",
      "Rugose and tabulate coral reefs",
      "Brachiopods more diverse than modern bivalves",
      "Early sharks (Cladoselache relatives) as apex predators",
      "Cyclical sea-level changes from Gondwana ice sheet",
    ],
    wikiPage: "Carboniferous",
  },

  // ===================================================================
  //  ~500 Ma  (Cambrian)
  // ===================================================================
  // Land was lifeless at this time. All biomes are either barren rock or marine.
  ma500_any_land: {
    biomeLabel: "Barren Cambrian Rock",
    settingLabel: "Lifeless Land Surface",
    narrative: "In the Cambrian, no life existed on land — no plants, no animals, no soil. The land surface was bare rock, sand, and gravel, sculpted only by wind and water. All of Earth's biodiversity was in the sea.",
    bullets: [
      "No life on land whatsoever — not even mosses or lichens",
      "No soil — just weathered rock and sediment",
      "Erosion driven purely by physical processes (wind, rain, freeze-thaw)",
      "Ultraviolet radiation intense at surface (thin ozone layer)",
      "Barren landscapes resembling modern Mars more than modern Earth",
    ],
    wikiPage: "Cambrian",
  },
  ma500_equatorial_sea: {
    biomeLabel: "Cambrian Tropical Reef",
    settingLabel: "Shallow Tropical Shelf",
    narrative: "In the warm, shallow equatorial seas of the Cambrian, the first complex reef ecosystems were developing. Trilobites patrolled the seafloor while Anomalocaris — a metre-long predator — hunted above.",
    bullets: [
      "Archaeocyathid reef-builders (early sponge relatives)",
      "Trilobites — the dominant arthropods, hundreds of species",
      "Anomalocaris — the first large predator (~1 m)",
      "CO₂ ~4,000–7,000 ppm; warm greenhouse world",
      "Cambrian Explosion — most animal body plans originated here",
    ],
    wikiPage: "Cambrian_explosion",
  },
  ma500_tropical_sea: {
    biomeLabel: "Cambrian Warm Shelf",
    settingLabel: "Tropical Marine Shelf",
    narrative: "On the tropical marine shelves of the Cambrian, diverse invertebrate communities thrived in warm, shallow waters. Trilobites, brachiopods, and early echinoderms were abundant.",
    bullets: [
      "Diverse trilobite communities",
      "Brachiopods and early echinoderms",
      "Simple trace fossils — burrows and trails on the seafloor",
      "Sea level ~100–200 m higher than today",
      "Most continental landmasses clustered near the equator",
    ],
    wikiPage: "Cambrian",
  },
  ma500_temperate_sea: {
    biomeLabel: "Cambrian Temperate Ocean",
    settingLabel: "Open Marine",
    narrative: "In the cooler temperate waters of the Cambrian, marine life was less diverse than at the equator but still included significant trilobite and brachiopod communities.",
    bullets: [
      "Cooler waters with lower diversity than tropical shelves",
      "Trilobites and brachiopods present but less abundant",
      "Atmospheric O₂ ~12–15% — barely breathable by modern standards",
      "No complex marine vertebrates yet",
    ],
    wikiPage: "Cambrian",
  },
  ma500_subpolar_sea: {
    biomeLabel: "Cambrian Cold Margin",
    settingLabel: "Sub-polar Marine",
    narrative: "The sub-polar Cambrian seas were cold and relatively barren compared to equatorial shelves. Life was sparse but included hardy trilobite and microbial communities.",
    bullets: [
      "Cold, nutrient-poor waters",
      "Sparse but specialised marine communities",
      "Microbial mats covering parts of the seafloor",
      "Very different ocean circulation from modern",
    ],
    wikiPage: "Cambrian",
  },
  ma500_polar_sea: {
    biomeLabel: "Cambrian Polar Ocean",
    settingLabel: "Polar Marine",
    narrative: "The Cambrian polar oceans were cold but ice-free — the greenhouse climate prevented polar ice cap formation. Marine life was sparse at these latitudes.",
    bullets: [
      "Cold but ice-free — no polar ice caps in the Cambrian",
      "Very sparse marine life",
      "Microbial communities on the seafloor",
      "CO₂ ~4,000–7,000 ppm maintained warm global climate",
    ],
    wikiPage: "Cambrian",
  },
};
