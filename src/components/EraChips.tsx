"use client";

import type { Era } from "@/domain/placeCard";
import { ERA_ACCENTS } from "@/domain/era";

type EraChipDef = { era: Era; label: string };

const ERA_CHIP_LIST: EraChipDef[] = [
  { era: "geological", label: "Geological" },
  { era: "prehistoric", label: "Prehistoric" },
  { era: "ancient", label: "Ancient" },
  { era: "medieval", label: "Medieval" },
  { era: "modern", label: "Modern" },
];

export default function EraChips({
  activeEra,
  onEraChange,
}: {
  activeEra: Era | null;
  onEraChange: (era: Era | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Chip
        label="All"
        active={activeEra === null}
        onClick={() => onEraChange(null)}
      />
      {ERA_CHIP_LIST.map(({ era, label }) => (
        <Chip
          key={era}
          label={label}
          active={activeEra === era}
          onClick={() => onEraChange(activeEra === era ? null : era)}
          accent={ERA_ACCENTS[era]}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
        "backdrop-blur-sm select-none whitespace-nowrap",
        active
          ? accent
            ? ""
            : "bg-[rgba(var(--accent),0.16)] border-[rgba(var(--accent),0.32)] text-zinc-50"
          : "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)] text-zinc-400 hover:bg-[rgba(255,255,255,0.06)] hover:text-zinc-200 hover:border-[rgba(255,255,255,0.12)]",
      ].join(" ")}
      style={
        active && accent
          ? { backgroundColor: `${accent}22`, borderColor: `${accent}55`, color: "#f4f4f5" }
          : undefined
      }
    >
      {label}
    </button>
  );
}
