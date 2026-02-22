// ---------------------------------------------------------------------------
// Try This — curated first-use presets for immediate "wow".
// Each preset: fly to coords, set pin, set time stop, open This Place.
// ---------------------------------------------------------------------------

export type TryThisPreset = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** Years ago (0 = now). Use for recent-history stops. */
  yearsAgo?: number;
  /** Million years ago. Use for deep-time stops (takes precedence if set). */
  ma?: number;
};

export const TRY_THIS_PRESETS: TryThisPreset[] = [
  {
    id: "rome-2k",
    label: "Rome · 2,000 years ago",
    lat: 41.9028,
    lng: 12.4964,
    yearsAgo: 2000,
  },
  {
    id: "london-2k",
    label: "London · 2,000 years ago",
    lat: 51.5074,
    lng: -0.1278,
    yearsAgo: 2000,
  },
  {
    id: "doggerland-10k",
    label: "Doggerland · 10,000 years ago",
    lat: 54.0,
    lng: 3.0,
    yearsAgo: 10000,
  },
  {
    id: "chicxulub-66ma",
    label: "Chicxulub · 66 Ma",
    lat: 21.4,
    lng: -89.5,
    ma: 66,
  },
  {
    id: "sahara-10k",
    label: "Sahara · 10,000 years ago",
    lat: 25.0,
    lng: 10.0,
    yearsAgo: 10000,
  },
];

const TRY_THIS_DISMISSED_KEY = "substrata_try_this_dismissed";

export function isTryThisDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TRY_THIS_DISMISSED_KEY) === "1";
}

export function setTryThisDismissed(): void {
  try {
    localStorage.setItem(TRY_THIS_DISMISSED_KEY, "1");
  } catch {
    // ignore
  }
}
