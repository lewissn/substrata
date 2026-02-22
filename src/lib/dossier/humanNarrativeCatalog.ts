// ---------------------------------------------------------------------------
// Human Narrative Catalog — Tier 3 fallback narratives.
//
// Used when Wikidata + Overpass return no strong settlement evidence.
// Keyed by geographic region × time bucket.
// ---------------------------------------------------------------------------

export type Region =
  | "north-europe"
  | "west-europe"
  | "south-europe"
  | "near-east"
  | "central-asia"
  | "south-asia"
  | "east-asia"
  | "southeast-asia"
  | "north-africa"
  | "sub-saharan"
  | "north-america"
  | "mesoamerica"
  | "south-america"
  | "oceania"
  | "arctic"
  | "global";

export type TimeBucket =
  | "classical-medieval"  // 0–2500 yr ago
  | "bronze-age"          // 2500–5000 yr ago
  | "early-neolithic";    // 5000+ yr ago

// ---------------------------------------------------------------------------
// Region classification by lat / lng
// ---------------------------------------------------------------------------

export function classifyRegion(lat: number, lng: number): Region {
  // Arctic
  if (lat > 65) return "arctic";

  // Oceania (Australia, Pacific Islands, New Zealand)
  if (lat < -10 && lng > 110) return "oceania";

  // Americas (west of 30°W)
  if (lng < -30) {
    if (lat > 25) return "north-america";
    if (lat > 7) return "mesoamerica";
    return "south-america";
  }

  // Africa
  if (lng >= -20 && lng < 55 && lat < 8) return "sub-saharan";
  if (lng >= -20 && lng < 42 && lat >= 8 && lat < 38) return "north-africa";

  // Europe (east of 30°W, west of 45°E, north of 35°N)
  if (lat > 50 && lng < 30) return "north-europe";
  if (lat >= 38 && lat <= 52 && lng >= -10 && lng < 15) return "west-europe";
  if (lat >= 35 && lat <= 48 && lng >= 15 && lng < 45) return "south-europe";

  // Near East / Middle East
  if (lat >= 15 && lat < 45 && lng >= 25 && lng < 65) return "near-east";

  // Asia
  if (lat >= 10 && lat < 40 && lng >= 55 && lng < 90) return "south-asia";
  if (lat >= 0 && lat < 25 && lng >= 90 && lng < 140) return "southeast-asia";
  if (lat >= 35 && lat < 56 && lng >= 48 && lng < 90) return "central-asia";
  if (lat >= 18 && lng >= 90 && lng < 145) return "east-asia";

  return "global";
}

// ---------------------------------------------------------------------------
// Time-bucket classification
// ---------------------------------------------------------------------------

export function classifyTimeBucket(yearsAgo: number): TimeBucket {
  if (yearsAgo <= 2500) return "classical-medieval";
  if (yearsAgo <= 5000) return "bronze-age";
  return "early-neolithic";
}

// ---------------------------------------------------------------------------
// Tier 3 narrative catalog
// ---------------------------------------------------------------------------

type RegionTimeBucketKey = `${Region}_${TimeBucket}`;

const NARRATIVES: Partial<Record<RegionTimeBucketKey, { headline: string; summary: string }>> = {

  // ── North Europe ───────────────────────────────────────────────────────────

  "north-europe_classical-medieval": {
    headline: "Iron Age and Viking Age Northern Europe",
    summary:
      "This area lay within the orbit of Germanic, Norse, or Slavic peoples during the classical to medieval period. Iron Age longhouses, Viking-age trading posts (vici), and early medieval farmsteads were characteristic. Roman influence reached southern Scandinavia and Britain but thinned rapidly northward.",
  },
  "north-europe_bronze-age": {
    headline: "Bronze Age Northern Europe",
    summary:
      "Farming communities had spread across northern Europe by the Bronze Age. Burial mounds (tumuli), stone circles, and early field systems marked the landscape. Amber, tin, and copper moved along long-distance exchange routes connecting the Baltic to the Atlantic façade.",
  },
  "north-europe_early-neolithic": {
    headline: "Mesolithic to Early Neolithic Northern Europe",
    summary:
      "Mobile hunter-gatherer bands ranged this landscape, supplemented by the earliest farming arrivals from central Europe. Megalithic tomb construction was beginning in coastal regions, marking a profound shift from nomadic to settled life.",
  },

  // ── West Europe ────────────────────────────────────────────────────────────

  "west-europe_classical-medieval": {
    headline: "Roman and Medieval Western Europe",
    summary:
      "Much of western Europe lay within the Roman Empire or its cultural sphere. Roman roads, towns (vici), military forts, and aqueducts structured the landscape. The medieval period saw feudal manors, monasteries, and cathedral towns emerge — often built directly atop Roman foundations.",
  },
  "west-europe_bronze-age": {
    headline: "Atlantic Bronze Age",
    summary:
      "Atlantic Bronze Age cultures thrived along the coasts of Iberia, France, and Britain, connected by maritime trade in bronze, gold, and amber. Hillforts, field systems, and communal burial mounds characterised the landscape. Urnfield cultures dominated the inland areas.",
  },
  "west-europe_early-neolithic": {
    headline: "Megalithic Western Europe",
    summary:
      "Early farming communities built megalithic monuments — dolmens, passage tombs, and standing stone alignments — along the Atlantic façade. Domesticated cattle, sheep, wheat, and barley were reshaping a post-forest landscape that had been forager territory for thousands of years.",
  },

  // ── South Europe ───────────────────────────────────────────────────────────

  "south-europe_classical-medieval": {
    headline: "Classical Mediterranean Civilisation",
    summary:
      "The Mediterranean littoral was densely settled by Greek, Roman, and later Byzantine communities. Cities, harbours, temples, theatres, and aqueducts defined the urban landscape. This region was the economic and cultural heart of the ancient world, with populations of hundreds of thousands in its great cities.",
  },
  "south-europe_bronze-age": {
    headline: "Early Mediterranean Civilisations",
    summary:
      "Minoan Crete, Mycenaean Greece, and proto-Italic cultures were flourishing around this time. Palace economies, long-distance maritime trade in tin and copper, and the first writing systems in Europe characterised the Bronze Age Aegean. Nuragic culture dominated Sardinia.",
  },
  "south-europe_early-neolithic": {
    headline: "First European Farmers",
    summary:
      "Neolithic farmers with domesticated emmer wheat, einkorn, sheep, and cattle had arrived from Anatolia, settling in small villages. The earliest European pottery traditions emerged here, along with the first permanent rectangular houses and communal storage facilities.",
  },

  // ── Near East ─────────────────────────────────────────────────────────────

  "near-east_classical-medieval": {
    headline: "Ancient Near Eastern and Islamic Civilisation",
    summary:
      "The Fertile Crescent and Levant were among the most densely settled regions on Earth, hosting Mesopotamian, Persian, Hellenistic, Roman, Byzantine, and Islamic empires in succession. Cities such as Babylon, Ctesiphon, Antioch, and Damascus were among the largest and most cosmopolitan in the world.",
  },
  "near-east_bronze-age": {
    headline: "Bronze Age Mesopotamia and the Levant",
    summary:
      "This area fell within the earliest urban civilisations — Sumerian and Akkadian city-states in Mesopotamia, Bronze Age Canaan, and the Hittite Empire in Anatolia. Cuneiform writing, ziggurats, and long-distance trade in lapis lazuli, cedar, and tin defined civilised life here.",
  },
  "near-east_early-neolithic": {
    headline: "Cradle of Agriculture",
    summary:
      "The Near East was the birthplace of farming. Wild einkorn wheat was first domesticated in the Fertile Crescent around 10,000 years ago. The earliest permanent villages — Ain Ghazal, Çatalhöyük, and Jericho — were established in this broader region. This is the area from which agriculture spread to feed the world.",
  },

  // ── Central Asia ──────────────────────────────────────────────────────────

  "central-asia_classical-medieval": {
    headline: "Silk Road Central Asia",
    summary:
      "This area lay along the great Silk Road trade routes connecting China to the Mediterranean. Oasis cities — Samarkand, Merv, Bukhara — thrived as centres of exchange, scholarship, and Islamic culture. Nomadic pastoralists ranged the surrounding steppes, often exerting decisive military pressure on the settled world.",
  },
  "central-asia_bronze-age": {
    headline: "Bronze Age Eurasian Steppes",
    summary:
      "The Eurasian steppe was home to early horse-riding pastoralists of the Yamnaya, Sintashta, and Andronovo cultures. This region was the heartland from which Indo-European languages and the chariot spread across Eurasia. Bronze Age kurgans (burial mounds) still dot the landscape.",
  },
  "central-asia_early-neolithic": {
    headline: "Early Central Asian Hunter-Gatherers",
    summary:
      "Small mobile bands ranged across the Central Asian steppes and semi-arid zones, hunting saiga antelope, horse, and aurochs. Agriculture had not yet reached this far inland; the steppe way of life that would shape Eurasian history for millennia was still in its early formative stages.",
  },

  // ── South Asia ────────────────────────────────────────────────────────────

  "south-asia_classical-medieval": {
    headline: "Classical South Asian Civilisation",
    summary:
      "The Indian subcontinent hosted some of the ancient world's greatest empires — Mauryan, Gupta, Kushan, and later the Delhi Sultanate. Sophisticated cities, temple complexes, and hydraulic systems characterised the Gangetic plains and Deccan plateau. The subcontinent was a hub of global maritime trade.",
  },
  "south-asia_bronze-age": {
    headline: "Indus Valley Civilisation",
    summary:
      "The Indus Valley (Harappan) Civilisation was at or approaching its peak around this period, with planned cities such as Mohenjo-daro and Harappa featuring grid streets, fired brick construction, and advanced drainage — among the most sophisticated urban centres of the ancient world.",
  },
  "south-asia_early-neolithic": {
    headline: "Early South Asian Farming Communities",
    summary:
      "Early Neolithic villages were forming in the greater Indus basin and the Deccan. Hunter-gatherer communities still dominated much of the subcontinent, using backed microlithic tools. Domestication of zebu cattle and cultivation of barley and wheat was beginning in the northwest.",
  },

  // ── East Asia ─────────────────────────────────────────────────────────────

  "east-asia_classical-medieval": {
    headline: "Imperial East Asian Civilisation",
    summary:
      "China's imperial dynasties — Han, Tang, Song, and later Yuan — created the largest, most sophisticated, and most populated economies of the premodern world. Dense agricultural landscapes, Grand Canal networks, and cities of over a million people characterised the eastern lowlands.",
  },
  "east-asia_bronze-age": {
    headline: "Shang and Early Zhou China",
    summary:
      "The Shang and early Zhou dynasties were flourishing in the Yellow and Yangtze River valleys. Ritual bronze vessels, oracle bone divination, and walled city-states characterised this first phase of recognisably Chinese civilisation. Millet and rice agriculture sustained large settled populations.",
  },
  "east-asia_early-neolithic": {
    headline: "First East Asian Farmers",
    summary:
      "Rice cultivation was first domesticated in the Yangtze River delta, while millet farming emerged in the Yellow River basin — two of the world's independent centres of agricultural origin. Small Neolithic villages with cord-marked pottery (Yangshao, Hemudu) dotted the river valleys.",
  },

  // ── Southeast Asia ────────────────────────────────────────────────────────

  "southeast-asia_classical-medieval": {
    headline: "Classical Southeast Asian Kingdoms",
    summary:
      "Maritime and riverine kingdoms — Khmer, Srivijaya, Pagan, and Champa — dominated Southeast Asia in the classical period. Temple complexes, hydraulic rice agriculture, and sea-borne trade networks connecting India to China defined the landscape. Angkor Wat was built during this era.",
  },
  "southeast-asia_bronze-age": {
    headline: "Austronesian Expansion",
    summary:
      "Austronesian-speaking communities were spreading across island Southeast Asia, bringing outrigger canoe technology, domesticated rice, pigs, and chickens. Bronze Age Đông Sơn culture was flourishing in mainland Vietnam, producing famous bronze drums. Maritime trade was already extensive.",
  },
  "southeast-asia_early-neolithic": {
    headline: "Early Austronesian Southeast Asia",
    summary:
      "The Austronesian expansion from Taiwan was under way, carrying farming communities south through the Philippines and into the broader Pacific. Hunter-gatherer Hoabinhian cultures still occupied much of the mainland interior, with their distinctive pebble tool assemblages.",
  },

  // ── North Africa ──────────────────────────────────────────────────────────

  "north-africa_classical-medieval": {
    headline: "Classical North Africa",
    summary:
      "North Africa was a key province of the Roman Empire (Mauretania, Africa Proconsularis, Egypt) and later the Byzantine and Islamic caliphates. Cities such as Carthage, Alexandria, and Leptis Magna were among the most populous in the ancient world. The region supplied much of Rome's grain and olive oil.",
  },
  "north-africa_bronze-age": {
    headline: "Old Kingdom Egypt and the Late Green Sahara",
    summary:
      "The Nile valley hosted the Old and Middle Kingdom Egyptian civilisations — pyramid-builders, god-kings, and scribes. Meanwhile, the Sahara was wetter than today (the African Humid Period), supporting cattle-herding pastoralists across what is now barren desert, leaving rock art of hippos, cattle, and swimmers.",
  },
  "north-africa_early-neolithic": {
    headline: "Green Sahara",
    summary:
      "This area formed part of the 'Green Sahara' — a dramatically wetter period when monsoon rains extended far northward. Lakes, rivers, and grasslands supported pastoralists who herded cattle across what is now empty desert. Vivid rock art at sites like Tassili n'Ajjer records this lost world.",
  },

  // ── Sub-Saharan Africa ────────────────────────────────────────────────────

  "sub-saharan_classical-medieval": {
    headline: "Iron Age Sub-Saharan Africa",
    summary:
      "Iron Age Bantu-speaking farming communities had spread across most of sub-Saharan Africa by this time. Trading kingdoms — Ghana, Mali, Great Zimbabwe — accumulated wealth through trans-Saharan and Indian Ocean trade networks. Gold, ivory, and enslaved people moved along established routes.",
  },
  "sub-saharan_bronze-age": {
    headline: "Late Stone Age and Early Pastoralism",
    summary:
      "This area was inhabited by Late Stone Age hunter-gatherers across much of sub-Saharan Africa, with early pastoralism spreading through East Africa. Agricultural Bantu communities were beginning their transformative expansion from a West African homeland.",
  },
  "sub-saharan_early-neolithic": {
    headline: "Late Stone Age Africa",
    summary:
      "Hunter-gatherer communities using microlithic stone tools ranged across this landscape. These were among the most skilled and adaptable foragers in human history, with rich cosmological traditions, broad botanical knowledge, and sophisticated social networks spanning vast territories.",
  },

  // ── North America ─────────────────────────────────────────────────────────

  "north-america_classical-medieval": {
    headline: "Woodland and Mississippian Cultures",
    summary:
      "Complex chiefdom societies — Mississippian mound-builders in the southeast, Ancestral Pueblo in the southwest, and Hopewell in the midwest — dominated North America. Large earthwork complexes and early urban centres such as Cahokia (population ~20,000) emerged alongside maize agriculture.",
  },
  "north-america_bronze-age": {
    headline: "Archaic North America",
    summary:
      "Archaic hunter-gatherers and early horticulturalists ranged across North America. Copper tools and ornaments from the Great Lakes spread widely through exchange networks. Eastern Woodland cultures were beginning to cultivate squash and sunflower alongside wild plant harvesting.",
  },
  "north-america_early-neolithic": {
    headline: "Early Holocene North America",
    summary:
      "Paleo-Indian hunters had recently spread across the continent in the wake of retreating glaciers. Megafauna — mammoths, mastodons, horses, ground sloths — were still present but declining rapidly due to climate change and hunting pressure. Clovis and Folsom point technologies defined the era.",
  },

  // ── Mesoamerica ───────────────────────────────────────────────────────────

  "mesoamerica_classical-medieval": {
    headline: "Classic Mesoamerican Civilisation",
    summary:
      "This region was home to the great Mesoamerican civilisations — Maya city-states, Teotihuacan (population ~125,000), and later the Aztec (Mexica) empire. Pyramid-temples, ball courts, hieroglyphic writing, and an accurate 365-day calendar characterised these sophisticated urban cultures.",
  },
  "mesoamerica_bronze-age": {
    headline: "Formative Mesoamerica and Olmec Culture",
    summary:
      "Olmec culture — the 'mother culture' of Mesoamerica — was flourishing along the Gulf Coast at La Venta and San Lorenzo, with colossal stone heads, jade trade, and elaborate ceremonial centres. Early farming villages growing maize, squash, and beans were spreading across the highland valleys.",
  },
  "mesoamerica_early-neolithic": {
    headline: "Origins of Mesoamerican Agriculture",
    summary:
      "Teosinte — the wild ancestor of maize — was first domesticated in the valleys of Oaxaca and the Balsas River basin, one of the most transformative moments in world agricultural history. Semi-sedentary communities were shifting from pure foraging to cultivated crops.",
  },

  // ── South America ─────────────────────────────────────────────────────────

  "south-america_classical-medieval": {
    headline: "Andean Civilisation",
    summary:
      "Andean civilisations — Tiwanaku, Wari, and later the Inca — built complex states supported by terrace agriculture, llama herding, and the quipu recording system. Coastal Moche culture was renowned for elaborate ceramics, gold work, and pyramid-temples. Amazonian societies were larger and more complex than once thought.",
  },
  "south-america_bronze-age": {
    headline: "Formative Andean Cultures",
    summary:
      "Early Andean cultures were building monumental ceremonial platforms — the Norte Chico / Caral civilisation on the Peruvian coast is among the oldest complex societies in the Americas. Marine fishing, cotton cultivation, and long-distance exchange networks supported dense coastal populations.",
  },
  "south-america_early-neolithic": {
    headline: "Early South American Settlers",
    summary:
      "The first South Americans were spreading across the continent following game and coastlines. Monte Verde in Chile provides evidence of human habitation by ~14,000 years ago. Hunter-gatherers ranged from tropical Amazonia to windswept Patagonian steppe, adapting to radically different environments.",
  },

  // ── Oceania ───────────────────────────────────────────────────────────────

  "oceania_classical-medieval": {
    headline: "Polynesian Oceania",
    summary:
      "Polynesian navigators had completed their remarkable expansion across the Pacific, reaching Hawaii, Easter Island, and New Zealand by this period. Using stars, swells, and bird patterns for navigation, they brought pigs, chickens, taro, and sweet potato to the most remote islands on Earth.",
  },
  "oceania_bronze-age": {
    headline: "Lapita Culture and Pacific Expansion",
    summary:
      "The Lapita cultural complex — direct ancestors of Polynesian peoples — were expanding across Near Oceania and into western Polynesia. Distinctive dentate-stamped pottery marks their archaeological signature from the Bismarck Archipelago to Tonga and Samoa.",
  },
  "oceania_early-neolithic": {
    headline: "Aboriginal and Early Sahul Peoples",
    summary:
      "Australia and New Guinea (Sahul) had been inhabited for over 50,000 years by this time. Complex forager societies with extraordinarily rich material culture and deep ecological knowledge were the norm. The world's oldest edge-ground axes and early evidence of forest management date from this region.",
  },

  // ── Arctic ────────────────────────────────────────────────────────────────

  "arctic_classical-medieval": {
    headline: "Thule and Dorset Arctic Cultures",
    summary:
      "The Arctic was home to ancestral Inuit (Thule culture, ~1000 CE) who had developed extraordinary adaptations to polar conditions — dog sleds, umiaks, toggling harpoons — or the earlier Dorset people. Ringed seal, walrus, caribou, and bowhead whale sustained these resilient communities.",
  },
  "arctic_bronze-age": {
    headline: "Arctic Small Tool Tradition",
    summary:
      "Pre-Dorset Arctic Small Tool Tradition (ASTt) peoples ranged across the high Arctic, hunting musk ox and caribou with tiny, precisely knapped microblades. These were among the most northerly humans of their time, living in one of the harshest environments on Earth.",
  },
  "arctic_early-neolithic": {
    headline: "Early Arctic Settlers",
    summary:
      "The first Arctic peoples had recently arrived, following megafauna and marine mammals northward as the great ice sheets retreated. The Arctic was one of the last regions on Earth to be permanently settled by humans, and they arrived as consummate survivors.",
  },

  // ── Global fallbacks ──────────────────────────────────────────────────────

  "global_classical-medieval": {
    headline: "Classical to Medieval Period",
    summary:
      "Human communities at this time were embedded in regional agricultural networks, trade routes, and emerging state structures. Iron tools, animal traction, and surplus grain storage enabled population growth and economic specialisation. Villages, market towns, and religious centres structured the landscape.",
  },
  "global_bronze-age": {
    headline: "Bronze Age",
    summary:
      "Farming communities with domestic animals and copper or bronze tools inhabited this landscape. Long-distance exchange networks — moving metals, ceramics, and prestige goods — connected communities across surprising distances. Social hierarchies were crystallising around warrior elites and craft specialists.",
  },
  "global_early-neolithic": {
    headline: "Early Holocene",
    summary:
      "This area was inhabited by hunter-gatherer or early farming communities. The post-glacial landscape was still settling into its modern configuration, with rising sea levels, expanding forests, and climate shifting toward warmer, wetter conditions.",
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Return a Tier 3 narrative for the given region and time bucket. */
export function getTier3Narrative(
  region: Region,
  bucket: TimeBucket,
): { headline: string; summary: string } {
  const key: RegionTimeBucketKey = `${region}_${bucket}`;
  return (
    NARRATIVES[key] ??
    NARRATIVES[`global_${bucket}`] ?? {
      headline: "Human presence",
      summary:
        "Human communities occupied this landscape, adapting to local environmental conditions and participating in wider regional networks of exchange and culture.",
    }
  );
}
