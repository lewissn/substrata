// ---------------------------------------------------------------------------
// Last Glacial Maximum (LGM) data — ~21 ka
// Simplified ice sheet extent polygons for map overlay.
// Based on CLIMAP / ICE-6G reconstructions, simplified for rendering.
// ---------------------------------------------------------------------------

export type IceSheet = {
  name: string;
  description: string;
  // Simplified polygon coordinates [lng, lat][]
  coordinates: [number, number][][];
};

// Laurentide Ice Sheet (North America) — simplified outline
const LAURENTIDE: IceSheet = {
  name: "Laurentide",
  description: "Covered most of Canada and northern US, up to 3 km thick",
  coordinates: [[
    [-130, 48], [-125, 52], [-125, 58], [-130, 62], [-140, 65],
    [-145, 68], [-155, 70], [-165, 72], [-170, 68],
    [-168, 64], [-162, 60], [-155, 57], [-140, 55],
    [-130, 55], [-120, 60], [-110, 62], [-100, 64],
    [-90, 66], [-80, 70], [-70, 72], [-60, 73],
    [-50, 72], [-45, 70], [-50, 65], [-55, 58],
    [-60, 50], [-65, 45], [-70, 42], [-75, 40],
    [-80, 40], [-85, 42], [-90, 44], [-95, 46],
    [-100, 48], [-110, 48], [-120, 48], [-130, 48],
  ]],
};

// Cordilleran Ice Sheet (Pacific NW) — merged with Laurentide at LGM
const CORDILLERAN: IceSheet = {
  name: "Cordilleran",
  description: "Mountain ice sheet along the Pacific coast",
  coordinates: [[
    [-140, 55], [-135, 60], [-145, 62], [-150, 63],
    [-155, 60], [-150, 57], [-145, 55], [-140, 55],
  ]],
};

// Fennoscandian Ice Sheet (Northern Europe)
const FENNOSCANDIAN: IceSheet = {
  name: "Fennoscandian",
  description: "Covered Scandinavia, Baltic, northern Britain and parts of northern Europe",
  coordinates: [[
    [-10, 52], [-5, 55], [-5, 58], [-8, 60],
    [-5, 62], [5, 64], [10, 68], [15, 70],
    [20, 72], [30, 72], [40, 70], [50, 68],
    [55, 65], [55, 60], [50, 58], [45, 55],
    [40, 55], [35, 56], [30, 58], [25, 58],
    [20, 56], [15, 55], [10, 52], [5, 51],
    [0, 51], [-5, 52], [-10, 52],
  ]],
};

// British-Irish Ice Sheet
const BRITISH_IRISH: IceSheet = {
  name: "British-Irish",
  description: "Covered Scotland, Ireland, Wales, and northern England",
  coordinates: [[
    [-12, 51], [-10, 54], [-11, 56], [-10, 58],
    [-7, 59], [-4, 59], [-1, 58], [2, 56],
    [2, 53], [0, 52], [-3, 51], [-6, 51],
    [-9, 51], [-12, 51],
  ]],
};

// Greenland Ice Sheet (larger at LGM)
const GREENLAND_LGM: IceSheet = {
  name: "Greenland",
  description: "Extended beyond present margins onto exposed continental shelf",
  coordinates: [[
    [-55, 60], [-50, 65], [-45, 70], [-35, 75],
    [-20, 80], [-15, 82], [-25, 83], [-40, 82],
    [-55, 78], [-60, 72], [-55, 68], [-55, 60],
  ]],
};

// Barents-Kara Ice Sheet
const BARENTS_KARA: IceSheet = {
  name: "Barents-Kara",
  description: "Marine-based ice sheet over the Barents and Kara seas",
  coordinates: [[
    [20, 72], [30, 75], [40, 78], [50, 80],
    [60, 80], [70, 78], [80, 75], [75, 72],
    [65, 70], [55, 69], [45, 70], [35, 71],
    [25, 72], [20, 72],
  ]],
};

// Patagonian Ice Sheet
const PATAGONIAN: IceSheet = {
  name: "Patagonian",
  description: "Covered the southern Andes, extending to sea level",
  coordinates: [[
    [-76, -40], [-74, -42], [-73, -46], [-74, -50],
    [-73, -54], [-70, -55], [-68, -54], [-69, -50],
    [-70, -46], [-71, -42], [-73, -40], [-76, -40],
  ]],
};

export const LGM_ICE_SHEETS: IceSheet[] = [
  LAURENTIDE,
  CORDILLERAN,
  FENNOSCANDIAN,
  BRITISH_IRISH,
  GREENLAND_LGM,
  BARENTS_KARA,
  PATAGONIAN,
];

/** Convert ice sheets to a GeoJSON FeatureCollection */
export function lgmIceGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: LGM_ICE_SHEETS.map((sheet) => ({
      type: "Feature" as const,
      properties: {
        name: sheet.name,
        description: sheet.description,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: sheet.coordinates,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// LGM sea level: ~120m lower than present
// Approximate exposed land areas (major land bridges / shelf exposure)
// ---------------------------------------------------------------------------

export type ExposedLand = {
  name: string;
  description: string;
  coordinates: [number, number][][];
};

const BERINGIA: ExposedLand = {
  name: "Beringia",
  description: "Land bridge connecting Asia and North America",
  coordinates: [[
    [-170, 64], [-168, 66], [-170, 68], [-175, 69],
    [180, 68], [175, 66], [170, 64], [168, 62],
    [170, 60], [175, 58], [180, 60], [-175, 62],
    [-170, 64],
  ]],
};

const DOGGERLAND: ExposedLand = {
  name: "Doggerland",
  description: "Connected Britain to continental Europe across the North Sea",
  coordinates: [[
    [-2, 51], [0, 52], [3, 53], [6, 54],
    [8, 55], [8, 57], [5, 57], [2, 56],
    [0, 55], [-2, 53], [-2, 51],
  ]],
};

const SUNDALAND: ExposedLand = {
  name: "Sundaland",
  description: "Connected mainland SE Asia to Borneo, Java, and Sumatra",
  coordinates: [[
    [100, 5], [105, 7], [110, 5], [115, 2],
    [117, 0], [115, -3], [112, -5], [110, -8],
    [107, -7], [105, -5], [103, -3], [100, -1],
    [98, 1], [100, 5],
  ]],
};

const SAHUL: ExposedLand = {
  name: "Sahul",
  description: "Connected Australia to New Guinea",
  coordinates: [[
    [130, -5], [135, -5], [140, -7], [145, -8],
    [145, -10], [140, -10], [135, -12], [130, -12],
    [128, -10], [130, -5],
  ]],
};

export const LGM_EXPOSED_LAND: ExposedLand[] = [
  BERINGIA,
  DOGGERLAND,
  SUNDALAND,
  SAHUL,
];

/** Convert exposed land areas to a GeoJSON FeatureCollection */
export function lgmExposedLandGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: LGM_EXPOSED_LAND.map((land) => ({
      type: "Feature" as const,
      properties: {
        name: land.name,
        description: land.description,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: land.coordinates,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Sea level at a given Ma (simplified curve)
// ---------------------------------------------------------------------------

/** Approximate global mean sea level relative to present (in metres). */
export function seaLevelAtMa(ma: number): number {
  if (ma <= 0) return 0;
  if (ma < 0.012) return -3; // Holocene: near present
  if (ma < 0.03) return -120; // LGM
  if (ma < 0.13) return -60; // Late Pleistocene avg
  if (ma < 2.6) return -40; // Pleistocene avg
  if (ma < 5.3) return 20; // Pliocene
  if (ma < 23) return 30; // Miocene
  if (ma < 34) return 50; // Oligocene
  if (ma < 56) return 80; // Eocene
  if (ma < 66) return 70; // Paleocene
  if (ma < 145) return 170; // Cretaceous (very high)
  if (ma < 201) return 80; // Jurassic
  if (ma < 252) return 10; // Triassic
  if (ma < 299) return -20; // Permian (dropping)
  if (ma < 359) return 40; // Carboniferous
  if (ma < 419) return 80; // Devonian
  if (ma < 444) return 100; // Silurian
  if (ma < 485) return 150; // Ordovician
  if (ma < 539) return 50; // Cambrian
  return 20; // Ediacaran
}

/** Format sea level for display. */
export function formatSeaLevel(metres: number): string {
  if (metres === 0) return "At present level";
  if (metres > 0) return `+${metres}m above present`;
  return `${metres}m below present`;
}

// ---------------------------------------------------------------------------
// Sea Level Exposed Shelf — approximate areas visible at -120m sea level
// Includes all LGM exposed land bridges plus additional shelf regions.
// Used by the sea level overlay to show exposed continental shelf.
// ---------------------------------------------------------------------------

const SEA_LEVEL_SHELF_AREAS: ExposedLand[] = [
  // LGM exposed land bridges (already defined above)
  BERINGIA,
  DOGGERLAND,
  SUNDALAND,
  SAHUL,

  // Additional shallow shelf areas
  {
    name: "Persian Gulf",
    description: "Drained at -120m, exposing the Gulf floor",
    coordinates: [[
      [48.0, 24.0], [50.0, 23.5], [53.0, 23.5], [55.0, 24.0],
      [57.0, 25.0], [57.5, 26.5], [57.0, 28.0], [55.0, 29.0],
      [52.0, 29.5], [50.0, 29.0], [48.5, 28.0], [48.0, 26.5],
      [48.0, 24.0],
    ]],
  },
  {
    name: "Yellow Sea & East China Sea",
    description: "Large shallow shelf exposed at -120m",
    coordinates: [[
      [119.0, 29.0], [120.0, 28.0], [122.0, 27.0], [124.0, 26.0],
      [126.0, 26.5], [128.0, 28.0], [129.0, 31.0], [128.0, 34.0],
      [126.0, 36.0], [124.0, 38.0], [122.0, 38.5], [120.0, 37.0],
      [118.0, 35.0], [118.5, 32.0], [119.0, 29.0],
    ]],
  },
  {
    name: "Arafura Shelf",
    description: "Shallow sea between Australia and Timor, exposed at -120m",
    coordinates: [[
      [128.0, -6.0], [131.0, -5.0], [134.0, -5.5], [136.0, -6.5],
      [138.0, -8.0], [136.0, -10.0], [133.0, -11.0], [130.0, -11.0],
      [128.0, -9.5], [127.0, -8.0], [128.0, -6.0],
    ]],
  },
  {
    name: "Celtic Sea Shelf",
    description: "Extended shelf west of Britain exposed at -120m",
    coordinates: [[
      [-10.0, 48.0], [-8.0, 47.5], [-5.0, 47.0], [-3.0, 48.0],
      [-5.0, 49.5], [-8.0, 50.5], [-11.0, 51.0], [-12.0, 50.0],
      [-11.0, 48.5], [-10.0, 48.0],
    ]],
  },
  {
    name: "Grand Banks",
    description: "Shallow banks east of Newfoundland exposed at -120m",
    coordinates: [[
      [-53.0, 43.0], [-50.0, 42.5], [-47.0, 43.0], [-46.0, 44.5],
      [-47.0, 46.0], [-50.0, 47.0], [-53.0, 46.5], [-54.5, 45.0],
      [-53.0, 43.0],
    ]],
  },
];

/** GeoJSON of continental shelf areas exposed at deep negative sea levels.
 *  Used by the sea level overlay to visualise exposed shelf. Data represents
 *  approximate -120m exposure; opacity scales with actual sea level value. */
export function seaLevelExposedShelfGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: SEA_LEVEL_SHELF_AREAS.map((area) => ({
      type: "Feature" as const,
      properties: {
        name: area.name,
        description: area.description,
      },
      geometry: {
        type: "Polygon" as const,
        coordinates: area.coordinates,
      },
    })),
  };
}
