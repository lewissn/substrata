export type PlaceSource = "wikipedia" | "osm";

export type PlaceKind =
  | "article"
  | "ruins"
  | "castle"
  | "archaeological_site"
  | "monument"
  | "memorial"
  | "battlefield"
  | "historic"
  | "attraction";

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
};