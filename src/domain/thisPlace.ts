// ---------------------------------------------------------------------------
// This Place — canonical place type and curated time stop catalog
// ---------------------------------------------------------------------------

import type { PlaceCard } from "./placeCard";

/** A place that can be a selected marker or a dropped pin. */
export type ActivePlace = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  source: "osm" | "wiki" | "pbdb" | "custom";
  /** Wikipedia URL if available, for supplementary context */
  wikipedia?: string;
};

/** One curated time stop with static narrative content. */
export type TimeStopDef = {
  key: string;
  /** Short chip label: "66 Ma" */
  label: string;
  /** Full heading: "66 million years ago — End of the Cretaceous" */
  fullLabel: string;
  kind: "recent" | "deep";
  /** For recent stops: years ago (0 = now) */
  yearsAgo?: number;
  /** For deep time stops: millions of years ago */
  ma?: number;
  /** Wikipedia article for thumbnail fetch */
  wikiPage?: string;
  /** 1–2 sentence narrative. Use calm, hedged language. */
  narrative: string;
  /** 4–6 bullet facts */
  bullets: string[];
};

// ---------------------------------------------------------------------------
// Curated time stop catalog
// ---------------------------------------------------------------------------

export const TIME_STOPS: TimeStopDef[] = [
  {
    key: "now",
    label: "Now",
    fullLabel: "Present day",
    kind: "recent",
    yearsAgo: 0,
    narrative:
      "The world as it exists today — shaped by billions of years of geological and biological history. The landscape here likely bears the marks of both deep time and recent human activity.",
    bullets: [
      "Average global temperature ~15°C",
      "Atmospheric CO₂ at highest levels in 3 million years (~420 ppm)",
      "Sea level rising ~3.7 mm per year",
      "~8 billion people, ~8 million species",
    ],
  },
  {
    key: "y2k",
    label: "2,000 yrs",
    fullLabel: "2,000 years ago — Classical Antiquity",
    kind: "recent",
    yearsAgo: 2000,
    wikiPage: "Classical_antiquity",
    narrative:
      "In many regions this was the height of classical civilisation — Roman legions, Han emperors, or early Andean states, depending on where you are standing. The physical landscape would have looked very similar to today.",
    bullets: [
      "Sea level within ~1 m of present",
      "Climate very similar to today",
      "Roman Empire at near-peak extent in the west",
      "Han dynasty (~60 million people) dominating East Asia",
      "Writing, coinage, and urban life well established worldwide",
    ],
  },
  {
    key: "y5k",
    label: "5,000 yrs",
    fullLabel: "5,000 years ago — Bronze Age",
    kind: "recent",
    yearsAgo: 5000,
    wikiPage: "Bronze_Age",
    narrative:
      "The Bronze Age was beginning across the Old World. The first cities rose in Mesopotamia and the Nile Valley. In most regions, human impact on the landscape was lighter than today, with much more forest cover.",
    bullets: [
      "Sea level 0–2 m lower than present",
      "Holocene Climatic Optimum — slightly warmer in northern latitudes",
      "Sumerian cities emerging in Mesopotamia",
      "Egyptian Old Kingdom — pyramids being built",
      "Most of Europe and North America still heavily forested",
    ],
  },
  {
    key: "y10k",
    label: "10,000 yrs",
    fullLabel: "10,000 years ago — Neolithic transition",
    kind: "recent",
    yearsAgo: 10000,
    wikiPage: "Neolithic",
    narrative:
      "The great ice sheets were retreating and sea levels rising rapidly. Agriculture was just beginning in the Fertile Crescent. Across most of the world, small hunter-gatherer bands followed seasonal routes across landscapes very different from today.",
    bullets: [
      "Sea level ~40–60 m lower — large coastal areas were dry land",
      "Post-glacial warming underway at roughly 1°C per century",
      "First domesticated crops (wheat, barley) in the Levant",
      "Global human population ~5–10 million",
      "Forests rapidly expanding northward as tundra retreated",
    ],
  },
  {
    key: "ka20",
    label: "20,000 yrs",
    fullLabel: "20,000 years ago — Last Glacial Maximum",
    kind: "recent",
    yearsAgo: 20000,
    wikiPage: "Last_Glacial_Maximum",
    narrative:
      "The Last Glacial Maximum — the coldest point of the most recent ice age. Vast ice sheets up to 3 km thick covered North America and northern Europe. Sea levels were approximately 120 m lower, and the world's geography was strikingly different from today.",
    bullets: [
      "Sea level ~120 m lower than today",
      "Global average temperature ~6°C colder than present",
      "Doggerland connected Britain to continental Europe",
      "Beringia connected Asia to North America",
      "Mammoths, cave lions, woolly rhinoceros, and giant sloths were widespread",
      "Sahara was a hyper-arid desert; Amazon may have contracted",
    ],
  },
  {
    key: "ma66",
    label: "66 Ma",
    fullLabel: "66 million years ago — End of the Cretaceous",
    kind: "deep",
    ma: 66,
    wikiPage: "Cretaceous–Paleogene_extinction_event",
    narrative:
      "A 10 km asteroid struck the Yucatán Peninsula, triggering global fires, a nuclear-winter-like impact winter, and the collapse of food chains worldwide. This ended the reign of non-avian dinosaurs. At this location, you were likely in a warm, shallow sea or a humid subtropical landscape.",
    bullets: [
      "75% of all species went extinct in geologically rapid succession",
      "CO₂ likely 600–2000 ppm; global temperature ~4°C warmer than today",
      "Sea level ~100–200 m higher than today — vast continental seas",
      "No polar ice caps; tropical forests extended to high latitudes",
      "Flowering plants recently diversified alongside insects",
      "Survivors included birds, crocodilians, turtles, small mammals",
    ],
  },
  {
    key: "ma120",
    label: "120 Ma",
    fullLabel: "120 million years ago — Early Cretaceous",
    kind: "deep",
    ma: 120,
    wikiPage: "Early_Cretaceous",
    narrative:
      "The continents were drifting apart — the Atlantic was a young, narrow seaway. Flowering plants were just beginning to appear alongside the conifers and ferns that dominated the landscape. Sauropod dinosaurs likely roamed vast floodplains near this location.",
    bullets: [
      "CO₂ ~1,000–2,000 ppm",
      "Sea level ~150–250 m higher than today",
      "Global mean temperature ~8–10°C warmer than present",
      "No polar ice caps; crocodilians at high latitudes",
      "Sauropods, theropods, and pterosaurs dominant",
      "Atlantic Ocean was a narrow, warm seaway",
    ],
  },
  {
    key: "ma250",
    label: "250 Ma",
    fullLabel: "250 million years ago — End-Permian extinction",
    kind: "deep",
    ma: 250,
    wikiPage: "Permian–Triassic_extinction_event",
    narrative:
      "The Great Dying — the worst mass extinction in Earth's history. Siberian flood basalts erupted for hundreds of thousands of years, releasing CO₂ and methane that acidified the oceans and raised global temperatures catastrophically. This location was part of the supercontinent Pangaea.",
    bullets: [
      "96% of marine species and ~70% of land species went extinct",
      "Supercontinent Pangaea was fully assembled",
      "CO₂ may have spiked to ~3,000 ppm",
      "Global temperature +8–10°C above today",
      "Oceans became anoxic and acidic",
      "Recovery took ~10 million years",
    ],
  },
  {
    key: "ma300",
    label: "300 Ma",
    fullLabel: "300 million years ago — Carboniferous",
    kind: "deep",
    ma: 300,
    wikiPage: "Carboniferous",
    narrative:
      "Vast tropical coal swamps covered much of the northern tropics — the forests we now mine as coal. Atmospheric oxygen reached ~35%, its highest level in Earth's history, enabling giant insects. If this location was in the tropics, it was likely a dense swampy forest.",
    bullets: [
      "Atmospheric O₂ ~35% — giant insects could evolve",
      "Dragonflies with 70 cm wingspan (Meganeura)",
      "CO₂ ~350–800 ppm — similar to today's range",
      "Glaciation advancing in southern Gondwana",
      "First amniote eggs — vertebrates freed from water",
      "The coal beds we mine today formed from these forests",
    ],
  },
  {
    key: "ma500",
    label: "~500 Ma",
    fullLabel: "~500 million years ago — Cambrian",
    kind: "deep",
    ma: 500,
    wikiPage: "Cambrian_explosion",
    narrative:
      "Life had only recently exploded into multicellular complexity. Almost all animal body plans that exist today originated in the Cambrian Explosion. The land at this location — if it was land at all — was bare rock and sediment, completely devoid of plants or animals.",
    bullets: [
      "No life on land — bare rock, sand, and early microbial mats",
      "Trilobites dominated warm shallow seas",
      "Atmospheric O₂ ~12–15% (barely breathable for modern animals)",
      "CO₂ ~4,000–7,000 ppm",
      "Sea level ~100–200 m higher than today",
      "Most continental landmasses clustered near the equator",
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create an ActivePlace from a PlaceCard (existing marker/result). */
export function activePlaceFromCard(card: PlaceCard): ActivePlace {
  return {
    id: card.id,
    title: card.title,
    lat: card.coords.lat,
    lng: card.coords.lng,
    source: card.source as ActivePlace["source"],
    wikipedia: card.url?.includes("wikipedia") ? card.url : undefined,
  };
}

/** Create an ActivePlace for a manually dropped pin. */
export function customPin(lat: number, lng: number): ActivePlace {
  return {
    id: `pin-${lat.toFixed(5)}-${lng.toFixed(5)}`,
    title: "Pinned Location",
    lat,
    lng,
    source: "custom",
  };
}

/** Format coordinates as a compact string. */
export function formatCoords(lat: number, lng: number): string {
  const latStr = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}°${lng >= 0 ? "E" : "W"}`;
  return `${latStr}, ${lngStr}`;
}
