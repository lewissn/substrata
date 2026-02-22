// ---------------------------------------------------------------------------
// My Finds — saved places persisted to localStorage
// ---------------------------------------------------------------------------

export type OverlaySnapshot = {
  seaLevelMeters: number | null;
  paleogeography: boolean;
};

export type SavedPlace = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  era: string;
  ma: number;
  overlays: OverlaySnapshot;
  savedAt: string; // ISO date string
};

const STORAGE_KEY = "substrata_finds";

export function loadSavedPlaces(): SavedPlace[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedPlace[];
  } catch {
    return [];
  }
}

export function persistSavedPlaces(places: SavedPlace[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
}
