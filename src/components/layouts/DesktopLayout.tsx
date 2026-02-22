"use client";

import { useState } from "react";
import Map from "@/components/Map";
import TimeControls from "@/components/TimeControls";
import Feed from "@/components/Feed";
import Drawer from "@/components/Drawer";
import FindsSheet from "@/components/sheets/FindsSheet";
import DiscoverSheet from "@/components/discover/DiscoverSheet";
import { Chip, KIND_CHIPS } from "@/components/ui/Chip";
import { ActiveOverlays } from "@/components/ui/ActiveOverlays";
import ThisPlacePanel from "@/components/ThisPlacePanel";
import type { LayoutProps } from "./LayoutProps";
import type { SavedPlace } from "@/domain/savedPlaces";

// ---------------------------------------------------------------------------
// DesktopLayout — map + sidebar
// ---------------------------------------------------------------------------

export default function DesktopLayout(props: LayoutProps) {
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
    savedPlaces, onSavePlace, onUnsavePlace, onRestoreFind, onViewOnMap,
    activePlace, dropPinMode, droppedPin,
    onToggleDropPinMode, onDropPin, onClearPlace, onSetTimeStop, onFlyToPlace,
  } = props;

  const [showFinds, setShowFinds] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [showThisPlace, setShowThisPlace] = useState(true);

  const isSaved = selected ? savedPlaces.some((p) => p.id === selected.id) : false;

  const handleRestoreFind = (place: SavedPlace) => {
    onRestoreFind(place);
    setShowFinds(false);
  };

  const handleViewOnMap = (params: { lat: number; lng: number; ma?: number }) => {
    onViewOnMap(params);
    setShowDiscover(false);
  };

  // Only one panel can be active at a time
  const toggleFinds = () => { setShowFinds((v) => !v); setShowDiscover(false); };
  const toggleDiscover = () => { setShowDiscover((v) => !v); setShowFinds(false); };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top bar ── */}
      <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,0.96)] backdrop-blur-md flex gap-2 items-center z-10">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onGeocode(); }}
            placeholder="Navigate to a place..."
            className="w-full px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-zinc-100 text-sm placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-[rgba(44,111,116,0.35)] focus:border-[rgba(44,111,116,0.40)] transition"
          />
        </div>
        <button
          onClick={onGeocode}
          className="px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] text-zinc-200 text-sm font-medium transition"
        >
          Go
        </button>
        <button
          onClick={onSearchArea}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl border border-[rgba(44,111,116,0.50)] bg-[#1F5A5C] hover:bg-[#2C6F74] text-zinc-50 text-sm font-semibold transition disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search area"}
        </button>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[rgba(9,9,11,1)] overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-[rgba(255,255,255,0.05)] flex-shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-100">Substrata</h1>
              <div className="flex items-center gap-1">
                {/* This Place toggle */}
                <button
                  onClick={() => { setShowThisPlace((v) => !v); setShowFinds(false); setShowDiscover(false); }}
                  title="This Place Through Time"
                  className={[
                    "p-1.5 rounded-md transition",
                    showThisPlace
                      ? "text-[#89CDD1] bg-[rgba(31,90,92,0.20)]"
                      : "text-zinc-600 hover:text-zinc-300",
                  ].join(" ")}
                  aria-label="This Place Through Time"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={showThisPlace ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    {!showThisPlace && <circle cx="12" cy="9" r="2.5" />}
                  </svg>
                </button>
                {/* Archive / Discover toggle */}
                <button
                  onClick={toggleDiscover}
                  title={showDiscover ? "Back to feed" : "Archive"}
                  className={[
                    "px-2 py-1 rounded-md text-[10px] transition",
                    showDiscover
                      ? "text-[#89CDD1] bg-[rgba(31,90,92,0.20)]"
                      : "text-zinc-600 hover:text-zinc-300",
                  ].join(" ")}
                  aria-label="Archive"
                >
                  Archive
                </button>
                {/* My Finds toggle */}
                <button
                  onClick={toggleFinds}
                  title={showFinds ? "Back to feed" : "My Finds"}
                  className={[
                    "p-1.5 rounded-md transition",
                    showFinds
                      ? "text-[#89CDD1] bg-[rgba(31,90,92,0.20)]"
                      : "text-zinc-600 hover:text-zinc-300",
                  ].join(" ")}
                  aria-label="My Finds"
                >
                  {showFinds ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  )}
                </button>
                <span className="text-[11px] text-zinc-600 min-w-[2rem] text-right">
                  {showFinds && savedPlaces.length > 0
                    ? `${savedPlaces.length} saved`
                    : !showFinds && !showDiscover && rankedCards.length > 0
                    ? `${rankedCards.length} places`
                    : ""}
                </span>
              </div>
            </div>
            <p className="text-[11.5px] text-zinc-600 mt-0.5 tracking-wide">Explore layers of time</p>
          </div>

          {/* ── Drop Pin button for desktop ── */}
          <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-2">
            <button
              onClick={onToggleDropPinMode}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition",
                dropPinMode
                  ? "border-[rgba(44,111,116,0.55)] bg-[rgba(31,90,92,0.20)] text-[#89CDD1]"
                  : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] text-zinc-500 hover:text-zinc-300",
              ].join(" ")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={dropPinMode ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              {dropPinMode ? "Click map to place pin…" : "Drop Pin"}
            </button>
            {activePlace && (
              <button onClick={onClearPlace} className="text-[10px] text-zinc-600 hover:text-zinc-400 transition underline underline-offset-2">
                Clear
              </button>
            )}
          </div>

          {showDiscover ? (
            /* ── Archive ── */
            <div className="flex-1 overflow-hidden">
              <DiscoverSheet onViewOnMap={handleViewOnMap} />
            </div>
          ) : showFinds ? (
            /* ── My Finds ── */
            <div className="flex-1 overflow-hidden">
              <FindsSheet
                saves={savedPlaces}
                onSelect={handleRestoreFind}
                onUnsave={onUnsavePlace}
              />
            </div>
          ) : showThisPlace ? (
            /* ── This Place Through Time ── */
            <div className="flex-1 overflow-y-auto">
              <ThisPlacePanel
                activePlace={activePlace}
                paleoData={paleoData}
                dropPinMode={dropPinMode}
                onActivateDropPin={onToggleDropPinMode}
                onClearPlace={onClearPlace}
                onSetTimeStop={onSetTimeStop}
                onFlyToPlace={onFlyToPlace}
              />
            </div>
          ) : (
            <>
              {/* ── Time controls (ContextPanel embedded inside at position 4) ── */}
              <div className="overflow-y-auto flex-shrink-0">
                <TimeControls
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
                  mapTheme={mapTheme}
                  onMapThemeChange={onMapThemeChange}
                  paleoData={paleoData}
                />
              </div>

              {/* ── Source + Kind filters ── */}
              <div className="px-4 pt-3 pb-3 border-b border-[rgba(255,255,255,0.05)] flex-shrink-0">
                <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2 font-medium">Source</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Chip label="Wikipedia" active={activeSources.includes("wikipedia")} onClick={() => onToggleSource("wikipedia")} />
                  <Chip label="OSM" active={activeSources.includes("osm")} onClick={() => onToggleSource("osm")} />
                  {cards.some((c) => c.source === "pbdb") && (
                    <Chip label="Fossils" active={activeSources.includes("pbdb")} onClick={() => onToggleSource("pbdb")} />
                  )}
                </div>

                <div className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2 font-medium">Type</div>
                <div className="flex flex-wrap gap-1.5">
                  {KIND_CHIPS.map(({ kind, label }) => (
                    <Chip key={kind} label={label} active={activeKinds.includes(kind)} onClick={() => onToggleKind(kind)} />
                  ))}
                </div>

                {hasActiveFilters && (
                  <button onClick={onResetFilters} className="mt-2.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition underline underline-offset-2">
                    Reset all filters
                  </button>
                )}
              </div>

              {/* ── Actions ── */}
              <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] flex gap-2 flex-shrink-0">
                <button
                  onClick={onSurpriseMe}
                  disabled={rankedCards.length === 0}
                  className="flex-1 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-zinc-300 text-xs font-medium transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Surprise me
                </button>
              </div>

              {/* ── Feed ── */}
              <Feed cards={rankedCards} newCardIds={newCardIds} loading={loading} error={error} onCardSelect={onCardSelect} />
            </>
          )}
        </div>

        {/* ── Map ── */}
        <div className="flex-1 relative">
          <Map
            center={center}
            onCenterChange={onCenterChange}
            cards={rankedCards}
            selectedId={selected?.id ?? null}
            onSelect={onCardSelect}
            focusOffsetPx={200}
            ma={deepTimeEnabled ? ma : 0}
            coastlineGeoJSON={deepTimeEnabled ? coastlineGeoJSON : null}
            activeEra={activeEra}
            deepTimeEnabled={deepTimeEnabled}
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

          <div className="absolute bottom-1 right-2 text-[8px] text-zinc-700 pointer-events-none z-10">
            OSM contributors &middot; PBDB CC BY &middot; GPlates / EarthByte
          </div>

          {selected && (
            <Drawer
              card={selected}
              onClose={onCloseSelected}
              ma={deepTimeEnabled ? ma : null}
              paleoLat={paleoData?.paleoLat}
              paleoLng={paleoData?.paleoLng}
              nearbyFossilCount={nearbyFossilCount}
              isSaved={isSaved}
              onToggleSave={() =>
                isSaved ? onUnsavePlace(selected.id) : onSavePlace(selected)
              }
              seaLevelOverride={seaLevelOverride}
              paleoEnabled={paleoEnabled}
              overlayBoost={overlayBoost}
            />
          )}
        </div>
      </div>
    </div>
  );
}
