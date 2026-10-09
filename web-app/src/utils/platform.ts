/** Platform helpers for the web / iPhone version (the Android app runs the same code in a WebView). */

export function isIOS(): boolean {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac, but has touch
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/** Opened from the home screen icon (installed web app). */
export function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isAndroidApp(): boolean {
  return !!(window as unknown as { AndroidBridge?: unknown }).AndroidBridge;
}

type PermissionApi = { requestPermission?: () => Promise<'granted' | 'denied'> };

/**
 * iPhone/iPad only give motion sensor data (used to keep the character steady) after the user
 * allows it. Must be called directly from a tap. Does nothing on other devices.
 */
export async function requestMotionPermission(): Promise<void> {
  const req = (window.DeviceMotionEvent as unknown as PermissionApi | undefined)?.requestPermission;
  if (typeof req !== 'function') return;
  try {
    await req.call(window.DeviceMotionEvent);
  } catch {
    // Denied or not possible: AR still works with the camera only
  }
}

/**
 * Budget phones (≤ 3 GB RAM or ≤ 4 CPU cores): big / detailed models are scaled down a little more
 * there so the AR view stays smooth. iPhones do not report RAM, so they count as capable.
 */
export function isLowEndDevice(): boolean {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 8;
  return (mem !== undefined && mem <= 3) || cores <= 4;
}
