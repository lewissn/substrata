import type { Era } from "./placeCard";

export const ERA_ORDER: Era[] = [
  "geological",
  "prehistoric",
  "ancient",
  "medieval",
  "modern",
];

export const ERA_LABELS: Record<Era, string> = {
  geological: "Geological",
  prehistoric: "Prehistoric",
  ancient: "Ancient",
  medieval: "Medieval",
  modern: "Modern",
};

export const ERA_COLORS: Record<Era, string> = {
  modern: "rgba(180,180,190,0.9)",       // light grey
  medieval: "rgba(120,148,180,0.9)",     // cool blue-grey
  ancient: "rgba(212,168,80,0.9)",       // warm gold
  prehistoric: "rgba(185,140,80,0.9)",   // muted amber
  geological: "rgba(180,70,70,0.9)",     // deep red accent
};

export const ERA_CLUSTER_COLORS: Record<Era, string> = {
  modern: "rgba(140,140,150,0.85)",
  medieval: "rgba(90,120,160,0.85)",
  ancient: "rgba(180,140,60,0.85)",
  prehistoric: "rgba(155,115,60,0.85)",
  geological: "rgba(150,55,55,0.85)",
};

/** Human-readable time range string for display in the drawer. */
export function formatEraRange(yearStart?: number, yearEnd?: number): string {
  if (yearStart == null && yearEnd == null) return "";
  const fmt = (y: number) => {
    const abs = Math.abs(y);
    return y < 0 ? `${abs} BCE` : `${y} CE`;
  };
  if (yearStart != null && yearEnd != null) {
    return `c. ${fmt(yearStart)} – ${fmt(yearEnd)}`;
  }
  if (yearStart != null) return `c. ${fmt(yearStart)}`;
  return `c. ${fmt(yearEnd!)}`;
}
