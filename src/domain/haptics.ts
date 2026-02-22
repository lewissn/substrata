/** Fire a short vibration on devices that support it (Android Chrome). No-op elsewhere. */
export function haptic(ms = 10): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}
