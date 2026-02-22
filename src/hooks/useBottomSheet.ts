"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SnapPoint = "collapsed" | "half" | "full";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Visible height when collapsed (px) */
const COLLAPSED_PX = 96;
/** Sheet height as fraction of viewport height */
const SHEET_VH = 0.92;
/** Half snap as fraction of viewport height */
const HALF_VH = 0.50;
/** Velocity threshold for directional snap (px/ms) */
const VELOCITY_THRESHOLD = 0.4;

// ---------------------------------------------------------------------------
// Hook — fully controlled: snap point is owned by the parent
// ---------------------------------------------------------------------------

export function useBottomSheet(
  snapPoint: SnapPoint,
  setSnapPoint: (sp: SnapPoint) => void,
) {
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for drag tracking (avoid re-renders mid-gesture)
  const startYRef = useRef(0);
  const startTranslateRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const draggingRef = useRef(false);
  const vhRef = useRef(
    typeof window !== "undefined"
      ? (window.visualViewport?.height ?? window.innerHeight)
      : 800
  );

  // Keep viewport height up to date.
  // On Safari iOS, window.innerHeight uses the *static* viewport (toolbar hidden),
  // but visualViewport.height gives the *dynamic* height (toolbar visible).
  // We listen to both resize events so the sheet stays in sync with toolbar changes.
  useEffect(() => {
    const getHeight = () => window.visualViewport?.height ?? window.innerHeight;
    vhRef.current = getHeight();
    function onResize() {
      vhRef.current = getHeight();
    }
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  // Compute translateY for a given snap point
  const snapToTranslateY = useCallback((sp: SnapPoint): number => {
    const vh = vhRef.current;
    const sheetH = vh * SHEET_VH;
    switch (sp) {
      case "collapsed":
        return sheetH - COLLAPSED_PX;
      case "half":
        return sheetH - vh * HALF_VH;
      case "full":
        return 0;
    }
  }, []);

  // ── Pointer handlers (bind to drag handle) ──

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      draggingRef.current = true;
      setIsDragging(true);
      startYRef.current = e.clientY;
      startTranslateRef.current = snapToTranslateY(snapPoint);
      lastYRef.current = e.clientY;
      lastTimeRef.current = e.timeStamp;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [snapPoint, snapToTranslateY]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dy = e.clientY - startYRef.current;
    const vh = vhRef.current;
    const sheetH = vh * SHEET_VH;
    const maxTranslate = sheetH - COLLAPSED_PX;
    const newY = Math.max(0, Math.min(maxTranslate, startTranslateRef.current + dy));
    setDragOffset(newY);
    lastYRef.current = e.clientY;
    lastTimeRef.current = e.timeStamp;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setIsDragging(false);

      const dt = e.timeStamp - lastTimeRef.current;
      const dy = e.clientY - lastYRef.current;
      const velocity = dt > 0 ? dy / dt : 0;

      const vh = vhRef.current;
      const sheetH = vh * SHEET_VH;
      const maxTranslate = sheetH - COLLAPSED_PX;
      const currentY = Math.max(
        0,
        Math.min(maxTranslate, startTranslateRef.current + (e.clientY - startYRef.current))
      );

      const snaps = {
        full: 0,
        half: sheetH - vh * HALF_VH,
        collapsed: maxTranslate,
      };

      let target: SnapPoint;

      if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
        if (velocity > 0) {
          target = currentY < snaps.half ? "half" : "collapsed";
        } else {
          target = currentY > snaps.half ? "half" : "full";
        }
      } else {
        const distances: [SnapPoint, number][] = [
          ["full", Math.abs(currentY - snaps.full)],
          ["half", Math.abs(currentY - snaps.half)],
          ["collapsed", Math.abs(currentY - snaps.collapsed)],
        ];
        distances.sort((a, b) => a[1] - b[1]);
        target = distances[0][0];
      }

      setDragOffset(null);
      setSnapPoint(target);
    },
    [setSnapPoint, snapToTranslateY]
  );

  // ── Compute style ──

  const translateY = dragOffset ?? snapToTranslateY(snapPoint);

  const sheetStyle: React.CSSProperties = {
    transform: `translateY(${translateY}px)`,
    transition: isDragging ? "none" : "transform 220ms ease",
    willChange: "transform",
    // dvh tracks the dynamic viewport (Safari toolbar show/hide) so the JS
    // translateY calculations and the CSS height stay in sync on iOS Safari.
    height: `${SHEET_VH * 100}dvh`,
  };

  return {
    sheetStyle,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging,
  };
}
