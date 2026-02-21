"use client";

import { formatSeaLevel } from "@/domain/lgm";

// ---------------------------------------------------------------------------
// Sea Level Slider — full range from +170m to -120m
// ---------------------------------------------------------------------------

const SEA_LEVEL_STEPS = [170, 100, 50, 20, 0, -20, -60, -120] as const;
const STEP_COUNT = SEA_LEVEL_STEPS.length - 1; // 7 steps

/** Find the index of the step nearest to a given value */
function nearestStepIndex(value: number): number {
  let best = 0;
  for (let i = 1; i < SEA_LEVEL_STEPS.length; i++) {
    if (Math.abs(SEA_LEVEL_STEPS[i] - value) < Math.abs(SEA_LEVEL_STEPS[best] - value)) {
      best = i;
    }
  }
  return best;
}

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

      {/* Slider — left = high (positive), right = low (negative) */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-zinc-600 w-10 text-right">+170m</span>
        <input
          type="range"
          min={0}
          max={STEP_COUNT}
          step={1}
          value={nearestStepIndex(displayValue)}
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
          isOverridden ? "text-[#89CDD1]" : "text-zinc-400",
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
            {step > 0 ? `+${step}` : `${step}`}m
          </button>
        ))}
      </div>
    </div>
  );
}
