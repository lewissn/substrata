"use client";

import { formatSeaLevel } from "@/domain/lgm";

// ---------------------------------------------------------------------------
// Sea Level Slider — discrete steps from 0 to -120m
// ---------------------------------------------------------------------------

const SEA_LEVEL_STEPS = [0, -20, -40, -60, -80, -100, -120] as const;
const STEP_COUNT = SEA_LEVEL_STEPS.length - 1; // 6 steps

export default function SeaLevelSlider({
  value,
  onChange,
  autoValue,
}: {
  /** Current override value (null = auto from Ma curve) */
  value: number | null;
  onChange: (v: number | null) => void;
  /** Auto-computed sea level from Ma (shown when no override) */
  autoValue: number;
}) {
  const displayValue = value ?? autoValue;
  const isOverridden = value !== null;

  // Map the display value to slider position (0 = 0m, 6 = -120m)
  const sliderPos = Math.round(Math.abs(Math.max(-120, Math.min(0, displayValue))) / 20);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-zinc-700 font-medium">
          Sea Level
        </span>
        {isOverridden && (
          <button
            onClick={() => onChange(null)}
            className="text-[10px] text-zinc-600 hover:text-zinc-400 transition underline underline-offset-2"
          >
            Reset to auto
          </button>
        )}
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-zinc-600 w-6 text-right">0m</span>
        <input
          type="range"
          min={0}
          max={STEP_COUNT}
          step={1}
          value={sliderPos}
          onChange={(e) => {
            const idx = Number(e.target.value);
            onChange(SEA_LEVEL_STEPS[idx]);
          }}
          className="flex-1 h-1 cursor-pointer slider-deep"
        />
        <span className="text-[10px] text-zinc-600 w-10">-120m</span>
      </div>

      {/* Current value display */}
      <div className="text-center">
        <span className={[
          "text-[12px] font-medium",
          isOverridden ? "text-sky-400/80" : "text-zinc-400",
        ].join(" ")}>
          {formatSeaLevel(displayValue)}
        </span>
        {!isOverridden && (
          <span className="text-[10px] text-zinc-600 ml-1">(auto)</span>
        )}
      </div>

      {/* Step markers */}
      <div className="flex justify-between px-[18px]">
        {SEA_LEVEL_STEPS.map((step) => (
          <button
            key={step}
            onClick={() => onChange(step)}
            className={[
              "text-[8px] transition",
              (value ?? autoValue) === step
                ? "text-zinc-300 font-medium"
                : "text-zinc-700 hover:text-zinc-500",
            ].join(" ")}
          >
            {step}m
          </button>
        ))}
      </div>
    </div>
  );
}
