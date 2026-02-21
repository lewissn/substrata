"use client";

import type { PlaceKind } from "@/domain/placeCard";

// ---------------------------------------------------------------------------
// Chip — reusable filter toggle
// ---------------------------------------------------------------------------

export function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
        "backdrop-blur-sm select-none whitespace-nowrap",
        active
          ? "bg-[rgba(31,90,92,0.22)] border-[rgba(44,111,116,0.42)] text-zinc-50"
          : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-zinc-400 hover:bg-[rgba(255,255,255,0.06)] hover:text-zinc-200 hover:border-[rgba(255,255,255,0.12)]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Kind chips config
// ---------------------------------------------------------------------------

export const KIND_CHIPS: Array<{ kind: PlaceKind; label: string }> = [
  { kind: "ruins", label: "Ruins" },
  { kind: "castle", label: "Castles" },
  { kind: "archaeological_site", label: "Archaeology" },
  { kind: "prehistoric_site", label: "Prehistoric Sites" },
  { kind: "megalith", label: "Megaliths" },
  { kind: "fossil_occurrence", label: "Fossils" },
  { kind: "memorial", label: "Memorials" },
  { kind: "monument", label: "Monuments" },
  { kind: "battlefield", label: "Battlefields" },
  { kind: "volcano", label: "Volcanoes" },
  { kind: "impact_crater", label: "Craters" },
  { kind: "attraction", label: "Attractions" },
  { kind: "historic", label: "Historic" },
];
