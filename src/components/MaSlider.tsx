"use client";

import { MA_PRESETS, formatMa } from "@/domain/time";

// Ma slider uses a logarithmic scale so both 0.02 Ma and 500 Ma are usable.
// Internal slider value: 0–100 linearly.
// Maps to Ma via log scale: 0 → 0 Ma, 100 → 750 Ma.

const MA_MAX = 750;
const SLIDER_MAX = 100;

function sliderToMa(v: number): number {
  if (v <= 0) return 0;
  // Exponential: 0→0, 100→750 via log curve
  return MA_MAX * Math.pow(v / SLIDER_MAX, 3);
}

function maToSlider(ma: number): number {
  if (ma <= 0) return 0;
  return SLIDER_MAX * Math.pow(ma / MA_MAX, 1 / 3);
}

export default function MaSlider({
  ma,
  onMaChange,
}: {
  ma: number;
  onMaChange: (ma: number) => void;
}) {
  const sliderVal = maToSlider(ma);

  return (
    <div>
      {/* Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-zinc-600 w-12 text-right">Now</span>
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          step={0.5}
          value={sliderVal}
          onChange={(e) => {
            const v = Number(e.target.value);
            onMaChange(sliderToMa(v));
          }}
          className="flex-1 h-1 accent-[rgb(var(--accent))] cursor-pointer slider-deep"
        />
        <span className="text-[10px] text-zinc-600 w-14">{formatMa(MA_MAX)}</span>
      </div>

      {/* Current value */}
      <div className="text-center mt-1.5">
        <span className="text-[12px] font-medium text-zinc-300">{formatMa(ma)}</span>
        {ma > 0 && <span className="text-[10px] text-zinc-600 ml-1">ago</span>}
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1 mt-2.5">
        {MA_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => onMaChange(p.ma)}
            title={p.description}
            className={[
              "px-2 py-1 rounded-md text-[10px] border transition-all duration-150",
              Math.abs(ma - p.ma) < 0.001
                ? "bg-[rgba(var(--accent),0.16)] border-[rgba(var(--accent),0.32)] text-zinc-50 font-medium"
                : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-zinc-500 hover:text-zinc-300 hover:bg-[rgba(255,255,255,0.05)]",
            ].join(" ")}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
