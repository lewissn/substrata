export type PlaceSource = "wikipedia" | "osm" | "future";

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
  | "fault_line";

export type Era =
  | "modern"
  | "medieval"
  | "ancient"
  | "prehistoric"
  | "geological";

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
  yearStart?: number; // BCE allowed (negative)
  yearEnd?: number;
};
