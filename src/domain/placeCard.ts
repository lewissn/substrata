export type PlaceSource = "wikipedia" | "osm" | "pbdb" | "gplates" | "custom";

export type PlaceKind =
  | "article"
  | "ruins"
  | "castle"
  | "archaeological_site"
  | "monument"
  | "memorial"
  | "battlefield"
  | "historic"
  | "attraction"
  | "prehistoric_site"
  | "megalith"
  | "volcano"
  | "impact_crater"
  | "fault_line"
  | "fossil_occurrence";

export type Era =
  | "modern"
  | "medieval"
  | "ancient"
  | "prehistoric"
  | "geological";

export type TimeSpan = {
  startYear?: number; // negative = BCE; positive = CE
  endYear?: number;
  maStart?: number; // million years ago (start = older)
  maEnd?: number; // million years ago (end = younger)
};

export type PlaceCard = {
  id: string;
  source: PlaceSource;
  kind: PlaceKind;
  title: string;
  coords: { lat: number; lng: number };
  distanceM?: number;
  summary?: string;
  imageUrl?: string;
  url?: string;
  tags?: string[];
  era: Era;
  time?: TimeSpan;
  confidence?: number; // 0–1 heuristic confidence for era/time classification
};
