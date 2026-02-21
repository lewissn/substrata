import type { PlaceCard } from "./placeCard";
import { periodForMa } from "./periods";
import { eraFromMa, formatMa } from "./time";

// ---------------------------------------------------------------------------
// "This place was…" narrative lines for the drawer.
// Returns 1–3 short, emotionally resonant statements.
// ---------------------------------------------------------------------------

type NarrativeContext = {
  card: PlaceCard;
  ma: number | null; // null = present / era-first mode
  paleoLat?: number | null;
  paleoLng?: number | null;
  nearbyFossilCount?: number;
  nearbyFossilPeriod?: string;
};

export function getNarrativeLines(ctx: NarrativeContext): string[] {
  const lines: string[] = [];
  const { card, ma, paleoLat, nearbyFossilCount, nearbyFossilPeriod } = ctx;

  // If no deep time selection, provide era-based narrative
  if (ma == null || ma === 0) {
    return getEraLines(card);
  }

  // 1. Period context
  const period = periodForMa(ma);
  if (period) {
    lines.push(`At ${formatMa(ma)}, this was the ${period.name} period.`);
  }

  // 2. Paleolatitude statement
  if (paleoLat != null) {
    const absLat = Math.abs(paleoLat);
    if (absLat < 15) {
      lines.push(`This place lay near the equator, at ~${absLat.toFixed(0)}° latitude.`);
    } else if (absLat < 35) {
      lines.push(`This place was in the subtropics, at ~${absLat.toFixed(0)}° latitude.`);
    } else if (absLat < 55) {
      lines.push(`This place sat in temperate latitudes, at ~${absLat.toFixed(0)}°.`);
    } else if (absLat < 70) {
      lines.push(`This place was in high latitudes, at ~${absLat.toFixed(0)}°.`);
    } else {
      lines.push(`This place lay near the pole, at ~${absLat.toFixed(0)}° latitude.`);
    }
  }

  // 3. LGM-specific
  if (ma > 0.015 && ma < 0.03) {
    const lat = card.coords.lat;
    // Rough northern hemisphere ice sheet extent
    if (lat > 55 && card.coords.lng > -30 && card.coords.lng < 40) {
      lines.push("This place was likely under glacial ice during the Last Glacial Maximum.");
    } else if (lat > 50) {
      lines.push("This place was near the margins of the great ice sheets.");
    } else if (lat > 40) {
      lines.push("Sea levels were ~120 metres lower. Coastlines were far from here.");
    }
  }

  // 4. Nearby fossils
  if (nearbyFossilCount && nearbyFossilCount > 0) {
    const periodNote = nearbyFossilPeriod ? ` from the ${nearbyFossilPeriod}` : "";
    if (nearbyFossilCount === 1) {
      lines.push(`A fossil occurrence${periodNote} is recorded near this location.`);
    } else {
      lines.push(`${nearbyFossilCount} fossil occurrences${periodNote} are recorded nearby.`);
    }
  }

  return lines.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Era-based fallback lines (when no Ma selected)
// ---------------------------------------------------------------------------

function getEraLines(card: PlaceCard): string[] {
  switch (card.era) {
    case "geological":
      return ["This site records deep geological time."];
    case "prehistoric":
      return ["This place bears traces of prehistoric human activity."];
    case "ancient":
      return ["This place has roots in the ancient world."];
    case "medieval":
      return ["This place was shaped during the medieval period."];
    case "modern":
    default:
      return [];
  }
}
