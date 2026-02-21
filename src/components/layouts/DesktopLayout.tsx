"use client";

import Map from "@/components/Map";
import TimeControls from "@/components/TimeControls";
import ContextPanel from "@/components/ContextPanel";
import Feed from "@/components/Feed";
import Drawer from "@/components/Drawer";
import { Chip, KIND_CHIPS } from "@/components/ui/Chip";
import { ActiveOverlays } from "@/components/ui/ActiveOverlays";
import type { LayoutProps } from "./LayoutProps";

// ---------------------------------------------------------------------------
// Desktop layout — verbatim copy of the original page.tsx layout
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
  } = props;

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
          <div className="px-4 pt-4 pb-3 border-b border-[rgba(255,255,255,0.05)]">
            <div className="flex items-baseline justify-between">
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-100">Substrata</h1>
              <span className="text-[11px] text-zinc-600">
                {rankedCards.length > 0 ? `${rankedCards.length} places` : ""}
              </span>
            </div>
            <p className="text-[11.5px] text-zinc-600 mt-0.5 tracking-wide">Explore layers of time</p>
          </div>

          {/* ── Time controls ── */}
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
          />

          {/* ── Context panel ── */}
          <ContextPanel
            ma={ma}
            activeEra={activeEra}
            deepTimeEnabled={deepTimeEnabled}
            paleoData={paleoData}
          />

          {/* ── Source + Kind filters ── */}
          <div className="px-4 pt-3 pb-3 border-b border-[rgba(255,255,255,0.05)]">
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
                <Chip
                  key={kind}
                  label={label}
                  active={activeKinds.includes(kind)}
                  onClick={() => onToggleKind(kind)}
                />
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="mt-2.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition underline underline-offset-2"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] flex gap-2">
            <button
              onClick={onSurpriseMe}
              disabled={rankedCards.length === 0}
              className="flex-1 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] text-zinc-300 text-xs font-medium transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Surprise me
            </button>
          </div>

          {/* ── Feed ── */}
          <Feed
            cards={rankedCards}
            newCardIds={newCardIds}
            loading={loading}
            error={error}
            onCardSelect={onCardSelect}
          />
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
          />

          {/* ── Active overlays indicator ── */}
          <ActiveOverlays
            ma={deepTimeEnabled ? ma : 0}
            deepTimeEnabled={deepTimeEnabled}
            seaLevelOverride={seaLevelOverride}
            overlayBoost={overlayBoost}
            paleoEnabled={paleoEnabled}
          />

          {/* ── Attribution footer ── */}
          <div className="absolute bottom-1 right-2 text-[8px] text-zinc-700 pointer-events-none z-10">
            OSM contributors &middot; PBDB CC BY &middot; GPlates / EarthByte
          </div>

          {/* ── Drawer ── */}
          {selected && (
            <Drawer
              card={selected}
              onClose={onCloseSelected}
              ma={deepTimeEnabled ? ma : null}
              paleoLat={paleoData?.paleoLat}
              paleoLng={paleoData?.paleoLng}
              nearbyFossilCount={nearbyFossilCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
