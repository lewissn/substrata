// ---------------------------------------------------------------------------
// Generated archive article type — output of scripts/build-archive.
// ---------------------------------------------------------------------------

import type { ArchiveTopicKind } from "./archiveCatalog";

export type ArchiveArticle = {
  id: string;
  title: string;
  kind: ArchiveTopicKind;
  time?: {
    label?: string;
    maStart?: number;
    maEnd?: number;
    yearsAgo?: number;
  };
  hero: { url: string; credit?: string; sourceUrl?: string };
  deck: string;
  sections: Array<{ heading: string; body: string }>;
  sources: Array<{ label: string; url: string }>;
  geo?: { lat: number; lng: number; zoom?: number };
  relatedIds: string[];
  updatedAt: string;
};
