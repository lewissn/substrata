"use client";

import type { Era } from "@/domain/placeCard";
import EraChips from "./EraChips";
import MaSlider from "./MaSlider";

export default function TimeControls({
  activeEra,
  onEraChange,
  deepTimeEnabled,
  onDeepTimeToggle,
  ma,
  onMaChange,
}: {
  activeEra: Era | null;
  onEraChange: (era: Era | null) => void;
  deepTimeEnabled: boolean;
  onDeepTimeToggle: () => void;
  ma: number;
  onMaChange: (ma: number) => void;
}) {
  return (
    <div className="border-b border-[rgba(255,255,255,0.05)]">
      {/* Era chips row */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-700 font-medium">Era</span>
          <button
            onClick={onDeepTimeToggle}
            className={[
              "text-[10px] px-2.5 py-1 rounded-md border transition-all duration-150",
              deepTimeEnabled
                ? "bg-[rgba(var(--accent),0.14)] border-[rgba(var(--accent),0.30)] text-zinc-200 font-medium"
                : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-zinc-600 hover:text-zinc-400",
            ].join(" ")}
          >
            Deep Time (Ma)
          </button>
        </div>

        {!deepTimeEnabled && (
          <EraChips activeEra={activeEra} onEraChange={onEraChange} />
        )}
      </div>

      {/* Deep Time slider (conditionally shown) */}
      {deepTimeEnabled && (
        <div className="px-4 pb-3 pt-1">
          <MaSlider ma={ma} onMaChange={onMaChange} />
        </div>
      )}
    </div>
  );
}
