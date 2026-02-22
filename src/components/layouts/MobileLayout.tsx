"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Map from "@/components/Map";
import BottomSheet from "@/components/sheets/BottomSheet";
import FeedSheet from "@/components/sheets/FeedSheet";
import DetailSheet from "@/components/sheets/DetailSheet";
import TimeSheet from "@/components/sheets/TimeSheet";
import FindsSheet from "@/components/sheets/FindsSheet";
import DiscoverSheet from "@/components/discover/DiscoverSheet";
import ThisPlacePanel from "@/components/ThisPlacePanel";
import MobileSearchBar from "@/components/mobile/MobileSearchBar";
import FloatingControls from "@/components/mobile/FloatingControls";
import { ActiveOverlays } from "@/components/ui/ActiveOverlays";
import type { SnapPoint } from "@/hooks/useBottomSheet";
import type { LayoutProps } from "./LayoutProps";
import type { SavedPlace } from "@/domain/savedPlaces";
import { getInitialSheet, persistSheet, type SheetType } from "@/state/sheetState";

// ---------------------------------------------------------------------------
// MobileLayout — map-first layout with bottom sheets
// Sheet state persists: minimising does NOT change active sheet; re-open restores it.
// ---------------------------------------------------------------------------

type SheetMode = "place" | "feed" | "detail" | "time" | "finds" | "discover";

const STORED_TO_MODE: Record<SheetType, SheetMode> = {
  thisPlace: "place",
  nearby: "feed",
  deepTime: "time",
  archive: "discover",
  finds: "finds",
  detail: "place",
};

function modeToStored(mode: SheetMode): SheetType {
  const map: Record<SheetMode, SheetType> = {
    place: "thisPlace",
    feed: "nearby",
    detail: "detail",
    time: "deepTime",
    finds: "finds",
    discover: "archive",
  };
  return map[mode];
}

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
    historicalYears, onHistoricalYearsChange,
    seaLevelOverride, onSeaLevelChange,
    overlayBoost, onOverlayBoostToggle,
    paleoEnabled, onPaleoToggle,
    paleoOpacity, onPaleoOpacityChange,
    paleoData, coastlineGeoJSON,
    center, onCenterChange,
    mapTheme, onMapThemeChange,
    nearbyFossilCount, onSurpriseMe,
    savedPlaces, onSavePlace, onUnsavePlace, onRestoreFind, onViewOnMap,
    activePlace, dropPinMode, droppedPin,
    onToggleDropPinMode, onDropPin, onClearPlace,     onSetTimeStop, onFlyToPlace,
    onTryThisPreset, tryThisAppliedStopKey, onClearTryThisApplied,
  } = props;

  // Restore last active sheet from localStorage; default "place" only on first load
  const [sheetMode, setSheetModeState] = useState<SheetMode>(() => {
    const stored = getInitialSheet();
    return STORED_TO_MODE[stored] ?? "place";
  });
  const [snapPoint, setSnapPoint] = useState<SnapPoint>("collapsed");

  const setSheetMode = useCallback((mode: SheetMode) => {
    setSheetModeState(mode);
    persistSheet(modeToStored(mode));
  }, []);

  // When user explicitly selects a card, switch to detail (explicit action)
  useEffect(() => {
    if (selected) {
      setSheetMode("detail");
      setSnapPoint("half");
    }
  }, [selected, setSheetMode]);

  // If selection is cleared while in detail (e.g. close button), show This Place
  useEffect(() => {
    if (!selected && sheetMode === "detail") {
      setSheetMode("place");
    }
  }, [selected, sheetMode, setSheetMode]);

  // When the user places a pin, re-open This Place so the content is visible
  const prevDropPinRef = useRef(dropPinMode);
  useEffect(() => {
    const wasDropping = prevDropPinRef.current;
    prevDropPinRef.current = dropPinMode;
    if (wasDropping && !dropPinMode && activePlace) {
      setSheetMode("place");
      setSnapPoint("half");
    }
  }, [dropPinMode, activePlace, setSheetMode]);

  const handleCardSelect = useCallback(
    (card: Parameters<typeof onCardSelect>[0]) => onCardSelect(card),
    [onCardSelect]
  );

  const handleCloseDetail = useCallback(() => {
    onCloseSelected();
    setSheetMode("place");
    setSnapPoint("collapsed");
  }, [onCloseSelected, setSheetMode]);

  // Minimising does NOT change activeSheet; re-opening restores same sheet
  const handleSnapChange = useCallback((sp: SnapPoint) => {
    setSnapPoint(sp);
  }, []);

  const openPlace = useCallback(() => { setSheetMode("place"); setSnapPoint("half"); }, [setSheetMode]);
  const openFeed = useCallback(() => { setSheetMode("feed"); setSnapPoint("half"); }, [setSheetMode]);
  const openTime = useCallback(() => { setSheetMode("time"); setSnapPoint("half"); }, [setSheetMode]);
  const openFinds = useCallback(() => { setSheetMode("finds"); setSnapPoint("half"); }, [setSheetMode]);
  const openDiscover = useCallback(() => { setSheetMode("discover"); setSnapPoint("half"); }, [setSheetMode]);

  const isSaved = selected ? savedPlaces.some((p) => p.id === selected.id) : false;

  const handleToggleSave = useCallback(() => {
    if (!selected) return;
    isSaved ? onUnsavePlace(selected.id) : onSavePlace(selected);
  }, [selected, isSaved, onSavePlace, onUnsavePlace]);

  const handleRestoreFind = useCallback(
    (place: SavedPlace) => {
      onRestoreFind(place);
      setSheetMode("place");
      setSnapPoint("collapsed");
    },
    [onRestoreFind]
  );

  // "View on map" collapses the sheet so user can see the map
  const handleFlyToPlace = useCallback(() => {
    onFlyToPlace();
    setSnapPoint("collapsed");
  }, [onFlyToPlace]);

  // Activating drop pin mode collapses the sheet so user can tap the map
  const handleActivateDropPin = useCallback(() => {
    onToggleDropPinMode();
    setSnapPoint("collapsed");
  }, [onToggleDropPinMode]);

  const interactionEnabled = snapPoint === "collapsed";

  const sheetLabel =
    sheetMode === "place" ? "This Place"
    : sheetMode === "feed" ? "Nearby"
    : sheetMode === "detail" ? "Details"
    : sheetMode === "finds" ? "My Finds"
    : sheetMode === "discover" ? "Archive"
    : "Time & Filters";

  const sheetAccent =
    sheetMode === "place" ? "teal" as const
    : sheetMode === "feed" || sheetMode === "detail" ? "gold" as const
    : sheetMode === "time" ? "slate" as const
    : sheetMode === "discover" ? "sepia" as const
    : "zinc" as const;

  const handleViewOnMap = useCallback(
    (params: { lat: number; lng: number; ma?: number }) => {
      onViewOnMap(params);
      setSheetMode("place");
      setSnapPoint("collapsed");
    },
    [onViewOnMap]
  );

  return (
    <div className="fixed inset-0 overflow-hidden">
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
        dropPinMode={dropPinMode}
        droppedPin={droppedPin}
        onDropPin={onDropPin}
      />

      <ActiveOverlays
        ma={deepTimeEnabled ? ma : 0}
        deepTimeEnabled={deepTimeEnabled}
        seaLevelOverride={seaLevelOverride}
        overlayBoost={overlayBoost}
        paleoEnabled={paleoEnabled}
      />

      <div className="absolute bottom-[100px] right-2 text-[8px] text-zinc-700 pointer-events-none z-10">
        OSM &middot; PBDB &middot; GPlates
      </div>

      <MobileSearchBar
        query={query}
        onQueryChange={onQueryChange}
        onGeocode={onGeocode}
        onSearchArea={onSearchArea}
        loading={loading}
      />

      <FloatingControls
        onOpenPlace={openPlace}
        onOpenFeed={openFeed}
        onOpenTime={openTime}
        onOpenFinds={openFinds}
        onOpenArchive={openDiscover}
        onToggleSave={handleToggleSave}
        onActivateDropPin={handleActivateDropPin}
        sheetSnap={snapPoint}
        hasActiveFilters={hasActiveFilters}
        isCardSelected={!!selected}
        isCardSaved={isSaved}
        dropPinMode={dropPinMode}
        hasActivePlace={!!activePlace}
      />

      <BottomSheet snapPoint={snapPoint} onSnapChange={handleSnapChange} label={sheetLabel} accent={sheetAccent}>
        {/* Render all sheets; hide inactive so scroll position is preserved when switching */}
        <div className="relative h-full">
          <div
            className="absolute inset-0 h-full overflow-y-auto"
            style={{ visibility: sheetMode === "place" ? "visible" : "hidden", pointerEvents: sheetMode === "place" ? "auto" : "none" }}
          >
            <ThisPlacePanel
              activePlace={activePlace}
              paleoData={paleoData}
              dropPinMode={dropPinMode}
              onActivateDropPin={handleActivateDropPin}
              onClearPlace={onClearPlace}
              onSetTimeStop={onSetTimeStop}
              onFlyToPlace={handleFlyToPlace}
              onTryThisPreset={onTryThisPreset}
              tryThisAppliedStopKey={tryThisAppliedStopKey}
              onClearTryThisApplied={onClearTryThisApplied}
            />
          </div>
          <div
            className="absolute inset-0 h-full overflow-y-auto"
            style={{ visibility: sheetMode === "feed" ? "visible" : "hidden", pointerEvents: sheetMode === "feed" ? "auto" : "none" }}
          >
            <FeedSheet
              cards={rankedCards}
              newCardIds={newCardIds}
              loading={loading}
              error={error}
              onCardSelect={handleCardSelect}
              onSearchArea={onSearchArea}
              onSurpriseMe={onSurpriseMe}
              onOpenDiscover={openDiscover}
              onWander={props.onWander}
              activeEra={activeEra}
              onEraChange={onEraChange}
              activeSources={activeSources}
              onToggleSource={onToggleSource}
              activeKinds={activeKinds}
              onToggleKind={onToggleKind}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={onResetFilters}
              hasPbdb={cards.some((c) => c.source === "pbdb")}
            />
          </div>
          <div
            className="absolute inset-0 h-full overflow-y-auto"
            style={{ visibility: sheetMode === "detail" && selected ? "visible" : "hidden", pointerEvents: sheetMode === "detail" && selected ? "auto" : "none" }}
          >
            {selected && (
              <DetailSheet
                card={selected}
                onClose={handleCloseDetail}
                ma={deepTimeEnabled ? ma : null}
                paleoLat={paleoData?.paleoLat}
                paleoLng={paleoData?.paleoLng}
                nearbyFossilCount={nearbyFossilCount}
                isSaved={isSaved}
                onToggleSave={handleToggleSave}
                seaLevelOverride={seaLevelOverride}
                paleoEnabled={paleoEnabled}
                overlayBoost={overlayBoost}
              />
            )}
          </div>
          <div
            className="absolute inset-0 h-full overflow-y-auto"
            style={{ visibility: sheetMode === "time" ? "visible" : "hidden", pointerEvents: sheetMode === "time" ? "auto" : "none" }}
          >
            <TimeSheet
              activeEra={activeEra}
              onEraChange={onEraChange}
              deepTimeEnabled={deepTimeEnabled}
              onDeepTimeToggle={onDeepTimeToggle}
              ma={ma}
              onMaChange={onMaChange}
              historicalYears={historicalYears}
              onHistoricalYearsChange={onHistoricalYearsChange}
              seaLevelOverride={seaLevelOverride}
              onSeaLevelChange={onSeaLevelChange}
              overlayBoost={overlayBoost}
              onOverlayBoostToggle={onOverlayBoostToggle}
              paleoEnabled={paleoEnabled}
              onPaleoToggle={onPaleoToggle}
              paleoOpacity={paleoOpacity}
              onPaleoOpacityChange={onPaleoOpacityChange}
              paleoData={paleoData}
              mapTheme={mapTheme}
              onMapThemeChange={onMapThemeChange}
            />
          </div>
          <div
            className="absolute inset-0 h-full overflow-y-auto"
            style={{ visibility: sheetMode === "finds" ? "visible" : "hidden", pointerEvents: sheetMode === "finds" ? "auto" : "none" }}
          >
            <FindsSheet
              saves={savedPlaces}
              onSelect={handleRestoreFind}
              onUnsave={onUnsavePlace}
            />
          </div>
          <div
            className="absolute inset-0 h-full overflow-y-auto"
            style={{ visibility: sheetMode === "discover" ? "visible" : "hidden", pointerEvents: sheetMode === "discover" ? "auto" : "none" }}
          >
            <DiscoverSheet onViewOnMap={handleViewOnMap} />
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
