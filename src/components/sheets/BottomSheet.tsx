"use client";

import type { ReactNode } from "react";
import { useBottomSheet, type SnapPoint } from "@/hooks/useBottomSheet";

// ---------------------------------------------------------------------------
// BottomSheet — fixed-position sheet with drag handle + snap points
// ---------------------------------------------------------------------------

export default function BottomSheet({
  snapPoint,
  onSnapChange,
  children,
  label,
}: {
  snapPoint: SnapPoint;
  onSnapChange: (sp: SnapPoint) => void;
  children: ReactNode;
  label?: string;
}) {
  const {
    sheetStyle,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging,
  } = useBottomSheet(snapPoint, onSnapChange);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border-t border-[rgba(255,255,255,0.09)] bg-[rgba(9,9,11,0.97)] backdrop-blur-xl shadow-drawer"
      style={sheetStyle}
    >
      {/* ── Drag handle ── */}
      <div
        className="sheet-handle flex flex-col items-center justify-center h-11 cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="w-10 h-1 rounded-full bg-zinc-600" />
        {label && (
          <span className="text-[10px] text-zinc-500 mt-1.5 uppercase tracking-widest font-medium">
            {label}
          </span>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div
        className={[
          "sheet-container",
          snapPoint === "collapsed" || isDragging ? "overflow-hidden" : "overflow-y-auto",
        ].join(" ")}
        style={{
          height: `calc(100% - 44px)`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
