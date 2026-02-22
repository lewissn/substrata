// ---------------------------------------------------------------------------
// Sheet state — central active sheet with optional localStorage persistence.
// Minimising does NOT change activeSheet; re-opening restores last active sheet.
// Default to "This Place" only on first load.
// ---------------------------------------------------------------------------

export type SheetType = "thisPlace" | "nearby" | "deepTime" | "archive" | "finds" | "detail";

const STORAGE_KEY = "substrata_active_sheet";

const VALID_PERSISTED: SheetType[] = ["thisPlace", "nearby", "deepTime", "archive", "finds"];

export function getInitialSheet(): SheetType {
  if (typeof window === "undefined") return "thisPlace";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && VALID_PERSISTED.includes(raw as SheetType)) return raw as SheetType;
  } catch {
    // ignore
  }
  return "thisPlace";
}

export function persistSheet(sheet: SheetType): void {
  if (!VALID_PERSISTED.includes(sheet)) return;
  try {
    localStorage.setItem(STORAGE_KEY, sheet);
  } catch {
    // ignore
  }
}
