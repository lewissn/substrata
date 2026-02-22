// ---------------------------------------------------------------------------
// Discover — curated geological and historical archive
// Static dataset. No API calls. Max 25 entries.
//
// Images: all served via Wikimedia Commons Special:FilePath redirect.
// The browser follows the 302 → actual CDN thumbnail automatically.
// Format: https://commons.wikimedia.org/wiki/Special:FilePath/FILENAME?width=800
// ---------------------------------------------------------------------------

export type DiscoverTag = "life" | "extinction" | "eruption" | "ice" | "tectonics";

export const TAG_LABELS: Record<DiscoverTag, string> = {
  life: "Life & Evolution",
  extinction: "Extinctions",
  eruption: "Eruptions",
  ice: "Ice & Sea",
  tectonics: "Tectonics",
};

export type DiscoverEntry = {
  id: string;
  title: string;
  subtitle?: string;
  /** Plain text, paragraphs separated by \n\n. 2–4 paragraphs max. */
  description: string;
  /** Deep time in million years ago */
  ma?: number;
  /** Historical year (negative = BCE) */
  year?: number;
  /** Geological or historical era label */
  era: string;
  /** Map navigation target */
  lat?: number;
  lng?: number;
  /** Public domain image — Wikimedia Commons Special:FilePath redirect */
  image: string;
  imageCredit?: string;
  tags: DiscoverTag[];
};

// Shorthand for Special:FilePath URLs — browser follows redirect to CDN thumbnail
function fp(filename: string): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=800`;
}

export const DISCOVER_ENTRIES: DiscoverEntry[] = [
  {
    id: "great-oxidation-event",
    title: "Great Oxidation Event",
    subtitle: "The day the sky changed forever",
    era: "Archaean–Proterozoic boundary",
    ma: 2400,
    tags: ["life", "extinction"],
    description:
      "Around 2.4 billion years ago, cyanobacteria began releasing oxygen as a byproduct of photosynthesis on a scale that permanently altered Earth's atmosphere. For billions of years prior, the air contained almost no free oxygen — the planet was a world of methane, nitrogen, and iron-rich oceans.\n\nThe oxygen that accumulated proved lethal to most anaerobic life, triggering what some call the first mass extinction. At the same time, it made complex multicellular life possible. Without this event, animals — including humans — could not exist.\n\nEvidence of the Great Oxidation Event is preserved in banded iron formations and ancient soil profiles across every continent. The stromatolites of Shark Bay, Australia, are living descendants of the cyanobacteria that reshaped the world.",
    lat: -25.9,
    lng: 113.8,
    image: fp("Stromatolites_in_Shark_Bay.jpg"),
    imageCredit: "Wikimedia Commons / Paul Harrison (CC BY-SA 3.0)",
  },
  {
    id: "snowball-earth",
    title: "Snowball Earth",
    subtitle: "A planet entirely encased in ice",
    era: "Cryogenian",
    ma: 720,
    tags: ["ice"],
    description:
      "Between roughly 720 and 635 million years ago, Earth experienced the most severe glaciations in its history. Ice sheets extended from the poles to the equator, and the oceans may have been frozen to a depth of several kilometres. Average global temperatures fell below −50°C.\n\nSnowball Earth episodes likely lasted millions of years each, driven by ice-albedo feedback: the more ice, the more sunlight reflected, the colder it becomes. Volcanic outgassing of CO₂ eventually broke the cycle, producing brief but intense greenhouse conditions as the planet thawed.\n\nThe Snowball events may have played a decisive role in the evolution of complex life. The volatile conditions — repeated freezing, thawing, and sudden oxygen fluctuations — may have driven evolutionary innovation in the single-celled organisms that would eventually give rise to animals.",
    image: fp("Snowball_Earth.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "ediacaran",
    title: "Ediacaran Biota",
    subtitle: "The world's first complex creatures",
    era: "Ediacaran",
    ma: 575,
    lat: -31.1,
    lng: 138.4,
    tags: ["life"],
    description:
      "The Ediacaran Period, between roughly 635 and 541 million years ago, produced the first undisputed examples of complex multicellular life. These organisms were soft-bodied, largely immobile, and utterly unlike anything alive today — flat, frond-like, or disc-shaped, with no clear head, gut, or limbs.\n\nDickinsonia, perhaps the most famous Ediacaran fossil, was a ribbed oval creature up to 1.4 metres long. Chemical analysis of its fossils has detected cholesterol — a molecule found in animals — suggesting it was among the first true animals on Earth. Other Ediacaran organisms remain unclassified: they may represent extinct experiments in body plan that left no living descendants.\n\nThe Ediacara Hills of South Australia, the type locality for this fauna, preserve fossils in ancient seabed sediments. Similar assemblages have since been found on every continent, suggesting that before the Cambrian Explosion, the deep seafloor of a warmer, calmer world was carpeted with these silent, alien organisms.",
    image: fp("Dickinsonia_costata.jpg"),
    imageCredit: "Wikimedia Commons / Verisimilus (CC BY-SA 3.0)",
  },
  {
    id: "cambrian-explosion",
    title: "Cambrian Explosion",
    subtitle: "The sudden diversification of animal life",
    era: "Cambrian",
    ma: 541,
    lat: 51.44,
    lng: -116.48,
    tags: ["life"],
    description:
      "In a geologically brief window beginning around 541 million years ago, nearly every major animal body plan known today appeared in the fossil record. Creatures with eyes, legs, shells, gills, and complex nervous systems emerged within a span of roughly 20 million years — an evolutionary blink.\n\nThe Burgess Shale of British Columbia preserves one of the finest windows into this period. Its soft-bodied fossils reveal organisms of extraordinary strangeness: Anomalocaris, a metre-long apex predator; Opabinia, with five eyes and a frontal grasping appendage; Hallucigenia, a spiny worm so bizarre it was reconstructed upside-down for decades.\n\nWhat triggered the Cambrian Explosion remains debated. Rising oxygen, the end of Snowball Earth conditions, new ecological niches, and the evolution of predation are all proposed factors. Whatever its cause, it represents the most significant diversification of animal life in Earth's history.",
    image: fp("Cambrian_Explosion.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "first-forests",
    title: "First Forests",
    subtitle: "Trees reshape the land and the atmosphere",
    era: "Devonian",
    ma: 385,
    lat: 42.4,
    lng: -74.5,
    tags: ["life"],
    description:
      "The Devonian Period witnessed the emergence of the first forests, beginning around 385 million years ago. Trees such as Archaeopteris — a fern-like plant with a woody trunk — grew across floodplains and riverbanks, fundamentally altering the planet's carbon cycle, soil chemistry, and hydrology.\n\nThe Gilboa fossil site in New York preserves the stumps of what may be the world's oldest forest. Discovered in the nineteenth century during quarrying work, these fossils provided early evidence that complex tree-like plants preceded the familiar coal forests of the Carboniferous by tens of millions of years.\n\nThe spread of forests had profound atmospheric consequences. As trees fixed carbon and shed organic material, CO₂ levels fell dramatically. Some scientists connect this drawdown to the Late Devonian extinctions — a period of significant biodiversity loss that may have been driven in part by the cooling effects of the first global forests.",
    image: fp("Archaeopteris.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "late-devonian-extinction",
    title: "Late Devonian Extinction",
    subtitle: "The collapse of the ancient reef world",
    era: "Devonian",
    ma: 372,
    tags: ["extinction"],
    description:
      "The Late Devonian extinction, centred around 372 million years ago, was one of the five great mass extinctions in Earth's history. Approximately 75 percent of species were lost, with marine ecosystems bearing the heaviest toll. The rich tropical reef communities that had flourished through the Devonian — built around stromatoporoids and tabulate corals — were almost entirely destroyed.\n\nThe extinction unfolded over several million years in a series of pulses, most notably the Kellwasser events. The causes remain debated: spread of forests may have leached nutrients into the ocean triggering eutrophication and anoxia; other hypotheses point to volcanism or meteor impacts. Sea levels fluctuated dramatically throughout the period.\n\nAmong the casualties was Dunkleosteus, the armoured placoderm fish that reached 8 metres in length and ranked among the most formidable predators of the Palaeozoic seas. The extinction effectively cleared the ecological stage for the rise of the bony fish that dominate the oceans today.",
    image: fp("Dunkleosteus_skull.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "carboniferous-swamps",
    title: "Carboniferous Coal Swamps",
    subtitle: "An oxygen-rich world of giant insects",
    era: "Carboniferous",
    ma: 307,
    tags: ["life"],
    description:
      "The Carboniferous Period, lasting from roughly 359 to 299 million years ago, was defined by vast tropical swamp forests that covered much of what is now Europe and North America. These forests accumulated organic material on a scale that would eventually become the coal seams that powered the Industrial Revolution.\n\nAtmospheric oxygen reached an estimated 35 percent during this period — compared to 21 percent today. This oxygen-rich atmosphere supported fauna of exceptional size. Dragonfly-like Meganeura had wingspans of over 70 centimetres. Myriapods such as Arthropleura reached lengths of 2.5 metres, making them the largest land invertebrates in Earth's history.\n\nThe Carboniferous ended with the Carboniferous Rainforest Collapse, when a period of cooling and drying fragmented the vast tropical forests into isolated patches — an early example of habitat fragmentation driving extinction.",
    image: fp("Carboniferous_coal_swamp.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "end-permian",
    title: "End-Permian Extinction",
    subtitle: "The Great Dying — 96% of species lost",
    era: "Permian–Triassic boundary",
    ma: 252,
    lat: 61.0,
    lng: 100.0,
    tags: ["extinction", "eruption"],
    description:
      "The end-Permian extinction, 252 million years ago, was the most severe mass extinction in Earth's history. An estimated 96 percent of marine species and 70 percent of terrestrial vertebrate species were eliminated. Recovery of ecosystems took some 10 million years.\n\nThe primary cause was the eruption of the Siberian Traps — one of the largest volcanic provinces in Earth's history. Over approximately one million years, eruptions released massive quantities of CO₂, methane, and sulphur dioxide, triggering rapid warming, ocean acidification, and widespread oxygen depletion in shallow seas.\n\nThe Siberian Traps region of Russia preserves flood basalts covering an area larger than Western Europe. The Putorana Plateau, a UNESCO World Heritage Site, offers the most accessible geological window into these catastrophic eruptions. The landscape that remains is austere, beautiful, and geologically ancient.",
    image: fp("Putorana_Plateau.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "gondwana-breakup",
    title: "Gondwana Breakup",
    subtitle: "A supercontinent begins to dissolve",
    era: "Jurassic–Cretaceous",
    ma: 180,
    tags: ["tectonics"],
    description:
      "Gondwana, the great southern supercontinent, began to fragment around 180 million years ago. At its greatest extent, it encompassed what is now South America, Africa, Antarctica, Australia, the Indian subcontinent, and the Arabian Peninsula — a single landmass twice the size of Laurasia.\n\nRifting began between Africa and Antarctica, then continued to pull apart the Indian subcontinent and eventually South America from Africa. The opening of the South Atlantic began around 130 million years ago, a rift that geologically mirrors the coastlines of Brazil and West Africa.\n\nThe biological consequences were profound. As landmasses separated, populations became isolated and diverged. The marsupials of Australia, the lemurs of Madagascar, and the unique fauna of South America all owe their distinctive character to the isolation that followed the Gondwanan breakup.",
    image: fp("Gondwana.png"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "western-interior-seaway",
    title: "Western Interior Seaway",
    subtitle: "A warm sea splits a continent in two",
    era: "Cretaceous",
    ma: 90,
    lat: 39.5,
    lng: -98.0,
    tags: ["life", "tectonics"],
    description:
      "For roughly 25 million years during the Cretaceous period, a shallow inland sea divided North America from the Arctic to the Gulf of Mexico. At its widest, the Western Interior Seaway stretched 1,000 kilometres across. The water was warm and teeming with life — mosasaurs, plesiosaurs, and sharks hunted enormous ammonites in the shallows, while pterosaurs with wingspans of ten metres soared above.\n\nThe seaway formed as the North American tectonic plate subsided under the weight of rising mountain ranges to the west — the early Rockies. As the continent warmed, sea levels rose globally, and the low interior of North America flooded. The Pierre Shale of the Great Plains, now exposed in Kansas and South Dakota, preserves the seafloor sediments of this vanished ocean.\n\nThe seaway drained away around 66 million years ago as regional tectonics lifted the interior. The same mass extinction that ended the dinosaurs coincided with its final recession. Where mosasaurs once hunted, bison would eventually roam.",
    image: fp("Western_Interior_Seaway.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "chicxulub",
    title: "Chicxulub Impact",
    subtitle: "End of the Cretaceous, dawn of the Cenozoic",
    era: "Cretaceous–Paleogene boundary",
    ma: 66,
    lat: 21.4,
    lng: -89.5,
    tags: ["extinction"],
    description:
      "Sixty-six million years ago, an asteroid approximately 10 kilometres in diameter struck the shallow sea of what is now the Yucatán Peninsula of Mexico. The impact released energy equivalent to billions of nuclear weapons, triggering wildfires, a global impact winter, and acid rain on a planetary scale.\n\nThe Chicxulub crater, buried beneath sediment and the Gulf of Mexico, measures roughly 180 kilometres in diameter. It was not confirmed as a major impact structure until the 1990s, but is now accepted as the primary driver of the end-Cretaceous mass extinction — the event that ended the age of non-avian dinosaurs.\n\nAround 75 percent of species went extinct in the aftermath. The survivors — small mammals, birds, crocodilians, and various plants — went on to diversify into the ecosystems we recognise today. The impact boundary is preserved globally as a thin clay layer enriched in iridium, an element rare on Earth but common in asteroids.",
    image: fp("Chicxulub_radar_topography.jpg"),
    imageCredit: "Wikimedia Commons / USGS / NASA",
  },
  {
    id: "himalayas",
    title: "Formation of the Himalayas",
    subtitle: "Two continents in collision",
    era: "Eocene–Present",
    ma: 50,
    lat: 27.9,
    lng: 86.9,
    tags: ["tectonics"],
    description:
      "The Himalayan mountain range began forming around 50 million years ago when the Indian tectonic plate collided with Eurasia. Prior to this collision, India had been drifting northward across the Tethys Ocean for tens of millions of years following its separation from Gondwana.\n\nThe collision is ongoing. India continues to move northward at approximately 5 centimetres per year, and the Himalayas continue to rise by several millimetres annually — though erosion by wind and water largely keeps pace. Mount Everest, at 8,849 metres, is the current high point of this slow-motion geological drama.\n\nThe uplift of the Tibetan Plateau had global climatic effects: altering atmospheric circulation, intensifying the Asian monsoon, and drawing down CO₂ through enhanced weathering of silicate rock. The Himalayas may be among the most consequential geological features of the Cenozoic era.",
    image: fp("Image-Himalaya_annotated.jpg"),
    imageCredit: "Wikimedia Commons / NASA",
  },
  {
    id: "drake-passage",
    title: "Opening of Drake Passage",
    subtitle: "Antarctica becomes isolated — and freezes",
    era: "Oligocene",
    ma: 30,
    lat: -57.0,
    lng: -64.0,
    tags: ["tectonics", "ice"],
    description:
      "The Drake Passage, separating South America from Antarctica, opened between 30 and 20 million years ago as the two continents drifted apart. The opening allowed the Antarctic Circumpolar Current to form — the world's strongest ocean current and a defining feature of Southern Ocean circulation.\n\nBefore the passage opened, heat from the Atlantic and Pacific could reach Antarctica. Once the circumpolar current became established, it thermally isolated the continent. Temperatures fell sharply, and the Antarctic ice sheet began to form in earnest around 34 million years ago at the Eocene–Oligocene boundary.\n\nThe consequences for global climate were far-reaching. Antarctic glaciation lowered sea levels, altered ocean chemistry, and contributed to a long-term cooling trend that set the conditions for the ice ages of the Pleistocene. The opening of Drake Passage is one of the pivotal tectonic events of the Cenozoic.",
    image: fp("Antarctica_6400px_from_Blue_Marble.jpg"),
    imageCredit: "Wikimedia Commons / NASA",
  },
  {
    id: "messinian",
    title: "Messinian Salinity Crisis",
    subtitle: "The Mediterranean dries up",
    era: "Miocene",
    ma: 5.6,
    lat: 37.5,
    lng: 14.0,
    tags: ["tectonics"],
    description:
      "Between 5.96 and 5.33 million years ago, the Mediterranean Sea was cut off from the Atlantic Ocean as tectonic uplift closed the seaway connecting the two. What followed was one of the most dramatic geological events of the Cenozoic: the Mediterranean evaporated.\n\nOver roughly 600,000 years, the enclosed sea shrank and concentrated. Vast portions became hypersaline deserts. Evaporite deposits up to 3 kilometres thick accumulated across the basin floor — salt and gypsum layers now found beneath the Mediterranean seafloor and exposed in Sicily and the Apennines.\n\nThe crisis ended abruptly around 5.33 million years ago when Atlantic waters breached the Gibraltar sill and cascaded back into the empty basin in what may have been one of the largest floods in Earth's history — the Zanclean Flood. The refilling may have taken anywhere from months to thousands of years, depending on the rate of erosion at Gibraltar.",
    image: fp("Realmonte_salt_mines.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "toba",
    title: "Toba Supereruption",
    subtitle: "A volcanic winter that nearly ended humanity",
    era: "Pleistocene",
    ma: 0.074,
    lat: 2.58,
    lng: 98.83,
    tags: ["eruption"],
    description:
      "Around 74,000 years ago, the Toba supervolcano in northern Sumatra erupted in the largest volcanic event of the past 2 million years. The eruption ejected an estimated 2,800 cubic kilometres of material — roughly 5,000 times the volume of the 1980 Mount St. Helens eruption.\n\nThe resulting volcanic winter may have lasted years, with global temperatures dropping by as much as 3–5°C. Some researchers have proposed that Toba pushed human populations to the brink of extinction, reducing global numbers to as few as a few thousand individuals — a genetic bottleneck that may be visible in the limited diversity of modern human DNA.\n\nThe evidence is debated: archaeological sites in southern Africa and India show continued human occupation through the Toba period, suggesting populations were more resilient than the bottleneck hypothesis implies. What is certain is that Lake Toba, the largest volcanic lake on Earth, conceals the site of one of the most violent events in recent geological history.",
    image: fp("Lake_Toba.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "lgm",
    title: "Last Glacial Maximum",
    subtitle: "Ice sheets from the Arctic to London",
    era: "Pleistocene",
    ma: 0.021,
    lat: 54.0,
    lng: 3.0,
    tags: ["ice"],
    description:
      "At its peak, around 21,000 years ago, the Last Glacial Maximum placed ice sheets up to 3 kilometres thick over much of North America, northern Europe, and Siberia. Global sea levels were approximately 120 metres lower than today, exposing vast continental shelves as dry land.\n\nIn Europe, ice covered Scandinavia and extended south into what is now the English Midlands. Britain was connected to continental Europe by a landmass called Doggerland. The Thames was a tributary of the Rhine. The Sahara was drier than today, and tropical forests contracted.\n\nHuman populations retreated to refugia in southern Europe, the Levant, and elsewhere. The cultures of the Upper Palaeolithic, including the cave paintings of Lascaux and Altamira, belong to this cold world. The warming that followed, beginning around 14,000 years ago, transformed landscapes, erased coastlines, and set the stage for the development of agriculture.",
    image: fp("Ice_age_earth.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "beringia",
    title: "Beringia",
    subtitle: "The land bridge that peopled a continent",
    era: "Pleistocene",
    ma: 0.02,
    lat: 65.5,
    lng: -168.0,
    tags: ["ice"],
    description:
      "During the Last Glacial Maximum, global sea levels were approximately 120 metres lower than today, exposing a broad landmass between Siberia and Alaska. Beringia was not merely a bridge — it was a substantial subcontinent, perhaps 1,600 kilometres wide from north to south, with grassland steppes supporting mammoth, horse, and bison.\n\nIt was across this land that the first humans reached the Americas, almost certainly between 25,000 and 15,000 years ago, though the precise timing and route remain subjects of active research. Some groups may have followed the coast by boat; others moved through an ice-free corridor as glaciers retreated.\n\nToday, the land is submerged beneath the Bering Sea. The Diomede Islands — Big Diomede in Russia and Little Diomede in Alaska — sit on the highest ground of what was once this continental connection, separated by just 3.8 kilometres of water.",
    image: fp("Beringia_land_bridge-noaagov.jpg"),
    imageCredit: "Wikimedia Commons / NOAA",
  },
  {
    id: "younger-dryas",
    title: "Younger Dryas",
    subtitle: "A sudden cold snap at the edge of history",
    era: "Pleistocene–Holocene transition",
    ma: 0.013,
    lat: 62.0,
    lng: -44.0,
    tags: ["ice"],
    description:
      "Around 12,900 years ago, as the last ice age was retreating and the world was warming, temperatures in the North Atlantic region suddenly plunged. In Greenland, surface temperatures dropped by approximately 10°C within a few decades. This abrupt cold snap — the Younger Dryas — lasted roughly 1,200 years before ending just as rapidly.\n\nThe most widely accepted cause is the disruption of the Atlantic Meridional Overturning Circulation (AMOC). As the Laurentide Ice Sheet melted, vast quantities of fresh water flooded into the North Atlantic via the St. Lawrence and other routes. This freshwater pulse, being less dense than salt water, prevented the normal sinking of cold, salty surface water that drives the Atlantic conveyor belt. Oceanic heat transport to northern latitudes collapsed.\n\nThe Younger Dryas had profound effects on human prehistory. The cold, dry conditions in the Near East may have stressed the early farming communities emerging around 13,000 years ago, while the subsequent abrupt warming — temperatures rose 10°C in under a decade at its end — triggered the rapid expansion of agriculture and the first cities.",
    image: fp("Younger_Dryas_Greenland_temperature.png"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "doggerland",
    title: "Doggerland",
    subtitle: "Britain's sunken heartland",
    era: "Mesolithic",
    ma: 0.008,
    lat: 54.0,
    lng: 3.0,
    tags: ["ice"],
    description:
      "Doggerland was a landscape of hills, rivers, and wetlands that once connected Britain to continental Europe. At its greatest extent, it covered an area comparable to France. Mesolithic hunter-gatherers lived and moved across it for thousands of years, hunting aurochs, elk, and wild boar along its river valleys.\n\nAs global temperatures rose and ice sheets melted, sea levels climbed steadily. Doggerland was inundated gradually, then catastrophically. A massive submarine landslide off the coast of Norway around 8,200 years ago — the Storegga Slide — sent a tsunami across the North Sea, inundating the final lowland areas and effectively severing the last land connection between Britain and Europe.\n\nFishermen periodically dredge up bones, teeth, and stone tools from the North Sea floor — remnants of this lost world. Efforts to map Doggerland using offshore seismic survey data have revealed river channels and valleys that remain clearly legible in the seafloor topography.",
    image: fp("Doggerland.svg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "santorini",
    title: "Minoan Eruption, Santorini",
    subtitle: "The eruption that may have ended a civilisation",
    era: "Ancient",
    year: -1630,
    lat: 36.4,
    lng: 25.4,
    tags: ["eruption"],
    description:
      "Around 1630–1600 BCE, the Aegean island of Thera — modern Santorini — erupted in one of the largest volcanic events of the Holocene. The eruption ejected an estimated 60 cubic kilometres of material and collapsed the central portion of the island into the sea, leaving behind the caldera that defines Santorini today.\n\nThe Minoan civilisation of Crete, one of the most sophisticated in the Bronze Age Mediterranean, declined in the decades following the eruption. Whether the eruption directly caused the collapse or merely accelerated it remains debated. Tephra from the eruption has been found in ice cores from Greenland and in sediments across the eastern Mediterranean.\n\nThe ruins of Akrotiri, a Minoan town buried beneath volcanic ash on Santorini, have been excavated since the 1960s. Preserved under metres of pumice, the site reveals a prosperous Bronze Age community with multi-storey buildings and sophisticated frescoes — frozen in the moments before the eruption.",
    image: fp("Oia_Santorini.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "pompeii",
    title: "Eruption of Vesuvius",
    subtitle: "Pompeii, preserved in volcanic ash",
    era: "Ancient",
    year: 79,
    lat: 40.75,
    lng: 14.49,
    tags: ["eruption"],
    description:
      "On 24 August 79 CE, Mount Vesuvius erupted, burying the Roman cities of Pompeii, Herculaneum, and Stabiae under metres of volcanic ash and pyroclastic material. Thousands of inhabitants were killed within hours. The cities remained largely unknown and buried for more than 1,700 years.\n\nExcavations beginning in the eighteenth century revealed a remarkably preserved Roman world. Streets, houses, thermopolia (fast-food counters), bakeries, and baths survived intact. The voids left by decomposed bodies were filled with plaster in the nineteenth century, producing casts of extraordinary detail — a dog straining against its chain, a family sheltering together.\n\nVesuvius remains an active volcano. With approximately 3 million people living within its potential danger zone, it is one of the most closely monitored volcanoes in the world. The events of 79 CE are not a historical anomaly but a reminder of conditions that persist in the region today.",
    image: fp("Pompeii_ruins.jpg"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "laki",
    title: "Laki Eruption",
    subtitle: "The fissure that cast a shadow across Europe",
    era: "Modern",
    year: 1783,
    lat: 64.0,
    lng: -18.2,
    tags: ["eruption"],
    description:
      "In June 1783, a fissure eruption began in southern Iceland along a 27-kilometre-long vent system known as Lakagígar, or Laki. Over the following eight months, the eruption released approximately 122 megatons of sulphur dioxide into the atmosphere — the largest such release in historical times.\n\nThe sulphur dioxide formed a toxic haze that drifted across Europe, damaging crops, killing livestock, and contributing to respiratory illness. In Iceland, the consequences were catastrophic: around 50 to 80 percent of livestock died. Famine killed approximately 20 to 25 percent of the Icelandic population in the years that followed.\n\nAcross Europe, the summer of 1783 brought unusual heat, and the following winter was the most severe of the eighteenth century in many regions. Some historians have connected the resulting harvest failures and economic hardship to the social conditions that preceded the French Revolution of 1789.",
    image: fp("Laki_fissure_craters_2005.JPG"),
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "tambora",
    title: "Tambora Eruption",
    subtitle: "The year without a summer",
    era: "Modern",
    year: 1815,
    lat: -8.25,
    lng: 118.0,
    tags: ["eruption"],
    description:
      "On 10–11 April 1815, Mount Tambora on the Indonesian island of Sumbawa erupted in the largest volcanic event in recorded history. An estimated 160 cubic kilometres of material was ejected. The eruption column reached 43 kilometres into the stratosphere. The explosions were heard as far as 2,600 kilometres away.\n\nIn the immediate vicinity, around 10,000 people were killed directly. Ash fall and subsequent famine and disease killed an estimated 60,000–80,000 more in the region.\n\nGlobally, the eruption injected enough sulphur dioxide into the stratosphere to trigger the \"Year Without a Summer\" in 1816. Crop failures across North America and Europe led to the last great subsistence crisis in the Western world. The literary summer of 1816 — when Mary Shelley conceived Frankenstein and Lord Byron wrote his apocalyptic poem Darkness — was spent indoors at Lake Geneva, in the grey cold that Tambora had created.",
    image: fp("Tambora_140414_lrg.jpg"),
    imageCredit: "Wikimedia Commons / NASA/ASTER",
  },
  {
    id: "krakatoa",
    title: "Krakatoa",
    subtitle: "The eruption heard around the world",
    era: "Modern",
    year: 1883,
    lat: -6.1,
    lng: 105.42,
    tags: ["eruption"],
    description:
      "On 27 August 1883, four massive explosions destroyed most of the island of Krakatoa in the Sunda Strait between Java and Sumatra. The final and largest blast was heard nearly 5,000 kilometres away — in Australia and on the island of Rodrigues near Mauritius — making it possibly the loudest sound in recorded history.\n\nThe eruption and the tsunamis it generated — some reaching 30 metres in height — killed at least 36,000 people. Coastal towns in Java and Sumatra were swept away. The pressure wave from the explosion circumnavigated the globe multiple times, recorded by barometers as far away as England.\n\nThe eruption injected sulphate aerosols into the stratosphere, reducing global temperatures by approximately 1.2°C in the following year. The vivid red and purple sunsets recorded in paintings and diaries across the world in 1883–84 — including, some have argued, the sky in Edvard Munch's The Scream — were a consequence of volcanic aerosols scattering sunlight in the upper atmosphere.",
    image: fp("Krakatoa_eruption_lithograph.jpg"),
    imageCredit: "Wikimedia Commons / Parker & Coward (1888, public domain)",
  },
];

// ---------------------------------------------------------------------------
// Archive (generated or legacy) — same UI as Discover; types inlined so build
// never depends on archiveArticles.ts / archiveCatalog / archiveTypes / generated JSON.
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

export type ArchiveArticle = {
  id: string;
  title: string;
  kind: ArchiveTopicKind;
  time?: { label?: string; maStart?: number; maEnd?: number; yearsAgo?: number };
  hero: { url: string; credit?: string; sourceUrl?: string };
  deck: string;
  sections: Array<{ heading: string; body: string }>;
  sources: Array<{ label: string; url: string }>;
  geo?: { lat: number; lng: number; zoom?: number };
  relatedIds: string[];
  updatedAt: string;
};

function legacyToArticle(e: DiscoverEntry): ArchiveArticle {
  return {
    id: e.id,
    title: e.title,
    kind: (e.tags.includes("life") ? "life" : e.tags.includes("extinction") ? "extinction" : e.tags.includes("eruption") ? "event" : e.tags.includes("ice") ? "ice_age" : e.tags.includes("tectonics") ? "tectonics" : "event") as ArchiveTopicKind,
    time: e.ma != null ? { label: e.era, maStart: e.ma } : e.year != null ? { label: String(e.year), yearsAgo: e.year > 0 ? 2025 - e.year : 2025 + Math.abs(e.year) } : { label: e.era },
    hero: { url: e.image, credit: e.imageCredit },
    deck: e.subtitle ?? e.description.split("\n\n")[0].slice(0, 120),
    sections: e.description.split("\n\n").filter(Boolean).map((body) => ({ heading: "Overview", body })),
    sources: [{ label: "Wikipedia", url: `https://en.wikipedia.org/wiki/${e.title.replace(/ /g, "_")}` }],
    geo: e.lat != null && e.lng != null ? { lat: e.lat, lng: e.lng } : undefined,
    relatedIds: DISCOVER_ENTRIES.filter((x) => x.id !== e.id && x.tags.some((t) => e.tags.includes(t))).map((x) => x.id).slice(0, 5),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

/** Archive entries: legacy discover list (no build-time dependency on generated JSON). */
export const ARCHIVE_ARTICLES: ArchiveArticle[] = DISCOVER_ENTRIES.map(legacyToArticle);

export const ARCHIVE_KIND_LABELS: Record<string, string> = {
  period: "Periods",
  event: "Events",
  extinction: "Extinctions",
  civilisation: "Civilisations",
  impact: "Impacts",
  ice_age: "Ice & Climate",
  tectonics: "Tectonics",
  life: "Life & Evolution",
};
