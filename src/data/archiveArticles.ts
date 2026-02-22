// ---------------------------------------------------------------------------
// Archive articles — loaded from generated JSON (built by scripts/build-archive).
// Every entry has a hero image (enforced by builder).
// When generated list is empty, fall back to legacy discover entries as articles.
// ---------------------------------------------------------------------------

import type { ArchiveArticle } from "./archiveTypes";
import type { ArchiveTopicKind } from "./archiveCatalog";
import generated from "./generated/archiveArticles.json";
import { DISCOVER_ENTRIES } from "./discover";

const generatedList = Array.isArray(generated) ? (generated as ArchiveArticle[]) : [];

function legacyToArticle(
  e: (typeof DISCOVER_ENTRIES)[number]
): ArchiveArticle {
  const timeLabel = e.ma != null
    ? e.ma >= 1 ? `${e.ma} Ma` : `${Math.round(e.ma * 1000)} ka`
    : e.year != null ? String(e.year) : "";
  return {
    id: e.id,
    title: e.title,
    kind: (e.tags.includes("life") ? "life" : e.tags.includes("extinction") ? "extinction" : e.tags.includes("eruption") ? "event" : e.tags.includes("ice") ? "ice_age" : e.tags.includes("tectonics") ? "tectonics" : "event") as ArchiveTopicKind,
    time: e.ma != null ? { label: e.era, maStart: e.ma } : e.year != null ? { label: String(e.year), yearsAgo: e.year > 0 ? 2025 - e.year : 2025 + Math.abs(e.year) } : { label: e.era },
    hero: { url: e.image, credit: e.imageCredit },
    deck: e.subtitle ?? e.description.split("\n\n")[0].slice(0, 120),
    sections: e.description.split("\n\n").filter(Boolean).map((body) => ({ heading: "Overview", body })),
    sources: [{ label: "Wikipedia", url: `https://en.wikipedia.org/wiki/${e.title.replace(/ /g, "_")}` }],
    geo: e.lat != null && e.lng != null ? { lat: e.lat, lng: e.lng } : undefined,
    relatedIds: DISCOVER_ENTRIES.filter((x) => x.id !== e.id && x.tags.some((t) => e.tags.includes(t))).map((x) => x.id).slice(0, 5),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

/** All archive entries for the UI. Generated first; falls back to legacy when empty. */
export const ARCHIVE_ARTICLES: ArchiveArticle[] =
  generatedList.length > 0 ? generatedList : DISCOVER_ENTRIES.map(legacyToArticle);

export const ARCHIVE_KIND_LABELS: Record<string, string> = {
  period: "Periods",
  event: "Events",
  extinction: "Extinctions",
  civilisation: "Civilisations",
  impact: "Impacts",
  ice_age: "Ice & Climate",
  tectonics: "Tectonics",
  life: "Life & Evolution",
};
