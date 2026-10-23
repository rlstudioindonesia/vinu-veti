import React from 'react';

const RELOAD_KEY = 'vv_error_reload_at';

/**
 * After a new version is published, a page that was already open still asks for the old build files
 * (other names). They no longer exist, so opening a screen that loads a file (admin, camera) failed and
 * the app went blank. Such a page simply needs a reload.
 */
export function isChunkLoadError(err: unknown): boolean {
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err);
  return /dynamically imported module|Importing a module script failed|error loading dynamically|ChunkLoadError|Unable to preload CSS|MIME type/i.test(msg);
}

/** Reloads the page once; false when it was just reloaded (to avoid a reload loop). */
export function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 15000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

interface State {
  error: Error | null;
}

/** Instead of a blank screen: reload for outdated build files, otherwise a message with a reload button. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('App error:', error);
    if (isChunkLoadError(error)) reloadOnce();
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="home-font fixed inset-0 flex items-center justify-center bg-[#CFEFFB] p-6 text-[#173A6B]">
        <div className="w-full max-w-sm rounded-[24px] bg-white p-5 text-center shadow-[0_10px_40px_rgba(18,59,109,0.25)]">
          <p className="text-lg font-bold">Ada yang tidak beres</p>
          <p className="mt-1 text-sm font-semibold text-[#173A6B]/80">Something went wrong · Nagkaroon ng problema</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full rounded-full bg-gradient-to-b from-[#1BA7A0] to-[#0E6B7A] py-3 font-bold text-white shadow-[0_4px_0_#0B5560] active:translate-y-0.5"
          >
            Muat ulang · Reload
          </button>
          <p className="mt-3 break-words text-[11px] text-[#173A6B]/50">{error.message}</p>
        </div>
      </div>
    );
  }
}
