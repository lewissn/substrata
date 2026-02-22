// ---------------------------------------------------------------------------
// Geology Catalog — period-level geological context for Place Dossiers.
//
// Provides bedrock age, typical lithology, and interesting notes per
// geological period.  Location-specific data (BGS/USGS) is deferred;
// this catalog gives useful context at the period level.
// ---------------------------------------------------------------------------

import type { DossierGeology } from "./types";
import { periodForMa } from "@/domain/periods";
import type { TimeStopDef } from "@/domain/thisPlace";

// ── Period-keyed geology ────────────────────────────────────────────────────

const GEOLOGY_BY_STOP: Record<string, DossierGeology> = {
  now: {
    periodName: "Holocene",
    bedrockAge: "12,000 years to present",
    lithology: "Alluvium, peat, glacial drift, modern soils",
    notes: [
      "Surface deposits often overlie much older bedrock",
      "Post-glacial sediments dominate formerly glaciated regions",
      "River valleys typically show layered alluvial deposits",
    ],
  },
  y2k: {
    periodName: "Holocene (Classical)",
    bedrockAge: "12,000 years to present",
    lithology: "Alluvium, colluvium, agricultural soils",
    notes: [
      "Landscape shaped by early agriculture and deforestation",
      "Coastal areas may show Roman-era harbour deposits",
      "Building stone often quarried from local bedrock",
    ],
  },
  y5k: {
    periodName: "Holocene (Bronze Age)",
    bedrockAge: "12,000 years to present",
    lithology: "Post-glacial sediments, peat, marl",
    notes: [
      "Sea level within 1-2 m of present, coastlines stabilising",
      "Peat bogs actively forming in temperate wetlands",
      "Saharan Green Period ending — dune formation beginning",
    ],
  },
  y10k: {
    periodName: "Holocene (Early)",
    bedrockAge: "12,000 years to present",
    lithology: "Glacial till, loess, lacustrine sediments",
    notes: [
      "Post-glacial landscapes still raw in northern latitudes",
      "Massive meltwater channels carved into bedrock",
      "Sea level ~40-60 m lower — modern shelves were exposed",
      "Wind-blown loess deposits mantling many temperate landscapes",
    ],
  },
  ka20: {
    periodName: "Pleistocene (LGM)",
    bedrockAge: "2.6 million to 12,000 years",
    lithology: "Glacial till, moraines, outwash gravels, loess",
    notes: [
      "Glacial deposits up to hundreds of metres thick in ice-covered areas",
      "U-shaped valleys, drumlins, and eskers mark former ice sheet paths",
      "Permafrost extended to ~45°N in Europe",
      "Wind-deposited loess blankets much of central China, Europe, and the Americas",
    ],
  },
  ma66: {
    periodName: "Late Cretaceous",
    bedrockAge: "145-66 million years",
    lithology: "Chalk, marl, limestone, marine shales",
    notes: [
      "The Chalk — massive marine limestone deposits formed from coccolithophore shells",
      "Continental shelves widely flooded — extensive shallow-marine carbonates",
      "Iridium-rich clay layer marks the K-Pg boundary globally",
      "Dinosaur-bearing formations typically terrestrial sandstones and mudstones",
    ],
  },
  ma120: {
    periodName: "Early Cretaceous",
    bedrockAge: "145-100 million years",
    lithology: "Sandstone, mudstone, ironstone, early chalk",
    notes: [
      "Wealden-type deposits: fluvial sandstones with dinosaur tracks",
      "Atlantic rifting producing red-bed sequences along margins",
      "Extensive iron-rich sediments in many tropical settings",
    ],
  },
  ma250: {
    periodName: "Permian-Triassic boundary",
    bedrockAge: "299-252 million years",
    lithology: "Red sandstone, evaporites, desert dunes, basalt",
    notes: [
      "Siberian Traps basalts cover >2 million km\u00B2",
      "Pangaean interior: extensive desert red-bed sandstones",
      "Evaporite sequences from restricted shallow seas",
      "Boundary marked by a sharp reduction in bioturbation",
    ],
  },
  ma300: {
    periodName: "Carboniferous",
    bedrockAge: "359-299 million years",
    lithology: "Coal, limestone, sandstone, shale",
    notes: [
      "Coal Measures: cyclothems of coal, shale, sandstone, and limestone",
      "Carboniferous Limestone — massive reef limestones in tropical shelf settings",
      "Millstone Grit — deltaic sandstones from northern uplands",
      "Cyclical sedimentation reflects Gondwanan ice sheet oscillation",
    ],
  },
  ma500: {
    periodName: "Cambrian",
    bedrockAge: "539-485 million years",
    lithology: "Sandstone, shale, limestone, phosphorites",
    notes: [
      "Trilobite-bearing marine shales widespread on continental shelves",
      "Burgess Shale-type deposits preserve soft-bodied fauna",
      "Archaeocyathid reefs in tropical settings (earliest reef-builders)",
      "No terrestrial sediments with organic content — land was lifeless",
    ],
  },
};

// ── Public API ──────────────────────────────────────────────────────────────

/** Look up geological context for a time stop. */
export function getGeologyForStop(stop: TimeStopDef): DossierGeology {
  const entry = GEOLOGY_BY_STOP[stop.key];
  if (entry) return entry;

  // Fallback: derive from Ma using the periods catalog
  if (stop.ma != null && stop.ma > 0) {
    const period = periodForMa(stop.ma);
    if (period) {
      return {
        periodName: period.name,
        bedrockAge: `${period.maStart}-${period.maEnd} Ma`,
        lithology: undefined,
        notes: [period.summary],
      };
    }
  }

  return {
    periodName: stop.fullLabel,
    notes: [],
  };
}
