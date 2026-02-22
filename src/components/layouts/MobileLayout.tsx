"use client";

import { useCallback, useEffect, useState } from "react";
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

// ---------------------------------------------------------------------------
// MobileLayout — map-first layout with bottom sheets
// ---------------------------------------------------------------------------

type SheetMode = "place" | "feed" | "detail" | "time" | "finds" | "discover";

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
    onToggleDropPinMode, onDropPin, onClearPlace, onSetTimeStop, onFlyToPlace,
  } = props;

  // Default to "place" — This Place is the primary front view
  const [sheetMode, setSheetMode] = useState<SheetMode>("place");
  const [snapPoint, setSnapPoint] = useState<SnapPoint>("collapsed");

  useEffect(() => {
    if (selected) {
      setSheetMode("detail");
      setSnapPoint("half");
    }
  }, [selected]);

  const handleCardSelect = useCallback(
    (card: Parameters<typeof onCardSelect>[0]) => onCardSelect(card),
    [onCardSelect]
  );

  const handleCloseDetail = useCallback(() => {
    onCloseSelected();
    setSheetMode("place");
    setSnapPoint("collapsed");
  }, [onCloseSelected]);

  const handleSnapChange = useCallback(
    (sp: SnapPoint) => {
      setSnapPoint(sp);
      if (
        sp === "collapsed" &&
        (sheetMode === "time" || sheetMode === "finds" || sheetMode === "discover" || sheetMode === "feed")
      ) {
        setSheetMode("place");
      }
      if (sp === "collapsed" && sheetMode === "detail") {
        onCloseSelected();
        setSheetMode("place");
      }
    },
    [sheetMode, onCloseSelected]
  );

  const openPlace = useCallback(() => { setSheetMode("place"); setSnapPoint("half"); }, []);
  const openFeed = useCallback(() => { setSheetMode("feed"); setSnapPoint("half"); }, []);
  const openTime = useCallback(() => { setSheetMode("time"); setSnapPoint("half"); }, []);
  const openFinds = useCallback(() => { setSheetMode("finds"); setSnapPoint("half"); }, []);
  const openDiscover = useCallback(() => { setSheetMode("discover"); setSnapPoint("half"); }, []);

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
        onToggleSave={handleToggleSave}
        onActivateDropPin={handleActivateDropPin}
        sheetSnap={snapPoint}
        hasActiveFilters={hasActiveFilters}
        isCardSelected={!!selected}
        isCardSaved={isSaved}
        dropPinMode={dropPinMode}
        hasActivePlace={!!activePlace}
      />

      <BottomSheet snapPoint={snapPoint} onSnapChange={handleSnapChange} label={sheetLabel}>
        {sheetMode === "place" && (
          <ThisPlacePanel
            activePlace={activePlace}
            paleoData={paleoData}
            dropPinMode={dropPinMode}
            onActivateDropPin={handleActivateDropPin}
            onClearPlace={onClearPlace}
            onSetTimeStop={onSetTimeStop}
            onFlyToPlace={handleFlyToPlace}
          />
        )}

        {sheetMode === "feed" && (
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
        )}

        {sheetMode === "detail" && selected && (
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

        {sheetMode === "time" && (
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
        )}

        {sheetMode === "finds" && (
          <FindsSheet
            saves={savedPlaces}
            onSelect={handleRestoreFind}
            onUnsave={onUnsavePlace}
          />
        )}

        {sheetMode === "discover" && (
          <DiscoverSheet onViewOnMap={handleViewOnMap} />
        )}
      </BottomSheet>
    </div>
  );
}
