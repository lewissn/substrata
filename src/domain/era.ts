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
  modern: "rgba(180,180,190,0.9)",
  medieval: "rgba(120,148,180,0.9)",
  ancient: "rgba(212,168,80,0.9)",
  prehistoric: "rgba(185,140,80,0.9)",
  geological: "rgba(180,70,70,0.9)",
};

export const ERA_CLUSTER_COLORS: Record<Era, string> = {
  modern: "rgba(140,140,150,0.85)",
  medieval: "rgba(90,120,160,0.85)",
  ancient: "rgba(180,140,60,0.85)",
  prehistoric: "rgba(155,115,60,0.85)",
  geological: "rgba(150,55,55,0.85)",
};

export const ERA_ACCENTS: Record<Era, string> = {
  geological: "#b44646",
  prehistoric: "#b98c50",
  ancient: "#d4a850",
  medieval: "#7894b4",
  modern: "#a0a0b0",
};
