"use client";

import { useCallback, useEffect, useState } from "react";
import Map from "@/components/Map";
import BottomSheet from "@/components/sheets/BottomSheet";
import FeedSheet from "@/components/sheets/FeedSheet";
import DetailSheet from "@/components/sheets/DetailSheet";
import TimeSheet from "@/components/sheets/TimeSheet";
import MobileSearchBar from "@/components/mobile/MobileSearchBar";
import FloatingControls from "@/components/mobile/FloatingControls";
import { ActiveOverlays } from "@/components/ui/ActiveOverlays";
import type { SnapPoint } from "@/hooks/useBottomSheet";
import type { LayoutProps } from "./LayoutProps";

// ---------------------------------------------------------------------------
// MobileLayout — map-first layout with bottom sheets
// ---------------------------------------------------------------------------

type SheetMode = "feed" | "detail" | "time";

export default function MobileLayout(props: LayoutProps) {
  const {
    query, onQueryChange, onGeocode, onSearchArea, loading,
    cards, rankedCards, newCardIds, error,
    selected, onCardSelect, onCloseSelected,
    activeSources, onToggleSource,
    activeKinds, onToggleKind,
    hasActiveFilters, onResetFilters,
    activeEra, onEraChange,
    deepTimeEnabled, onDeepTimeToggle,
    ma, onMaChange,
    seaLevelOverride, onSeaLevelChange,
    overlayBoost, onOverlayBoostToggle,
    paleoEnabled, onPaleoToggle,
    paleoOpacity, onPaleoOpacityChange,
    paleoData, coastlineGeoJSON,
    center, onCenterChange,
    mapTheme, onMapThemeChange,
    nearbyFossilCount, onSurpriseMe,
  } = props;

  // ── Sheet state ──
  const [sheetMode, setSheetMode] = useState<SheetMode>("feed");
  const [snapPoint, setSnapPoint] = useState<SnapPoint>("collapsed");

  // ── When a card is selected, show detail sheet ──
  useEffect(() => {
    if (selected) {
      setSheetMode("detail");
      setSnapPoint("half");
    }
  }, [selected]);

  // ── Handle card selection from feed ──
  const handleCardSelect = useCallback(
    (card: Parameters<typeof onCardSelect>[0]) => {
      onCardSelect(card);
      // The useEffect above will switch to detail mode
    },
    [onCardSelect]
  );

  // ── Handle closing detail → return to feed ──
  const handleCloseDetail = useCallback(() => {
    onCloseSelected();
    setSheetMode("feed");
    setSnapPoint("collapsed");
  }, [onCloseSelected]);

  // ── Handle snap changes (e.g. collapsing time sheet returns to feed) ──
  const handleSnapChange = useCallback(
    (sp: SnapPoint) => {
      setSnapPoint(sp);
      if (sp === "collapsed" && sheetMode === "time") {
        setSheetMode("feed");
      }
      if (sp === "collapsed" && sheetMode === "detail") {
        // Collapsing detail closes it
        onCloseSelected();
        setSheetMode("feed");
      }
    },
    [sheetMode, onCloseSelected]
  );

  // ── FAB handlers ──
  const openFeed = useCallback(() => {
    setSheetMode("feed");
    setSnapPoint("half");
  }, []);

  const openTime = useCallback(() => {
    setSheetMode("time");
    setSnapPoint("half");
  }, []);

  // ── Map interaction: disabled when sheet is expanded ──
  const interactionEnabled = snapPoint === "collapsed";

  // ── Sheet label ──
  const sheetLabel =
    sheetMode === "feed"
      ? "Discover"
      : sheetMode === "detail"
      ? "Details"
      : "Time & Filters";

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* ── Full-screen map ── */}
      <Map
        center={center}
        onCenterChange={onCenterChange}
        cards={rankedCards}
        selectedId={selected?.id ?? null}
        onSelect={handleCardSelect}
        focusOffsetPx={0}
        ma={deepTimeEnabled ? ma : 0}
        coastlineGeoJSON={deepTimeEnabled ? coastlineGeoJSON : null}
        activeEra={activeEra}
        deepTimeEnabled={deepTimeEnabled}
        interactionEnabled={interactionEnabled}
        seaLevelOverride={seaLevelOverride}
        overlayBoost={overlayBoost}
        paleoEnabled={deepTimeEnabled ? paleoEnabled : false}
        paleoOpacity={paleoOpacity}
        mapTheme={mapTheme}
      />

      {/* ── Active overlays indicator ── */}
      <ActiveOverlays
        ma={deepTimeEnabled ? ma : 0}
        deepTimeEnabled={deepTimeEnabled}
        seaLevelOverride={seaLevelOverride}
        overlayBoost={overlayBoost}
        paleoEnabled={paleoEnabled}
      />

      {/* ── Attribution ── */}
      <div className="absolute bottom-[100px] right-2 text-[8px] text-zinc-700 pointer-events-none z-10">
        OSM &middot; PBDB &middot; GPlates
      </div>

      {/* ── Floating search bar ── */}
      <MobileSearchBar
        query={query}
        onQueryChange={onQueryChange}
        onGeocode={onGeocode}
        onSearchArea={onSearchArea}
        loading={loading}
      />

      {/* ── Floating controls ── */}
      <FloatingControls
        onOpenFeed={openFeed}
        onOpenTime={openTime}
        onSurpriseMe={onSurpriseMe}
        sheetSnap={snapPoint}
        hasActiveFilters={hasActiveFilters}
        hasCards={rankedCards.length > 0}
      />

      {/* ── Bottom sheet ── */}
      <BottomSheet
        snapPoint={snapPoint}
        onSnapChange={handleSnapChange}
        label={sheetLabel}
      >
        {sheetMode === "feed" && (
          <FeedSheet
            cards={rankedCards}
            newCardIds={newCardIds}
            loading={loading}
            error={error}
            onCardSelect={handleCardSelect}
            onSearchArea={onSearchArea}
            onSurpriseMe={onSurpriseMe}
          />
        )}

        {sheetMode === "detail" && selected && (
          <DetailSheet
            card={selected}
            onClose={handleCloseDetail}
            ma={deepTimeEnabled ? ma : null}
            paleoLat={paleoData?.paleoLat}
            paleoLng={paleoData?.paleoLng}
            nearbyFossilCount={nearbyFossilCount}
          />
        )}

        {sheetMode === "time" && (
          <TimeSheet
            activeEra={activeEra}
            onEraChange={onEraChange}
            deepTimeEnabled={deepTimeEnabled}
            onDeepTimeToggle={onDeepTimeToggle}
            ma={ma}
            onMaChange={onMaChange}
            seaLevelOverride={seaLevelOverride}
            onSeaLevelChange={onSeaLevelChange}
            overlayBoost={overlayBoost}
            onOverlayBoostToggle={onOverlayBoostToggle}
            paleoEnabled={paleoEnabled}
            onPaleoToggle={onPaleoToggle}
            paleoOpacity={paleoOpacity}
            onPaleoOpacityChange={onPaleoOpacityChange}
            paleoData={paleoData}
            activeSources={activeSources}
            onToggleSource={onToggleSource}
            activeKinds={activeKinds}
            onToggleKind={onToggleKind}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={onResetFilters}
            hasPbdb={cards.some((c) => c.source === "pbdb")}
            mapTheme={mapTheme}
            onMapThemeChange={onMapThemeChange}
          />
        )}
      </BottomSheet>
    </div>
  );
}
