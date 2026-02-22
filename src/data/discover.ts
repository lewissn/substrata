// ---------------------------------------------------------------------------
// Discover — curated geological and historical archive
// Static dataset. No API calls. Max 25 entries.
// ---------------------------------------------------------------------------

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
  /** Public domain image URL (Wikimedia Commons) */
  image: string;
  imageCredit?: string;
};

export const DISCOVER_ENTRIES: DiscoverEntry[] = [
  {
    id: "great-oxidation-event",
    title: "Great Oxidation Event",
    subtitle: "The day the sky changed forever",
    era: "Archaean–Proterozoic boundary",
    ma: 2400,
    description:
      "Around 2.4 billion years ago, cyanobacteria began releasing oxygen as a byproduct of photosynthesis on a scale that permanently altered Earth's atmosphere. For billions of years prior, the air contained almost no free oxygen — the planet was a world of methane, nitrogen, and iron-rich oceans.\n\nThe oxygen that accumulated proved lethal to most anaerobic life, triggering what some call the first mass extinction. At the same time, it made complex multicellular life possible. Without this event, animals — including humans — could not exist.\n\nEvidence of the Great Oxidation Event is preserved in banded iron formations and ancient soil profiles across every continent. The stromatolites of Shark Bay, Australia, are living descendants of the cyanobacteria that reshaped the world.",
    lat: -25.9,
    lng: 113.8,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Stromatolites_in_Shark_Bay.jpg/1200px-Stromatolites_in_Shark_Bay.jpg",
    imageCredit: "Wikimedia Commons / Paul Harrison (CC BY-SA 3.0)",
  },
  {
    id: "snowball-earth",
    title: "Snowball Earth",
    subtitle: "A planet entirely encased in ice",
    era: "Cryogenian",
    ma: 720,
    description:
      "Between roughly 720 and 635 million years ago, Earth experienced the most severe glaciations in its history. Ice sheets extended from the poles to the equator, and the oceans may have been frozen to a depth of several kilometres. Average global temperatures fell below −50°C.\n\nSnowball Earth episodes likely lasted millions of years each, driven by ice-albedo feedback: the more ice, the more sunlight reflected, the colder it becomes. Volcanic outgassing of CO₂ eventually broke the cycle, producing brief but intense greenhouse conditions as the planet thawed.\n\nThe Snowball events may have played a decisive role in the evolution of complex life. The volatile conditions, repeated freezing and thawing, and sudden oxygen fluctuations may have driven evolutionary innovation in single-celled organisms that would eventually give rise to animals.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Snowball_Earth.jpg/1200px-Snowball_Earth.jpg",
    imageCredit: "Wikimedia Commons / NASA",
  },
  {
    id: "cambrian-explosion",
    title: "Cambrian Explosion",
    subtitle: "The sudden diversification of animal life",
    era: "Cambrian",
    ma: 541,
    lat: 51.44,
    lng: -116.48,
    description:
      "In a geologically brief window beginning around 541 million years ago, nearly every major animal body plan known today appeared in the fossil record. Creatures with eyes, legs, shells, gills, and complex nervous systems emerged within a span of roughly 20 million years — an evolutionary blink.\n\nThe Burgess Shale of British Columbia preserves one of the finest windows into this period. Its soft-bodied fossils reveal organisms of extraordinary strangeness: Anomalocaris, a metre-long apex predator; Opabinia, with five eyes and a frontal grasping appendage; Hallucigenia, a spiny worm so bizarre it was reconstructed upside-down for decades.\n\nWhat triggered the Cambrian Explosion remains debated. Rising oxygen, the end of Snowball Earth conditions, new ecological niches, and the evolution of predation are all proposed factors. Whatever its cause, it represents the most significant diversification of animal life in Earth's history.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Burgess_Shale_fossil_Anomalocaris.jpg/1200px-Burgess_Shale_fossil_Anomalocaris.jpg",
    imageCredit: "Wikimedia Commons / Chip Clark, Smithsonian Institution",
  },
  {
    id: "first-forests",
    title: "First Forests",
    subtitle: "Trees reshape the land and the atmosphere",
    era: "Devonian",
    ma: 385,
    lat: 42.4,
    lng: -74.5,
    description:
      "The Devonian Period witnessed the emergence of the first forests, beginning around 385 million years ago. Trees such as Archaeopteris — a fern-like plant with a woody trunk — grew across floodplains and riverbanks, fundamentally altering the planet's carbon cycle, soil chemistry, and hydrology.\n\nThe Gilboa fossil site in New York preserves the stumps of what may be the world's oldest forest. Discovered in the nineteenth century during quarrying work, these fossils provided early evidence that complex tree-like plants preceded the familiar coal forests of the Carboniferous by tens of millions of years.\n\nThe spread of forests had profound atmospheric consequences. As trees fixed carbon and shed organic material, CO₂ levels fell dramatically. Some scientists connect this drawdown to the Late Devonian extinctions, a period of significant biodiversity loss that may have been driven in part by the cooling effects of the first global forests.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Gilboa_Fossils.jpg/1200px-Gilboa_Fossils.jpg",
    imageCredit: "Wikimedia Commons / New York State Museum",
  },
  {
    id: "carboniferous-swamps",
    title: "Carboniferous Coal Swamps",
    subtitle: "An oxygen-rich world of giant insects",
    era: "Carboniferous",
    ma: 307,
    description:
      "The Carboniferous Period, lasting from roughly 359 to 299 million years ago, was defined by vast tropical swamp forests that covered much of what is now Europe and North America. These forests accumulated organic material on a scale that would eventually become the coal seams that powered the Industrial Revolution.\n\nAtmospheric oxygen reached an estimated 35 percent during this period — compared to 21 percent today. This oxygen-rich atmosphere supported fauna of exceptional size. Dragonfly-like Meganeura had wingspans of over 70 centimetres. Myriapods such as Arthropleura reached lengths of 2.5 metres, making them the largest land invertebrates in Earth's history.\n\nThe Carboniferous ended with the Carboniferous Rainforest Collapse, when a period of cooling and drying fragmented the vast tropical forests into isolated patches — an early example of habitat loss driving extinction.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Carboniferous_swamp_environment.jpg/1200px-Carboniferous_swamp_environment.jpg",
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
    description:
      "The end-Permian extinction, 252 million years ago, was the most severe mass extinction in Earth's history. An estimated 96 percent of marine species and 70 percent of terrestrial vertebrate species were eliminated. Recovery of ecosystems took some 10 million years.\n\nThe primary cause was the eruption of the Siberian Traps — one of the largest volcanic provinces in Earth's history. Over approximately one million years, eruptions released massive quantities of CO₂, methane, and sulphur dioxide, triggering rapid warming, ocean acidification, and widespread oxygen depletion in shallow seas.\n\nThe Siberian Traps region of Russia preserves flood basalts covering an area larger than Western Europe. The Putorana Plateau, a UNESCO World Heritage Site, offers the most accessible geological window into these catastrophic eruptions. The landscape that remains is austere, beautiful, and geologically ancient.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Putorana_Plateau.jpg/1200px-Putorana_Plateau.jpg",
    imageCredit: "Wikimedia Commons",
  },
  {
    id: "gondwana-breakup",
    title: "Gondwana Breakup",
    subtitle: "A supercontinent begins to dissolve",
    era: "Jurassic–Cretaceous",
    ma: 180,
    description:
      "Gondwana, the great southern supercontinent, began to fragment around 180 million years ago. At its greatest extent, it encompassed what is now South America, Africa, Antarctica, Australia, the Indian subcontinent, and the Arabian Peninsula — a single landmass twice the size of Laurasia.\n\nRifting began between Africa and Antarctica, then continued to pull apart the Indian subcontinent and eventually South America from Africa. The opening of the South Atlantic began around 130 million years ago, a rift that geologically mirrors the coastlines of Brazil and West Africa.\n\nThe biological consequences were profound. As landmasses separated, populations became isolated and diverged. The marsupials of Australia, the lemurs of Madagascar, and the unique fauna of South America all owe their distinctive character to the isolation that followed the Gondwanan breakup.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Gondwana_420_Ma.jpg/1200px-Gondwana_420_Ma.jpg",
    imageCredit: "Wikimedia Commons / Fama Clamosa (CC BY-SA 4.0)",
  },
  {
    id: "chicxulub",
    title: "Chicxulub Impact",
    subtitle: "End of the Cretaceous, dawn of the Cenozoic",
    era: "Cretaceous–Paleogene boundary",
    ma: 66,
    lat: 21.4,
    lng: -89.5,
    description:
      "Sixty-six million years ago, an asteroid approximately 10 kilometres in diameter struck the shallow sea of what is now the Yucatán Peninsula of Mexico. The impact released energy equivalent to billions of nuclear weapons, triggering wildfires, a global impact winter, and acid rain on a planetary scale.\n\nThe Chicxulub crater, buried beneath sediment and the Gulf of Mexico, measures roughly 180 kilometres in diameter. It was not confirmed as a major impact structure until the 1990s, but is now accepted as the primary driver of the end-Cretaceous mass extinction — the event that ended the age of non-avian dinosaurs.\n\nAround 75 percent of species went extinct in the aftermath, including all non-avian dinosaurs. The survivors — small mammals, birds, crocodilians, and various plants — went on to diversify into the ecosystems we recognise today. The impact boundary is preserved globally as a thin clay layer enriched in iridium, an element rare on Earth but common in asteroids.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Yucatan_chix_crater.jpg/1200px-Yucatan_chix_crater.jpg",
    imageCredit: "Wikimedia Commons / NASA/JPL",
  },
  {
    id: "himalayas",
    title: "Formation of the Himalayas",
    subtitle: "Two continents in collision",
    era: "Eocene–Present",
    ma: 50,
    lat: 27.9,
    lng: 86.9,
    description:
      "The Himalayan mountain range began forming around 50 million years ago when the Indian tectonic plate collided with Eurasia. Prior to this collision, India had been drifting northward across the Tethys Ocean for tens of millions of years following its separation from Gondwana.\n\nThe collision is ongoing. India continues to move northward at approximately 5 centimetres per year, and the Himalayas continue to rise by several millimetres annually — though erosion by wind and water largely keeps pace. Mount Everest, at 8,849 metres, is the current high point of this slow-motion geological drama.\n\nThe uplift of the Tibetan Plateau, a direct consequence of the collision, had global climatic effects: altering atmospheric circulation, intensifying the Asian monsoon, and drawing down CO₂ through enhanced weathering of silicate rock. The Himalayas may be among the most consequential geological features of the Cenozoic era.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image-Himalaya_annotated.jpg/1200px-Image-Himalaya_annotated.jpg",
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
    description:
      "The Drake Passage, separating South America from Antarctica, opened between 30 and 20 million years ago as the two continents drifted apart. The opening allowed the Antarctic Circumpolar Current to form — the world's strongest ocean current and a defining feature of Southern Ocean circulation.\n\nBefore the passage opened, heat from the Atlantic and Pacific could reach Antarctica. Once the circumpolar current became established, it thermally isolated the continent. Temperatures fell sharply, and the Antarctic ice sheet began to form in earnest around 34 million years ago at the Eocene–Oligocene boundary.\n\nThe consequences for global climate were far-reaching. Antarctic glaciation lowered sea levels, altered ocean chemistry, and contributed to a long-term cooling trend that set the conditions for the ice ages of the Pleistocene. The opening of Drake Passage is one of the pivotal tectonic events of the Cenozoic.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Antarctica_6400px_from_Blue_Marble.jpg/1200px-Antarctica_6400px_from_Blue_Marble.jpg",
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
    description:
      "Between 5.96 and 5.33 million years ago, the Mediterranean Sea was cut off from the Atlantic Ocean as tectonic uplift closed the seaway connecting the two. What followed was one of the most dramatic geological events of the Cenozoic: the Mediterranean evaporated.\n\nOver roughly 600,000 years, the enclosed sea shrank and concentrated. It did not disappear entirely — freshwater inflow from rivers and occasional Atlantic spillovers maintained remnant basins — but vast portions became hypersaline deserts. Evaporite deposits up to 3 kilometres thick accumulated across the basin floor.\n\nThe crisis ended abruptly around 5.33 million years ago when Atlantic waters breached the Gibraltar sill and cascaded back into the empty basin in what may have been one of the largest floods in Earth's history — an event known as the Zanclean Flood. Today, the salt deposits formed during the crisis underlie much of Sicily and the central Mediterranean seafloor.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Sicily_-_Salt_mines_at_Realmonte_%28Agrigento_Province%29.jpg/1200px-Sicily_-_Salt_mines_at_Realmonte_%28Agrigento_Province%29.jpg",
    imageCredit: "Wikimedia Commons / Serena Epis (CC BY-SA 4.0)",
  },
  {
    id: "toba",
    title: "Toba Supereruption",
    subtitle: "A volcanic winter that nearly ended humanity",
    era: "Pleistocene",
    ma: 0.074,
    lat: 2.58,
    lng: 98.83,
    description:
      "Around 74,000 years ago, the Toba supervolcano in northern Sumatra erupted in the largest volcanic event of the past 2 million years. The eruption ejected an estimated 2,800 cubic kilometres of material — roughly 5,000 times the volume of the 1980 Mount St. Helens eruption.\n\nThe resulting volcanic winter may have lasted years, with global temperatures dropping by as much as 3–5°C. Some researchers have proposed that Toba pushed human populations to the brink of extinction, reducing global numbers to as few as a few thousand individuals — a genetic bottleneck that may be visible in the limited diversity of modern human DNA.\n\nThe evidence is debated: archaeological sites in southern Africa and India show continued human occupation through the Toba period, suggesting populations were more resilient than the bottleneck hypothesis implies. What is certain is that Lake Toba, now a tranquil caldera lake and the largest volcanic lake on Earth, conceals the site of one of the most violent events in recent geological history.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Lake_Toba%2C_viewed_from_Samosir_Island%2C_North_Sumatra.jpg/1200px-Lake_Toba%2C_viewed_from_Samosir_Island%2C_North_Sumatra.jpg",
    imageCredit: "Wikimedia Commons / Fjotland (CC BY-SA 3.0)",
  },
  {
    id: "beringia",
    title: "Beringia",
    subtitle: "The land bridge that peopled a continent",
    era: "Pleistocene",
    ma: 0.02,
    lat: 65.5,
    lng: -168.0,
    description:
      "During the Last Glacial Maximum, global sea levels were approximately 120 metres lower than today, exposing a broad landmass between Siberia and Alaska. Beringia, as this region is known, was not merely a bridge — it was a substantial subcontinent, perhaps 1,600 kilometres wide from north to south, with grassland steppes supporting mammoth, horse, and bison.\n\nIt was across this land that the first humans reached the Americas, almost certainly between 25,000 and 15,000 years ago, though the precise timing and route remain subjects of active research. Some groups may have followed the coast by boat; others moved through an ice-free corridor as glaciers retreated.\n\nToday, the land is submerged beneath the Bering Sea. The Diomede Islands — Big Diomede in Russia and Little Diomede in Alaska — sit on the highest ground of what was once this continental connection, separated by just 3.8 kilometres of water.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Beringia_land_bridge-noaagov.jpg/1200px-Beringia_land_bridge-noaagov.jpg",
    imageCredit: "Wikimedia Commons / NOAA",
  },
  {
    id: "lgm",
    title: "Last Glacial Maximum",
    subtitle: "Ice sheets from the Arctic to London",
    era: "Pleistocene",
    ma: 0.021,
    lat: 54.0,
    lng: 3.0,
    description:
      "At its peak, around 21,000 years ago, the Last Glacial Maximum placed ice sheets up to 3 kilometres thick over much of North America, northern Europe, and Siberia. Global sea levels were approximately 120 metres lower than today, exposing vast continental shelves as dry land.\n\nIn Europe, ice covered Scandinavia and extended south into what is now the English Midlands. Britain was connected to continental Europe by a landmass called Doggerland. The Thames was a tributary of the Rhine. The Sahara was drier than today, and tropical forests contracted.\n\nHuman populations were not extinguished but retreated to refugia — areas of relatively mild climate in southern Europe, the Levant, and refuges further afield. The cultures of the Upper Palaeolithic, including the cave paintings of Lascaux and Altamira, belong to this cold world. The warming that followed, beginning around 14,000 years ago, transformed landscapes, erased coastlines, and set the stage for the development of agriculture.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Northern_icesheet_hg.png/1200px-Northern_icesheet_hg.png",
    imageCredit: "Wikimedia Commons / Hannes Grobe (CC BY 3.0)",
  },
  {
    id: "doggerland",
    title: "Doggerland",
    subtitle: "Britain's sunken heartland",
    era: "Mesolithic",
    ma: 0.008,
    lat: 54.0,
    lng: 3.0,
    description:
      "Doggerland was a landscape of hills, rivers, and wetlands that once connected Britain to continental Europe. At its greatest extent, during the Last Glacial Maximum, it covered an area comparable to France. Mesolithic hunter-gatherers lived and moved across it for thousands of years, hunting aurochs, elk, and wild boar along its river valleys.\n\nAs global temperatures rose and ice sheets melted, sea levels climbed steadily. Doggerland was inundated gradually, then catastrophically. A massive submarine landslide off the coast of Norway around 8,200 years ago — the Storegga Slide — sent a tsunami across the North Sea, inundating the final lowland areas and effectively severing the last land connection between Britain and Europe.\n\nFishermen periodically dredge up bones, teeth, and stone tools from the North Sea floor — remnants of this lost world. Efforts to map Doggerland using offshore seismic survey data have revealed river channels and valleys that remain clearly legible in the seafloor topography.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Doggerland.svg/1200px-Doggerland.svg.png",
    imageCredit: "Wikimedia Commons / Morningstar1814 (CC BY-SA 4.0)",
  },
  {
    id: "santorini",
    title: "Minoan Eruption, Santorini",
    subtitle: "The eruption that may have ended a civilisation",
    era: "Ancient",
    year: -1630,
    lat: 36.4,
    lng: 25.4,
    description:
      "Around 1630–1600 BCE, the Aegean island of Thera — modern Santorini — erupted in one of the largest volcanic events of the Holocene. The eruption ejected an estimated 60 cubic kilometres of material and collapsed the central portion of the island into the sea, leaving behind the caldera that defines Santorini today.\n\nThe Minoan civilisation of Crete, one of the most sophisticated in the Bronze Age Mediterranean, declined in the decades following the eruption. Whether the eruption directly caused the collapse or merely accelerated it remains debated. Tephra from the eruption has been found in ice cores from Greenland and in sediments across the eastern Mediterranean.\n\nThe ruins of Akrotiri, a Minoan town buried beneath volcanic ash on Santorini, have been excavated since the 1960s. Preserved under metres of pumice, the site reveals a prosperous Bronze Age community with multi-storey buildings and sophisticated frescoes — frozen in the moments before the eruption.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Santorini_caldera_from_air.jpg/1200px-Santorini_caldera_from_air.jpg",
    imageCredit: "Wikimedia Commons / Tomisti (CC BY-SA 4.0)",
  },
  {
    id: "pompeii",
    title: "Eruption of Vesuvius",
    subtitle: "Pompeii, preserved in volcanic ash",
    era: "Ancient",
    year: 79,
    lat: 40.75,
    lng: 14.49,
    description:
      "On 24 August 79 CE, Mount Vesuvius erupted, burying the Roman cities of Pompeii, Herculaneum, and Stabiae under metres of volcanic ash and pyroclastic material. Thousands of inhabitants were killed, many within hours. The cities remained largely unknown and buried for more than 1,700 years.\n\nExcavations beginning in the eighteenth century revealed a remarkably preserved Roman world. Streets, houses, thermopolia (fast-food counters), bakeries, and baths survived intact. The voids left by decomposed bodies were filled with plaster in the nineteenth century, producing casts of extraordinary detail — a dog straining against its chain, a family sheltering together.\n\nVesuvius remains an active volcano. With approximately 3 million people living within its potential danger zone, it is one of the most closely monitored volcanoes in the world. The events of 79 CE are not a historical anomaly but a reminder of the conditions that persist in the region today.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Pompeii-Ruins.jpg/1200px-Pompeii-Ruins.jpg",
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
    description:
      "In June 1783, a fissure eruption began in southern Iceland along a 27-kilometre-long vent system known as Lakagígar, or Laki. Over the following eight months, the eruption released approximately 122 megatons of sulphur dioxide into the atmosphere — the largest such release in historical times.\n\nThe sulphur dioxide formed a toxic haze that drifted across Europe, damaging crops, killing livestock, and contributing to respiratory illness. In Iceland, the consequences were catastrophic: around 50 to 80 percent of livestock died. Famine killed approximately 20 to 25 percent of the Icelandic population in the years that followed.\n\nAcross Europe, the summer of 1783 brought unusual heat, and the following winter — the Meteorological Revolution winter — was the most severe of the eighteenth century in many regions. Some historians have connected the resulting harvest failures and economic hardship to the social conditions that preceded the French Revolution of 1789.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Laki_craters_2012.jpg/1200px-Laki_craters_2012.jpg",
    imageCredit: "Wikimedia Commons / Chmee2 (CC BY 3.0)",
  },
  {
    id: "tambora",
    title: "Tambora Eruption",
    subtitle: "The year without a summer",
    era: "Modern",
    year: 1815,
    lat: -8.25,
    lng: 118.0,
    description:
      "On 10–11 April 1815, Mount Tambora on the Indonesian island of Sumbawa erupted in the largest volcanic event in recorded history. An estimated 160 cubic kilometres of material was ejected. The eruption column reached 43 kilometres into the stratosphere. The explosions were heard as far as 2,600 kilometres away.\n\nIn the immediate vicinity, around 10,000 people were killed directly. Pyroclastic flows destroyed three kingdoms on Sumbawa. Ash fall and subsequent famine and disease killed an estimated 60,000–80,000 more in the region.\n\nGlobally, the eruption injected enough sulphur dioxide into the stratosphere to reduce solar radiation and trigger the \"Year Without a Summer\" in 1816. Crop failures across North America and Europe led to the last great subsistence crisis in the Western world. The literary summer of 1816 — when Mary Shelley conceived Frankenstein and Lord Byron wrote his apocalyptic poem Darkness — was spent indoors at Lake Geneva, in the grey cold that Tambora had created.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Tambora_140414_lrg.jpg/1200px-Tambora_140414_lrg.jpg",
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
    description:
      "On 27 August 1883, four massive explosions destroyed most of the island of Krakatoa in the Sunda Strait between Java and Sumatra. The final and largest blast was heard nearly 5,000 kilometres away — in Australia and on the island of Rodrigues near Mauritius — making it possibly the loudest sound in recorded history.\n\nThe eruption and the tsunamis it generated — some reaching 30 metres in height — killed at least 36,000 people. Coastal towns in Java and Sumatra were swept away. The pressure wave from the explosion circumnavigated the globe multiple times, recorded by barometers as far away as England.\n\nThe eruption injected sulphate aerosols into the stratosphere, reducing global temperatures by approximately 1.2°C in the following year. The vivid red and purple sunsets recorded in paintings and diaries across the world in 1883–84 — including, some have argued, the sky in Edvard Munch's The Scream — were a consequence of volcanic aerosols scattering sunlight in the upper atmosphere.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/ef/Krakatoa_eruption_lithograph.jpg",
    imageCredit: "Wikimedia Commons / Parker & Coward (1888, public domain)",
  },
];
