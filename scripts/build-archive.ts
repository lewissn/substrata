#!/usr/bin/env node
/**
 * build-archive.ts
 * Reads archiveCatalog, fetches Wikipedia/Wikidata/Commons (with disk cache),
 * builds ArchiveArticle for each topic, writes archiveArticles.json.
 * Run: npx tsx scripts/build-archive.ts
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ARCHIVE_CATALOG } from "../src/data/archiveCatalog";
import type { ArchiveTopic } from "../src/data/archiveCatalog";
import type { ArchiveArticle } from "../src/data/archiveTypes";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(root, ".cache");
const WIKI_CACHE = path.join(CACHE_DIR, "wiki");
const WIKIDATA_CACHE = path.join(CACHE_DIR, "wikidata");
const COMMONS_CACHE = path.join(CACHE_DIR, "commons");
const OUT_PATH = path.join(root, "src", "data", "generated", "archiveArticles.json");

// Kind → Commons filename fallback (always have a hero)
const KIND_FALLBACK_IMAGES: Record<string, string> = {
  period: "The_Earth_seen_from_Apollo_17.jpg",
  event: "Ice_age_earth.jpg",
  extinction: "Putorana_Plateau.jpg",
  civilisation: "Roman_Empire_Trajan_117AD.png",
  impact: "Chicxulub_radar_topography.jpg",
  ice_age: "Ice_age_earth.jpg",
  tectonics: "Gondwana.png",
  life: "Cambrian_Explosion.jpg",
};

function commonsUrl(filename: string, width = 800): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function fetchWithCache<T>(
  cacheDir: string,
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  ensureDir(cacheDir);
  const cacheFile = path.join(cacheDir, `${key.replace(/[^a-zA-Z0-9-_]/g, "_")}.json`);
  if (existsSync(cacheFile)) {
    try {
      return JSON.parse(readFileSync(cacheFile, "utf-8")) as T;
    } catch {
      // invalid cache, refetch
    }
  }
  const data = await fetcher();
  writeFileSync(cacheFile, JSON.stringify(data, null, 0), "utf-8");
  return data;
}

async function fetchWikiSummary(title: string): Promise<{ extract?: string; thumbnail?: { source?: string }; fullurl?: string } | null> {
  const slug = title.replace(/\s+/g, "_");
  return fetchWithCache(WIKI_CACHE, slug, async () => {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
      { headers: { "User-Agent": "SubstrataArchive/1.0 (educational atlas)" } }
    );
    if (!res.ok) return null;
    return res.json();
  });
}

async function fetchWikidataP18(qid: string): Promise<string | null> {
  const raw = await fetchWithCache<unknown>(WIKIDATA_CACHE, qid, async () => {
    const res = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=claims&format=json&origin=*`,
      { headers: { "User-Agent": "SubstrataArchive/1.0" } }
    );
    if (!res.ok) return null;
    return res.json();
  });
  if (!raw || typeof raw !== "object") return null;
  type Entity = { claims?: Record<string, Array<{ mainsnak?: { datavalue?: { value?: string } } }>> };
  const data = raw as { entities?: Record<string, Entity> };
  const claims = data?.entities?.[qid]?.claims?.P18;
  const filename = claims?.[0]?.mainsnak?.datavalue?.value;
  if (!filename) return null;
  return commonsUrl(filename.replace(/ /g, "_"), 800);
}

async function resolveHero(topic: ArchiveTopic): Promise<{ url: string; credit?: string; sourceUrl?: string }> {
  const fallback = KIND_FALLBACK_IMAGES[topic.kind] ?? KIND_FALLBACK_IMAGES.period;
  const fallbackUrl = commonsUrl(fallback);

  // 1) Wikidata P18
  if (topic.wikidataId) {
    const p18 = await fetchWikidataP18(topic.wikidataId);
    if (p18) return { url: p18, credit: "Wikidata / Commons", sourceUrl: `https://www.wikidata.org/wiki/${topic.wikidataId}` };
  }

  // 2) Wikipedia thumbnail
  const wikiTitle = topic.wikiTitle ?? topic.title.replace(/\s+/g, "_");
  const summary = await fetchWikiSummary(wikiTitle);
  if (summary?.thumbnail?.source) {
    return { url: summary.thumbnail.source, credit: "Wikipedia", sourceUrl: summary.fullurl ?? undefined };
  }

  // 3) Kind fallback (curated)
  return { url: fallbackUrl, credit: "Wikimedia Commons", sourceUrl: `https://commons.wikimedia.org/wiki/File:${fallback}` };
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ") + (words.length > maxWords ? "…" : "");
}

function buildSections(
  topic: ArchiveTopic,
  summary: { extract?: string; fullurl?: string } | null
): Array<{ heading: string; body: string }> {
  const sections: Array<{ heading: string; body: string }> = [];
  const extract = summary?.extract ?? "";
  const overview = truncateWords(extract, 120);
  if (overview) sections.push({ heading: "Overview", body: overview });

  const whatHappened = truncateWords(extract, 80);
  if (whatHappened && whatHappened !== overview) sections.push({ heading: "What happened", body: whatHappened });
  else if (extract.length > 200) sections.push({ heading: "What happened", body: truncateWords(extract.slice(overview.length), 80) });

  const whyMatters = "This period or event is significant in Earth's geological and biological history. Evidence is preserved in the rock record and in fossil assemblages worldwide.";
  sections.push({ heading: "Why it matters", body: truncateWords(whyMatters, 40) });

  const timeLabel = topic.time?.label ?? (topic.time?.maStart != null ? `~${topic.time.maStart} Ma` : topic.time?.yearsAgo != null ? `~${topic.time.yearsAgo} years ago` : "");
  if (timeLabel) sections.push({ heading: "Timeline", body: `Dated to ${timeLabel}. Chronology is based on radiometric dating and stratigraphy.` });

  const whereFelt = topic.geo
    ? "This event or period had global or regional effects. The coordinates given are one significant location; impacts varied by region."
    : "This event or period had global or regional effects. Evidence is found across multiple continents.";
  sections.push({ heading: "Where it was felt", body: whereFelt });

  return sections;
}

function buildSources(topic: ArchiveTopic, summary: { fullurl?: string } | null): Array<{ label: string; url: string }> {
  const list: Array<{ label: string; url: string }> = [];
  const wikiTitle = topic.wikiTitle ?? topic.title.replace(/\s+/g, "_");
  if (summary?.fullurl) list.push({ label: "Wikipedia", url: summary.fullurl });
  else list.push({ label: "Wikipedia", url: `https://en.wikipedia.org/wiki/${wikiTitle}` });
  if (topic.wikidataId) list.push({ label: "Wikidata", url: `https://www.wikidata.org/wiki/${topic.wikidataId}` });
  return list;
}

function relatedIds(topic: ArchiveTopic, all: ArchiveTopic[]): string[] {
  const sameKind = all.filter((t) => t.id !== topic.id && t.kind === topic.kind).map((t) => t.id);
  const byTime =
    topic.time?.maStart != null
      ? all.filter(
          (t) =>
            t.id !== topic.id &&
            t.time?.maStart != null &&
            Math.abs((t.time.maStart ?? 0) - topic.time!.maStart!) < 50
        ).map((t) => t.id)
      : [];
  const combined = [...new Set([...sameKind.slice(0, 2), ...byTime.slice(0, 2)])];
  return combined.slice(0, 5);
}

async function buildArticle(topic: ArchiveTopic, all: ArchiveTopic[]): Promise<ArchiveArticle> {
  const wikiTitle = topic.wikiTitle ?? topic.title.replace(/\s+/g, "_");
  const summary = await fetchWikiSummary(wikiTitle);
  const hero = await resolveHero(topic);
  const deck = summary?.extract ? truncateWords(summary.extract, 25) : `${topic.title} — ${topic.time?.label ?? "deep time"}.`;
  const sections = buildSections(topic, summary);
  const sources = buildSources(topic, summary);

  return {
    id: topic.id,
    title: topic.title,
    kind: topic.kind,
    time: topic.time,
    hero,
    deck,
    sections,
    sources,
    geo: topic.geo,
    relatedIds: relatedIds(topic, all),
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

async function main() {
  ensureDir(path.dirname(OUT_PATH));
  ensureDir(WIKI_CACHE);
  ensureDir(WIKIDATA_CACHE);
  ensureDir(COMMONS_CACHE);

  const articles: ArchiveArticle[] = [];
  for (let i = 0; i < ARCHIVE_CATALOG.length; i++) {
    const topic = ARCHIVE_CATALOG[i] as ArchiveTopic;
    process.stdout.write(`\rBuilding ${i + 1}/${ARCHIVE_CATALOG.length}: ${topic.id}`);
    try {
      const article = await buildArticle(topic, ARCHIVE_CATALOG as ArchiveTopic[]);
      articles.push(article);
    } catch (err) {
      console.error(`\nError building ${topic.id}:`, err);
      articles.push({
        id: topic.id,
        title: topic.title,
        kind: topic.kind,
        time: topic.time,
        hero: { url: commonsUrl(KIND_FALLBACK_IMAGES[topic.kind] ?? KIND_FALLBACK_IMAGES.period), credit: "Wikimedia Commons" },
        deck: `${topic.title}.`,
        sections: [{ heading: "Overview", body: "Content could not be fetched. See sources for more information." }],
        sources: buildSources(topic, null),
        geo: topic.geo,
        relatedIds: relatedIds(topic, ARCHIVE_CATALOG as ArchiveTopic[]),
        updatedAt: new Date().toISOString().slice(0, 10),
      });
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(articles, null, 2), "utf-8");
  console.log(`\nWrote ${articles.length} articles to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
