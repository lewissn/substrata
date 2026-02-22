// ---------------------------------------------------------------------------
// Archive topic catalog — metadata only. Articles are built by scripts/build-archive.
// Lewis curates topics; the builder generates text and images from Wikipedia/Wikidata/Commons.
// ---------------------------------------------------------------------------

export type ArchiveTopicKind =
  | "period"
  | "event"
  | "extinction"
  | "civilisation"
  | "impact"
  | "ice_age"
  | "tectonics"
  | "life";

export type ArchiveTopic = {
  id: string;
  title: string;
  kind: ArchiveTopicKind;
  time?: {
    label?: string;
    maStart?: number;
    maEnd?: number;
    yearsAgo?: number;
  };
  geo?: { lat: number; lng: number; zoom?: number };
  keywords?: string[];
  wikiTitle?: string;
  wikidataId?: string;
};

// ---------------------------------------------------------------------------
// Catalog: 80+ topics — periods, extinctions, supercontinents, impacts, ice ages, civilisations, sites
// ---------------------------------------------------------------------------

export const ARCHIVE_CATALOG: ArchiveTopic[] = [
  // ── Big 5 extinctions & major events ──
  { id: "great-oxidation-event", title: "Great Oxidation Event", kind: "event", time: { label: "~2.4 Ga", maStart: 2400 }, keywords: ["stromatolite", "cyanobacteria", "oxygen"], wikiTitle: "Great Oxidation Event", wikidataId: "Q184211", geo: { lat: -25.9, lng: 113.8 } },
  { id: "snowball-earth", title: "Snowball Earth", kind: "ice_age", time: { label: "720–635 Ma", maStart: 720, maEnd: 635 }, keywords: ["snowball earth", "cryogenian", "glaciation"], wikiTitle: "Snowball Earth", wikidataId: "Q185538" },
  { id: "ediacaran-biota", title: "Ediacaran Biota", kind: "life", time: { label: "635–541 Ma", maStart: 635, maEnd: 541 }, keywords: ["Ediacaran", "Dickinsonia", "precambrian"], wikiTitle: "Ediacaran biota", wikidataId: "Q130272", geo: { lat: -31.1, lng: 138.4 } },
  { id: "cambrian-explosion", title: "Cambrian Explosion", kind: "life", time: { label: "~541 Ma", maStart: 541 }, keywords: ["Cambrian explosion", "Burgess Shale", "fossil"], wikiTitle: "Cambrian explosion", wikidataId: "Q185545", geo: { lat: 51.44, lng: -116.48 } },
  { id: "ordovician-extinction", title: "Ordovician–Silurian Extinction", kind: "extinction", time: { label: "~443 Ma", maStart: 443 }, keywords: ["Ordovician", "extinction", "glaciation"], wikiTitle: "Ordovician–Silurian extinction event", wikidataId: "Q1131717" },
  { id: "late-devonian-extinction", title: "Late Devonian Extinction", kind: "extinction", time: { label: "~372 Ma", maStart: 372 }, keywords: ["Devonian", "extinction", "Kellwasser"], wikiTitle: "Late Devonian extinction", wikidataId: "Q1131724" },
  { id: "end-permian", title: "End-Permian Extinction", kind: "extinction", time: { label: "252 Ma", maStart: 252 }, keywords: ["Permian", "Siberian Traps", "extinction"], wikiTitle: "Permian–Triassic extinction event", wikidataId: "Q185538", geo: { lat: 61, lng: 100 } },
  { id: "end-triassic", title: "End-Triassic Extinction", kind: "extinction", time: { label: "201 Ma", maStart: 201 }, keywords: ["Triassic", "extinction", "CAMP"], wikiTitle: "Triassic–Jurassic extinction event", wikidataId: "Q1131732" },
  { id: "chicxulub", title: "Chicxulub Impact", kind: "impact", time: { label: "66 Ma", maStart: 66 }, keywords: ["Chicxulub", "asteroid", "dinosaur extinction"], wikiTitle: "Chicxulub crater", wikidataId: "Q185538", geo: { lat: 21.4, lng: -89.5 } },

  // ── Geological periods (Phanerozoic) ──
  { id: "cambrian-period", title: "Cambrian Period", kind: "period", time: { label: "541–485 Ma", maStart: 541, maEnd: 485 }, wikiTitle: "Cambrian", wikidataId: "Q12143" },
  { id: "ordovician-period", title: "Ordovician Period", kind: "period", time: { label: "485–444 Ma", maStart: 485, maEnd: 444 }, wikiTitle: "Ordovician", wikidataId: "Q12136" },
  { id: "silurian-period", title: "Silurian Period", kind: "period", time: { label: "444–419 Ma", maStart: 444, maEnd: 419 }, wikiTitle: "Silurian", wikidataId: "Q12130" },
  { id: "devonian-period", title: "Devonian Period", kind: "period", time: { label: "419–359 Ma", maStart: 419, maEnd: 359 }, wikiTitle: "Devonian", wikidataId: "Q12125" },
  { id: "carboniferous-period", title: "Carboniferous Period", kind: "period", time: { label: "359–299 Ma", maStart: 359, maEnd: 299 }, wikiTitle: "Carboniferous", wikidataId: "Q12118", keywords: ["coal swamp", "Carboniferous"] },
  { id: "permian-period", title: "Permian Period", kind: "period", time: { label: "299–252 Ma", maStart: 299, maEnd: 252 }, wikiTitle: "Permian", wikidataId: "Q12111" },
  { id: "triassic-period", title: "Triassic Period", kind: "period", time: { label: "252–201 Ma", maStart: 252, maEnd: 201 }, wikiTitle: "Triassic", wikidataId: "Q12104" },
  { id: "jurassic-period", title: "Jurassic Period", kind: "period", time: { label: "201–145 Ma", maStart: 201, maEnd: 145 }, wikiTitle: "Jurassic", wikidataId: "Q12097" },
  { id: "cretaceous-period", title: "Cretaceous Period", kind: "period", time: { label: "145–66 Ma", maStart: 145, maEnd: 66 }, wikiTitle: "Cretaceous", wikidataId: "Q12090" },
  { id: "paleogene-period", title: "Paleogene Period", kind: "period", time: { label: "66–23 Ma", maStart: 66, maEnd: 23 }, wikiTitle: "Paleogene", wikidataId: "Q12083" },
  { id: "neogene-period", title: "Neogene Period", kind: "period", time: { label: "23–2.6 Ma", maStart: 23, maEnd: 2.6 }, wikiTitle: "Neogene", wikidataId: "Q12076" },
  { id: "quaternary-period", title: "Quaternary Period", kind: "period", time: { label: "2.6 Ma – present", maStart: 2.6 }, wikiTitle: "Quaternary", wikidataId: "Q12069" },

  // ── Precambrian / deep time ──
  { id: "hadean", title: "Hadean Eon", kind: "period", time: { label: "4.6–4 Ga", maStart: 4600, maEnd: 4000 }, wikiTitle: "Hadean", wikidataId: "Q12150" },
  { id: "archean", title: "Archean Eon", kind: "period", time: { label: "4–2.5 Ga", maStart: 4000, maEnd: 2500 }, wikiTitle: "Archean", wikidataId: "Q12157" },
  { id: "proterozoic", title: "Proterozoic Eon", kind: "period", time: { label: "2.5 Ga – 541 Ma", maStart: 2500, maEnd: 541 }, wikiTitle: "Proterozoic", wikidataId: "Q12164" },
  { id: "cryogenian", title: "Cryogenian Period", kind: "period", time: { label: "720–635 Ma", maStart: 720, maEnd: 635 }, wikiTitle: "Cryogenian", wikidataId: "Q12171" },
  { id: "ediacaran-period", title: "Ediacaran Period", kind: "period", time: { label: "635–541 Ma", maStart: 635, maEnd: 541 }, wikiTitle: "Ediacaran", wikidataId: "Q12178" },

  // ── Supercontinents & tectonics ──
  { id: "pangaea", title: "Pangaea", kind: "tectonics", time: { label: "335–175 Ma", maStart: 335, maEnd: 175 }, keywords: ["Pangaea", "supercontinent"], wikiTitle: "Pangaea", wikidataId: "Q131276" },
  { id: "gondwana", title: "Gondwana", kind: "tectonics", time: { label: "~600–30 Ma", maStart: 600, maEnd: 30 }, keywords: ["Gondwana", "supercontinent"], wikiTitle: "Gondwana", wikidataId: "Q131285" },
  { id: "laurasia", title: "Laurasia", kind: "tectonics", time: { label: "~335–60 Ma", maStart: 335, maEnd: 60 }, wikiTitle: "Laurasia", wikidataId: "Q131290" },
  { id: "rodinia", title: "Rodinia", kind: "tectonics", time: { label: "~1.1–0.75 Ga", maStart: 1100, maEnd: 750 }, keywords: ["Rodinia", "supercontinent"], wikiTitle: "Rodinia", wikidataId: "Q131295" },
  { id: "columbia-supercontinent", title: "Columbia (Nuna)", kind: "tectonics", time: { label: "~1.8–1.5 Ga", maStart: 1800, maEnd: 1500 }, wikiTitle: "Columbia (supercontinent)", wikidataId: "Q1129842" },
  { id: "himalayas-formation", title: "Formation of the Himalayas", kind: "tectonics", time: { label: "~50 Ma – present", maStart: 50 }, keywords: ["Himalayas", "India", "collision"], wikiTitle: "Geology of the Himalaya", wikidataId: "Q161606", geo: { lat: 27.9, lng: 86.9 } },
  { id: "atlantic-opening", title: "Opening of the Atlantic", kind: "tectonics", time: { label: "~200–0 Ma", maStart: 200 }, keywords: ["Atlantic Ocean", "rift", "Pangaea"], wikiTitle: "Opening of the North Atlantic Ocean", wikidataId: "Q4815190" },
  { id: "drake-passage", title: "Opening of Drake Passage", kind: "tectonics", time: { label: "~30–20 Ma", maStart: 30, maEnd: 20 }, keywords: ["Drake Passage", "Antarctica"], wikiTitle: "Drake Passage", wikidataId: "Q185538", geo: { lat: -57, lng: -64 } },

  // ── Ice ages & climate ──
  { id: "lgm", title: "Last Glacial Maximum", kind: "ice_age", time: { yearsAgo: 21000, label: "21 ka" }, keywords: ["ice age", "glaciation", "LGM"], wikiTitle: "Last Glacial Maximum", wikidataId: "Q185538", geo: { lat: 54, lng: 3 } },
  { id: "beringia", title: "Beringia", kind: "ice_age", time: { yearsAgo: 20000, label: "20 ka" }, keywords: ["Beringia", "land bridge", "migration"], wikiTitle: "Beringia", wikidataId: "Q185538", geo: { lat: 65.5, lng: -168 } },
  { id: "doggerland", title: "Doggerland", kind: "ice_age", time: { yearsAgo: 8000, label: "8 ka" }, keywords: ["Doggerland", "North Sea", "Mesolithic"], wikiTitle: "Doggerland", wikidataId: "Q185538", geo: { lat: 54, lng: 3 } },
  { id: "younger-dryas", title: "Younger Dryas", kind: "ice_age", time: { yearsAgo: 12900, label: "12.9 ka" }, keywords: ["Younger Dryas", "cold snap", "climate"], wikiTitle: "Younger Dryas", wikidataId: "Q185538" },
  { id: "karoo-ice-age", title: "Karoo Ice Age", kind: "ice_age", time: { label: "360–260 Ma", maStart: 360, maEnd: 260 }, wikiTitle: "Karoo Ice Age", wikidataId: "Q185538" },

  // ── Impacts & volcanism ──
  { id: "vredefort-impact", title: "Vredefort Impact", kind: "impact", time: { label: "2.02 Ga", maStart: 2023 }, keywords: ["Vredefort", "impact crater"], wikiTitle: "Vredefort impact structure", wikidataId: "Q185538", geo: { lat: -27, lng: 27.5 } },
  { id: "sudbury-basin", title: "Sudbury Basin", kind: "impact", time: { label: "1.85 Ga", maStart: 1850 }, wikiTitle: "Sudbury Basin", wikidataId: "Q185538", geo: { lat: 46.6, lng: -81.2 } },
  { id: "siberian-traps", title: "Siberian Traps", kind: "event", time: { label: "252 Ma", maStart: 252 }, keywords: ["Siberian Traps", "volcanism", "Permian"], wikiTitle: "Siberian Traps", wikidataId: "Q185538", geo: { lat: 61, lng: 100 } },
  { id: "deccan-traps", title: "Deccan Traps", kind: "event", time: { label: "66 Ma", maStart: 66 }, keywords: ["Deccan Traps", "volcanism", "Cretaceous"], wikiTitle: "Deccan Traps", wikidataId: "Q185538", geo: { lat: 18, lng: 74 } },
  { id: "toba-eruption", title: "Toba Supereruption", kind: "event", time: { yearsAgo: 74000, label: "74 ka" }, keywords: ["Toba", "supervolcano", "Sumatra"], wikiTitle: "Toba catastrophe theory", wikidataId: "Q185538", geo: { lat: 2.58, lng: 98.83 } },
  { id: "santorini-eruption", title: "Minoan Eruption (Santorini)", kind: "event", time: { yearsAgo: 3600, label: "~1600 BCE" }, keywords: ["Santorini", "Thera", "Minoan"], wikiTitle: "Minoan eruption", wikidataId: "Q185538", geo: { lat: 36.4, lng: 25.4 } },
  { id: "vesuvius-79", title: "Eruption of Vesuvius (79 CE)", kind: "event", time: { yearsAgo: 1945, label: "79 CE" }, keywords: ["Pompeii", "Vesuvius", "Roman"], wikiTitle: "Eruption of Mount Vesuvius in AD 79", wikidataId: "Q185538", geo: { lat: 40.75, lng: 14.49 } },
  { id: "tambora-1815", title: "Tambora Eruption (1815)", kind: "event", time: { yearsAgo: 209, label: "1815" }, keywords: ["Tambora", "Year Without a Summer"], wikiTitle: "1815 eruption of Mount Tambora", wikidataId: "Q185538", geo: { lat: -8.25, lng: 118 } },
  { id: "krakatoa-1883", title: "Krakatoa (1883)", kind: "event", time: { yearsAgo: 141, label: "1883" }, keywords: ["Krakatoa", "eruption"], wikiTitle: "1883 eruption of Krakatoa", wikidataId: "Q185538", geo: { lat: -6.1, lng: 105.42 } },

  // ── Life & evolution ──
  { id: "first-forests", title: "First Forests", kind: "life", time: { label: "~385 Ma", maStart: 385 }, keywords: ["Devonian", "forest", "Archaeopteris"], wikiTitle: "Evolution of plants", wikidataId: "Q185538", geo: { lat: 42.4, lng: -74.5 } },
  { id: "carboniferous-swamps", title: "Carboniferous Coal Swamps", kind: "life", time: { label: "359–299 Ma", maStart: 359, maEnd: 299 }, keywords: ["Carboniferous", "coal", "Meganeura"], wikiTitle: "Carboniferous", wikidataId: "Q12118" },
  { id: "first-dinosaurs", title: "First Dinosaurs", kind: "life", time: { label: "~230 Ma", maStart: 230 }, keywords: ["dinosaur", "Triassic", "origin"], wikiTitle: "Evolution of dinosaurs", wikidataId: "Q185538" },
  { id: "jurassic-dinosaurs", title: "Jurassic Dinosaurs", kind: "life", time: { label: "201–145 Ma", maStart: 201, maEnd: 145 }, keywords: ["Jurassic", "dinosaur", "sauropod"], wikiTitle: "Jurassic", wikidataId: "Q12097" },
  { id: "cretaceous-dinosaurs", title: "Cretaceous Dinosaurs", kind: "life", time: { label: "145–66 Ma", maStart: 145, maEnd: 66 }, keywords: ["Cretaceous", "Tyrannosaurus", "dinosaur"], wikiTitle: "Cretaceous", wikidataId: "Q12090" },
  { id: "first-mammals", title: "Rise of Mammals", kind: "life", time: { label: "66 Ma – present", maStart: 66 }, keywords: ["mammal", "Cenozoic", "evolution"], wikiTitle: "Evolution of mammals", wikidataId: "Q185538" },
  { id: "first-hominins", title: "Early Hominins", kind: "life", time: { yearsAgo: 6000000, label: "~6 Ma" }, keywords: ["hominin", "human evolution", "Africa"], wikiTitle: "Human evolution", wikidataId: "Q185538" },

  // ── Famous fossil sites ──
  { id: "burgess-shale", title: "Burgess Shale", kind: "life", time: { label: "508 Ma", maStart: 508 }, keywords: ["Burgess Shale", "Cambrian", "fossil"], wikiTitle: "Burgess Shale", wikidataId: "Q185538", geo: { lat: 51.44, lng: -116.48 } },
  { id: "hell-creek", title: "Hell Creek Formation", kind: "life", time: { label: "66–68 Ma", maStart: 68, maEnd: 66 }, keywords: ["Hell Creek", "T. rex", "Cretaceous"], wikiTitle: "Hell Creek Formation", wikidataId: "Q185538", geo: { lat: 46, lng: -105 } },
  { id: "messel-pit", title: "Messel Pit", kind: "life", time: { label: "47 Ma", maStart: 47 }, keywords: ["Messel", "Eocene", "fossil"], wikiTitle: "Messel pit", wikidataId: "Q185538", geo: { lat: 49.92, lng: 8.77 } },
  { id: "la-brea", title: "La Brea Tar Pits", kind: "life", time: { yearsAgo: 50000, label: "~50 ka" }, keywords: ["La Brea", "tar pits", "Pleistocene"], wikiTitle: "La Brea Tar Pits", wikidataId: "Q185538", geo: { lat: 34.06, lng: -118.36 } },
  { id: "olduvai-gorge", title: "Olduvai Gorge", kind: "life", time: { yearsAgo: 2000000, label: "~2 Ma" }, keywords: ["Olduvai", "hominin", "Tanzania"], wikiTitle: "Olduvai Gorge", wikidataId: "Q185538", geo: { lat: -2.99, lng: 35.35 } },

  // ── Civilisations (sample) ──
  { id: "roman-empire", title: "Roman Empire", kind: "civilisation", time: { yearsAgo: 2000, label: "2,000 years ago" }, keywords: ["Roman Empire", "Rome", "antiquity"], wikiTitle: "Roman Empire", wikidataId: "Q48", geo: { lat: 41.9, lng: 12.5 } },
  { id: "ancient-egypt", title: "Ancient Egypt", kind: "civilisation", time: { yearsAgo: 5000, label: "5,000 years ago" }, keywords: ["Ancient Egypt", "pyramids", "pharaoh"], wikiTitle: "Ancient Egypt", wikidataId: "Q11768", geo: { lat: 29.98, lng: 31.13 } },
  { id: "indus-valley", title: "Indus Valley Civilisation", kind: "civilisation", time: { yearsAgo: 4500, label: "4,500 years ago" }, keywords: ["Indus Valley", "Harappa", "Mohenjo-daro"], wikiTitle: "Indus Valley Civilisation", wikidataId: "Q185538", geo: { lat: 27.3, lng: 68.1 } },
  { id: "mesopotamia", title: "Mesopotamia", kind: "civilisation", time: { yearsAgo: 5000, label: "5,000 years ago" }, keywords: ["Mesopotamia", "Sumer", "cuneiform"], wikiTitle: "Mesopotamia", wikidataId: "Q185538", geo: { lat: 33.3, lng: 44.4 } },
  { id: "han-dynasty", title: "Han Dynasty", kind: "civilisation", time: { yearsAgo: 2000, label: "2,000 years ago" }, keywords: ["Han dynasty", "China", "Silk Road"], wikiTitle: "Han dynasty", wikidataId: "Q185538", geo: { lat: 34.2, lng: 108.9 } },
  { id: "mayan-civilisation", title: "Classic Maya", kind: "civilisation", time: { yearsAgo: 1200, label: "~800 CE" }, keywords: ["Maya", "Mesoamerica", "Tikal"], wikiTitle: "Maya civilization", wikidataId: "Q185538", geo: { lat: 17.22, lng: -89.62 } },
  { id: "inca-empire", title: "Inca Empire", kind: "civilisation", time: { yearsAgo: 600, label: "~1400 CE" }, keywords: ["Inca", "Machu Picchu", "Andes"], wikiTitle: "Inca Empire", wikidataId: "Q185538", geo: { lat: -13.16, lng: -72.55 } },

  // ── More events & seas ──
  { id: "western-interior-seaway", title: "Western Interior Seaway", kind: "event", time: { label: "100–66 Ma", maStart: 100, maEnd: 66 }, keywords: ["Cretaceous", "inland sea", "North America"], wikiTitle: "Western Interior Seaway", wikidataId: "Q185538", geo: { lat: 39.5, lng: -98 } },
  { id: "messinian-salinity", title: "Messinian Salinity Crisis", kind: "event", time: { label: "5.96–5.33 Ma", maStart: 5.96, maEnd: 5.33 }, keywords: ["Mediterranean", "evaporation", "Messinian"], wikiTitle: "Messinian salinity crisis", wikidataId: "Q185538", geo: { lat: 37.5, lng: 14 } },
  { id: "first-life", title: "Origin of Life", kind: "life", time: { label: ">3.5 Ga", maStart: 3500 }, keywords: ["origin of life", "abiogenesis", "LUCA"], wikiTitle: "Abiogenesis", wikidataId: "Q185538" },
  { id: "oxygen-crisis", title: "Great Oxidation Event", kind: "event", time: { label: "~2.4 Ga", maStart: 2400 }, wikiTitle: "Great Oxidation Event", wikidataId: "Q184211" },
  { id: "multicellularity", title: "Origin of Multicellular Life", kind: "life", time: { label: "~1.5–1 Ga", maStart: 1500, maEnd: 1000 }, keywords: ["multicellular", "evolution", "Precambrian"], wikiTitle: "Multicellular organism", wikidataId: "Q185538" },

  // ── More periods (epochs) ──
  { id: "paleocene", title: "Paleocene Epoch", kind: "period", time: { label: "66–56 Ma", maStart: 66, maEnd: 56 }, wikiTitle: "Paleocene", wikidataId: "Q185538" },
  { id: "eocene", title: "Eocene Epoch", kind: "period", time: { label: "56–34 Ma", maStart: 56, maEnd: 34 }, wikiTitle: "Eocene", wikidataId: "Q185538" },
  { id: "oligocene", title: "Oligocene Epoch", kind: "period", time: { label: "34–23 Ma", maStart: 34, maEnd: 23 }, wikiTitle: "Oligocene", wikidataId: "Q185538" },
  { id: "miocene", title: "Miocene Epoch", kind: "period", time: { label: "23–5.3 Ma", maStart: 23, maEnd: 5.3 }, wikiTitle: "Miocene", wikidataId: "Q185538" },
  { id: "pliocene", title: "Pliocene Epoch", kind: "period", time: { label: "5.3–2.6 Ma", maStart: 5.3, maEnd: 2.6 }, wikiTitle: "Pliocene", wikidataId: "Q185538" },
  { id: "pleistocene", title: "Pleistocene Epoch", kind: "period", time: { label: "2.6 Ma – 12 ka", maStart: 2.6 }, wikiTitle: "Pleistocene", wikidataId: "Q185538" },
  { id: "holocene", title: "Holocene Epoch", kind: "period", time: { label: "12 ka – present", yearsAgo: 0 }, wikiTitle: "Holocene", wikidataId: "Q185538" },

  // ── More events ──
  { id: "laki-eruption", title: "Laki Eruption (1783)", kind: "event", time: { yearsAgo: 241, label: "1783" }, keywords: ["Laki", "Iceland", "famine"], wikiTitle: "Laki", wikidataId: "Q185538", geo: { lat: 64.07, lng: -18.23 } },
  { id: "lake-toba", title: "Lake Toba", kind: "event", time: { yearsAgo: 74000, label: "74 ka" }, keywords: ["Toba", "supervolcano", "Sumatra"], wikiTitle: "Lake Toba", wikidataId: "Q185538", geo: { lat: 2.58, lng: 98.83 } },
  { id: "black-sea-deluge", title: "Black Sea Deluge Hypothesis", kind: "event", time: { yearsAgo: 7500, label: "~7.5 ka" }, keywords: ["Black Sea", "flood", "Holocene"], wikiTitle: "Black Sea deluge hypothesis", wikidataId: "Q185538" },
  { id: "storegga-slide", title: "Storegga Slide", kind: "event", time: { yearsAgo: 8200, label: "8.2 ka" }, keywords: ["Storegga", "tsunami", "Doggerland"], wikiTitle: "Storegga Slide", wikidataId: "Q185538" },
  { id: "african-humid-period", title: "African Humid Period", kind: "event", time: { yearsAgo: 11000, label: "14.5–5.5 ka" }, keywords: ["Sahara", "Green Sahara", "Holocene"], wikiTitle: "African humid period", wikidataId: "Q185538" },
  { id: "agricultural-revolution", title: "Neolithic Revolution", kind: "event", time: { yearsAgo: 10000, label: "~10 ka" }, keywords: ["agriculture", "Neolithic", "domestication"], wikiTitle: "Neolithic Revolution", wikidataId: "Q185538" },
  { id: "bronze-age-collapse", title: "Bronze Age Collapse", kind: "event", time: { yearsAgo: 3200, label: "~1200 BCE" }, keywords: ["Bronze Age", "collapse", "Sea Peoples"], wikiTitle: "Late Bronze Age collapse", wikidataId: "Q185538" },

  // ── More fossil sites & life ──
  { id: "solnhofen", title: "Solnhofen Limestone", kind: "life", time: { label: "150 Ma", maStart: 150 }, keywords: ["Solnhofen", "Archaeopteryx", "Jurassic"], wikiTitle: "Solnhofen limestone", wikidataId: "Q185538", geo: { lat: 48.9, lng: 11 } },
  { id: "green-river-formation", title: "Green River Formation", kind: "life", time: { label: "53–48 Ma", maStart: 53, maEnd: 48 }, keywords: ["Green River", "Eocene", "fish fossil"], wikiTitle: "Green River Formation", wikidataId: "Q185538", geo: { lat: 41.5, lng: -109.5 } },
  { id: "dinosaur-provincial-park", title: "Dinosaur Provincial Park", kind: "life", time: { label: "75 Ma", maStart: 75 }, keywords: ["dinosaur", "Cretaceous", "Alberta"], wikiTitle: "Dinosaur Provincial Park", wikidataId: "Q185538", geo: { lat: 50.76, lng: -111.49 } },
  { id: "florissant-fossil-beds", title: "Florissant Fossil Beds", kind: "life", time: { label: "34 Ma", maStart: 34 }, keywords: ["Florissant", "Eocene", "fossil"], wikiTitle: "Florissant Fossil Beds National Monument", wikidataId: "Q185538", geo: { lat: 38.91, lng: -105.28 } },
  { id: "chengjiang", title: "Chengjiang Biota", kind: "life", time: { label: "518 Ma", maStart: 518 }, keywords: ["Chengjiang", "Cambrian", "China"], wikiTitle: "Maotianshan Shales", wikidataId: "Q185538", geo: { lat: 24.7, lng: 102.9 } },
  { id: "doushantuo", title: "Doushantuo Formation", kind: "life", time: { label: "635–551 Ma", maStart: 635, maEnd: 551 }, keywords: ["Doushantuo", "Ediacaran", "embryo"], wikiTitle: "Doushantuo Formation", wikidataId: "Q185538" },
  { id: "romer-gap", title: "Romer's Gap", kind: "life", time: { label: "360–345 Ma", maStart: 360, maEnd: 345 }, keywords: ["Romer's Gap", "tetrapod", "Devonian"], wikiTitle: "Romer's gap", wikidataId: "Q185538" },
  { id: "k-t-boundary", title: "Cretaceous–Paleogene Boundary", kind: "event", time: { label: "66 Ma", maStart: 66 }, keywords: ["K-Pg", "extinction", "iridium"], wikiTitle: "Cretaceous–Paleogene boundary", wikidataId: "Q185538" },
  { id: "capitan-reef", title: "Capitan Reef", kind: "life", time: { label: "265–260 Ma", maStart: 265, maEnd: 260 }, keywords: ["Capitan", "reef", "Permian"], wikiTitle: "Capitan Reef", wikidataId: "Q185538", geo: { lat: 31.9, lng: -104.9 } },
  { id: "pacific-ring-of-fire", title: "Pacific Ring of Fire", kind: "tectonics", time: { label: "Ongoing" }, keywords: ["Ring of Fire", "subduction", "volcano"], wikiTitle: "Ring of Fire", wikidataId: "Q185538" },
  { id: "mid-atlantic-ridge", title: "Mid-Atlantic Ridge", kind: "tectonics", time: { label: "Ongoing" }, keywords: ["mid-ocean ridge", "spreading", "Atlantic"], wikiTitle: "Mid-Atlantic Ridge", wikidataId: "Q185538" },
  { id: "san-andreas-fault", title: "San Andreas Fault", kind: "tectonics", time: { label: "Ongoing" }, keywords: ["San Andreas", "transform", "California"], wikiTitle: "San Andreas Fault", wikidataId: "Q185538", geo: { lat: 37.6, lng: -122.4 } },
  { id: "yellowstone-caldera", title: "Yellowstone Caldera", kind: "event", time: { label: "640 ka (last)", maStart: 0.64 }, keywords: ["Yellowstone", "supervolcano", "caldera"], wikiTitle: "Yellowstone Caldera", wikidataId: "Q185538", geo: { lat: 44.43, lng: -110.58 } },
  { id: "long-valley-caldera", title: "Long Valley Caldera", kind: "event", time: { label: "760 ka", maStart: 0.76 }, keywords: ["Long Valley", "caldera", "California"], wikiTitle: "Long Valley Caldera", wikidataId: "Q185538", geo: { lat: 37.7, lng: -118.87 } },
  { id: "campanian-ignimbrite", title: "Campanian Ignimbrite Eruption", kind: "event", time: { yearsAgo: 39000, label: "39 ka" }, keywords: ["Campanian", "supervolcano", "Italy"], wikiTitle: "Campanian ignimbrite eruption", wikidataId: "Q185538", geo: { lat: 40.83, lng: 14.43 } },
];
