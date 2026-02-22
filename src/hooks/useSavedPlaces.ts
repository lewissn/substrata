"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type SavedPlace,
  loadSavedPlaces,
  persistSavedPlaces,
} from "@/domain/savedPlaces";

// ---------------------------------------------------------------------------
// useSavedPlaces — manages the "My Finds" list backed by localStorage
// ---------------------------------------------------------------------------

export function useSavedPlaces() {
  const [saves, setSaves] = useState<SavedPlace[]>([]);

  useEffect(() => {
    setSaves(loadSavedPlaces());
  }, []);

  const save = useCallback((place: SavedPlace) => {
    setSaves((prev) => {
      if (prev.some((p) => p.id === place.id)) return prev;
      const next = [place, ...prev];
      persistSavedPlaces(next);
      return next;
    });
  }, []);

  const unsave = useCallback((id: string) => {
    setSaves((prev) => {
      const next = prev.filter((p) => p.id !== id);
      persistSavedPlaces(next);
      return next;
    });
  }, []);

  const isSaved = useCallback(
    (id: string) => saves.some((p) => p.id === id),
    [saves]
  );

  return { saves, save, unsave, isSaved };
}
