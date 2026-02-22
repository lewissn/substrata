"use client";

import type { ReactNode } from "react";
import { useBottomSheet, type SnapPoint } from "@/hooks/useBottomSheet";

// ---------------------------------------------------------------------------
// BottomSheet — fixed-position sheet with drag handle + snap points
// Mode accent: subtle top border + label color for sheet identity.
// ---------------------------------------------------------------------------

export type SheetAccent = "teal" | "gold" | "slate" | "sepia" | "zinc";

const ACCENT_STYLES: Record<SheetAccent, { border: string; label: string }> = {
  teal: {
    border: "border-t-[#2C6F74]",
    label: "text-[#89CDD1]",
  },
  gold: {
    border: "border-t-[rgba(180,150,90,0.7)]",
    label: "text-[#C4A86A]",
  },
  slate: {
    border: "border-t-[rgba(120,140,160,0.6)]",
    label: "text-[#8A9BA8]",
  },
  sepia: {
    border: "border-t-[rgba(160,130,95,0.65)]",
    label: "text-[#B8986E]",
  },
  zinc: {
    border: "border-t-[rgba(255,255,255,0.09)]",
    label: "text-zinc-500",
  },
};

export default function BottomSheet({
  snapPoint,
  onSnapChange,
  children,
  label,
  accent = "zinc",
}: {
  snapPoint: SnapPoint;
  onSnapChange: (sp: SnapPoint) => void;
  children: ReactNode;
  label?: string;
  accent?: SheetAccent;
}) {
  const {
    sheetStyle,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging,
  } = useBottomSheet(snapPoint, onSnapChange);

  const style = ACCENT_STYLES[accent];

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 rounded-t-2xl border-t-2 ${style.border} bg-[rgba(9,9,11,0.97)] backdrop-blur-xl shadow-drawer`}
      style={sheetStyle}
    >
      {/* ── Drag handle ── */}
      <div
        className="sheet-handle flex flex-col items-center justify-center h-11 cursor-grab active:cursor-grabbing min-h-[44px]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="w-10 h-1 rounded-full bg-zinc-600" />
        {label && (
          <span className={`text-[10px] mt-1.5 uppercase tracking-widest font-medium ${style.label}`}>
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
