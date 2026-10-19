/**
 * Screens as addresses in the URL hash (#/admin, #/admin/edit/<id>, #/ar …), so a page refresh
 * reopens the same screen and the browser / Android back button returns to the previous one.
 */

/** The current screen address, e.g. "/admin/edit/slot-1" ("/" for the home screen). */
export function currentRoute(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash.startsWith('/') ? hash : '/';
}

// Entries this app added to the browser history (0 = the page as it was opened)
function depth(): number {
  const s = window.history.state as { vvDepth?: number } | null;
  return s?.vvDepth ?? 0;
}

/** Opens a screen as a new history entry (the back button returns to the current one). */
export function pushRoute(route: string) {
  if (currentRoute() === route) return;
  window.history.pushState({ vvDepth: depth() + 1 }, '', `#${route}`);
}

/** Changes the address of the current entry (no new history entry). */
export function replaceRoute(route: string) {
  if (currentRoute() === route) return;
  window.history.replaceState({ vvDepth: depth() }, '', `#${route}`);
}

/**
 * Leaves the current screen for `parent`: like the back button when the app opened this screen
 * itself (a "popstate" then reports the change), otherwise (e.g. right after a refresh) by replacing
 * the address. Returns true when the change happens through popstate.
 */
export function leaveRoute(parent: string): boolean {
  if (depth() > 0) {
    window.history.back();
    return true;
  }
  replaceRoute(parent);
  return false;
}
