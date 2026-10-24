/**
 * Installing the web version as an app (Android Chrome, Edge, desktop Chrome). The browser announces
 * that the app can be installed with `beforeinstallprompt`; that event is kept here so a tap on our
 * own "Install" button can open the browser's install dialog. Chrome then builds the app itself
 * (a WebAPK signed by Google), so it installs like a normal app: no "unknown sources", no warning.
 * iPhone/iPad have no such dialog (see InstallHint: Share → Add to Home Screen).
 */
import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Called once at start (main.tsx), before the event can fire. */
export function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Our button and hint ask at a calm moment instead of the browser's own bar over the kids' screen
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

/** Opens the browser's install dialog; true when the app was installed. */
export async function promptInstall(): Promise<boolean> {
  const ev = deferred;
  if (!ev) return false;
  // The event can only be used once
  deferred = null;
  notify();
  try {
    await ev.prompt();
    return (await ev.userChoice).outcome === 'accepted';
  } catch {
    return false;
  }
}

/** Whether the browser's install dialog is available right now (re-renders when that changes). */
export function useCanPromptInstall(): boolean {
  const [can, setCan] = useState(() => !!deferred);
  useEffect(() => {
    const update = () => setCan(!!deferred);
    listeners.add(update);
    update();
    return () => {
      listeners.delete(update);
    };
  }, []);
  return can;
}
