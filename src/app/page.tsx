import HomeApp from "@/components/HomeApp";

// ---------------------------------------------------------------------------
// Server component wrapper — provides crawlable SEO content alongside the
// interactive client app.  The HomeApp overlay covers the text visually once
// JavaScript loads; the text is rendered in the DOM for search crawlers.
// ---------------------------------------------------------------------------

export default function Page() {
  return (
    <>
      {/* SEO content — rendered server-side, readable by crawlers.
          Visually hidden once HomeApp mounts as a full-screen overlay. */}
      <div
        aria-hidden="false"
        className="fixed inset-0 z-0 p-8 overflow-auto pointer-events-none select-none"
        style={{ background: "#0B1117", color: "#6B7280" }}
      >
        <h1 className="text-2xl font-bold mb-3" style={{ color: "#F0F0EE" }}>
          Substrata — Explore the Hidden Layers of the World
        </h1>
        <p className="mb-3 text-sm leading-relaxed max-w-prose">
          Substrata is an interactive map that lets you travel through geological deep time and
          human history. Drag the map to any location on Earth, then slide back millions of
          years to see ancient continents, vanished oceans, and the creatures that lived there.
        </p>
        <p className="mb-4 text-sm leading-relaxed max-w-prose">
          Explore paleogeographic reconstructions, ice-age coastlines, and the cultural layers
          left by civilisations from the Neolithic to the modern era — all in one seamless view.
        </p>
        <ul className="text-sm space-y-1 max-w-prose list-disc list-inside">
          <li>
            <strong style={{ color: "#89CDD1" }}>Deep Time (Ma)</strong> — travel up to 540 million
            years into the past with geological period context and paleogeography
          </li>
          <li>
            <strong style={{ color: "#89CDD1" }}>Paleogeography</strong> — GPlates-powered continent
            reconstructions showing ancient coastlines and sea levels
          </li>
          <li>
            <strong style={{ color: "#89CDD1" }}>Historical Layers</strong> — explore human history
            from 10,000 years ago through Bronze Age, Classical Antiquity, Medieval and Modern eras
          </li>
          <li>
            <strong style={{ color: "#89CDD1" }}>Nearby Discovery</strong> — find Wikipedia articles,
            OpenStreetMap landmarks, and fossil records within any area
          </li>
          <li>
            <strong style={{ color: "#89CDD1" }}>Sea Level Visualisation</strong> — see exposed
            continental shelves during ice ages, including Doggerland and Beringia
          </li>
        </ul>
      </div>

      {/* Interactive client app — full-screen, z-10, covers the SEO content */}
      <HomeApp />
    </>
  );
}
