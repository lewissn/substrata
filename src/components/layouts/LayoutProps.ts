import type { Era, PlaceCard, PlaceKind, PlaceSource } from "@/domain/placeCard";
import type { ReconstructionResult } from "@/app/api/reconstruct/route";
import type { MapTheme } from "@/components/Map";
import type { SavedPlace } from "@/domain/savedPlaces";

/**
 * Shared prop interface for DesktopLayout and MobileLayout.
 * All state lives in page.tsx; layouts are presentation + callbacks.
 */
export type LayoutProps = {
  // Search
  query: string;
  onQueryChange: (q: string) => void;
  onGeocode: () => void;
  onSearchArea: () => void;
  loading: boolean;

  // Cards
  cards: PlaceCard[];
  rankedCards: PlaceCard[];
  newCardIds: Set<string>;
  error: string | null;
  selected: PlaceCard | null;
  onCardSelect: (card: PlaceCard) => void;
  onCloseSelected: () => void;

  // Filters
  activeSources: PlaceSource[];
  onToggleSource: (s: PlaceSource) => void;
  activeKinds: PlaceKind[];
  onToggleKind: (k: PlaceKind) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;

  // Time
  activeEra: Era | null;
  onEraChange: (era: Era | null) => void;
  deepTimeEnabled: boolean;
  onDeepTimeToggle: () => void;
  ma: number;
  onMaChange: (ma: number) => void;

  // Overlays
  seaLevelOverride: number | null;
  onSeaLevelChange: (v: number | null) => void;
  overlayBoost: boolean;
  onOverlayBoostToggle: () => void;
  paleoEnabled: boolean;
  onPaleoToggle: () => void;
  paleoOpacity: number;
  onPaleoOpacityChange: (v: number) => void;

  // Context / Paleo
  paleoData: ReconstructionResult | null;
  coastlineGeoJSON: GeoJSON.FeatureCollection | null;

  // Map
  center: [number, number];
  onCenterChange: (c: [number, number]) => void;
  mapTheme: MapTheme;
  onMapThemeChange: (theme: MapTheme) => void;

  // Drawer extras
  nearbyFossilCount: number;

  // Actions
  onSurpriseMe: () => void;

  // My Finds
  savedPlaces: SavedPlace[];
  onSavePlace: (card: PlaceCard) => void;
  onUnsavePlace: (id: string) => void;
  onRestoreFind: (place: SavedPlace) => void;
};
