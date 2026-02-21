"use client";

// ---------------------------------------------------------------------------
// Map legend overlay (shown when deep time overlays are active)
// ---------------------------------------------------------------------------

export function MapLegend({ ma, hasCoastlines }: { ma: number; hasCoastlines: boolean }) {
  const isLGM = ma >= 0.015 && ma <= 0.03;

  if (!isLGM && !hasCoastlines) return null;

  return (
    <div className="absolute top-3 right-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(9,9,11,0.90)] backdrop-blur-md px-3 py-2.5 z-10 space-y-1.5 pointer-events-none">
      <div className="text-[9px] uppercase tracking-widest text-zinc-600 font-medium">Overlays</div>

      {isLGM && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(180,210,240,0.5)" }} />
            <span className="text-[10px] text-zinc-400">Ice sheets</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(170,150,100,0.4)" }} />
            <span className="text-[10px] text-zinc-400">Exposed land</span>
          </div>
        </>
      )}

      {hasCoastlines && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(120,160,100,0.3)", border: "1px solid rgba(120,160,100,0.5)" }} />
          <span className="text-[10px] text-zinc-400">Paleocoastlines</span>
        </div>
      )}
    </div>
  );
}
