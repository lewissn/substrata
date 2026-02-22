// ---------------------------------------------------------------------------
// Wander Places — curated list of globally interesting locations
// Used by the "Wander" button to discover places around the world
// ---------------------------------------------------------------------------

export type WanderPlace = {
  name: string;
  lat: number;
  lng: number;
  description: string;
};

export const WANDER_PLACES: WanderPlace[] = [
  // Geological wonders
  { name: "Grand Canyon", lat: 36.0544, lng: -112.2401, description: "Ancient geological layers" },
  { name: "Yellowstone", lat: 44.4280, lng: -110.5885, description: "Supervolcanic geothermal park" },
  { name: "Kilimanjaro", lat: -3.0674, lng: 37.3556, description: "Africa's highest volcanic peak" },
  { name: "Galápagos Islands", lat: -0.8013, lng: -91.1432, description: "Volcanic island evolution" },
  { name: "Icelandic Geysers", lat: 64.3148, lng: -20.3044, description: "Active volcanic landscape" },
  { name: "Patagonia", lat: -50.6899, lng: -73.4162, description: "Ancient glacial landscape" },
  { name: "Scottish Highlands", lat: 57.1227, lng: -5.5320, description: "Ancient mountain geology" },
  { name: "Sahara Desert", lat: 23.4162, lng: 25.6628, description: "Ancient sea floor turned desert" },
  { name: "Chicxulub Crater", lat: 21.3956, lng: -89.5229, description: "Dinosaur extinction impact site" },

  // Palaeontological sites
  { name: "Olduvai Gorge", lat: -2.9938, lng: 35.3539, description: "Cradle of human evolution" },
  { name: "Dinosaur National Monument", lat: 40.4372, lng: -108.9978, description: "Jurassic fossil beds" },
  { name: "Gobi Desert", lat: 43.6664, lng: 104.0650, description: "Fossil-rich ancient desert" },
  { name: "Cradle of Humankind", lat: -25.8789, lng: 27.7738, description: "World Heritage fossil site" },

  // Prehistoric monuments
  { name: "Stonehenge", lat: 51.1789, lng: -1.8262, description: "Neolithic stone circle" },
  { name: "Easter Island", lat: -27.1127, lng: -109.3497, description: "Mysterious moai statues" },
  { name: "Skara Brae", lat: 59.0486, lng: -3.3417, description: "Neolithic village in Orkney" },
  { name: "Göbekli Tepe", lat: 37.2233, lng: 38.9224, description: "World's oldest temple complex" },

  // Ancient civilisations
  { name: "Pompeii", lat: 40.7510, lng: 14.4860, description: "Roman city preserved by Vesuvius" },
  { name: "Petra", lat: 30.3285, lng: 35.4444, description: "Rose-red city carved in rock" },
  { name: "Teotihuacan", lat: 19.6925, lng: -98.8438, description: "Ancient Mesoamerican pyramids" },
  { name: "Machu Picchu", lat: -13.1631, lng: -72.5450, description: "Inca citadel in the Andes" },
  { name: "Nile Valley", lat: 24.0889, lng: 32.8998, description: "Ancient Egyptian heartland" },
  { name: "Olympia", lat: 37.6379, lng: 21.6305, description: "Ancient Greek sanctuary" },
  { name: "Carthage", lat: 36.8528, lng: 10.3233, description: "Ruins of the Punic city" },

  // Medieval & historical
  { name: "Angkor Wat", lat: 13.4125, lng: 103.8670, description: "Khmer temple complex" },
  { name: "Hadrian's Wall", lat: 54.9908, lng: -2.0996, description: "Roman frontier fortification" },
  { name: "Forbidden City", lat: 39.9163, lng: 116.3972, description: "Imperial palace complex, Beijing" },
  { name: "Samarkand", lat: 39.6270, lng: 66.9750, description: "Silk Road oasis city" },

  // Natural heritage
  { name: "Great Barrier Reef", lat: -18.2860, lng: 147.6992, description: "World's largest coral reef" },
  { name: "Amazon Headwaters", lat: -3.7319, lng: -73.2516, description: "Ancient rainforest basin" },
];
