import { SyncMessage } from '../types/arBook';

const SYNC_CHANNEL_NAME = 'ar_book_realtime_sync_channel';

type SyncListener = (msg: SyncMessage) => void;

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not available, falling back to storage events', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'ar_book_sync_trigger' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notifyListeners(data);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  public broadcast(type: SyncMessage['type'], targetId?: string) {
    const message: SyncMessage = {
      type,
      targetId,
      timestamp: Date.now(),
    };

    // 1. BroadcastChannel for same origin
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn('Channel postMessage failed:', err);
      }
    }

    // 2. Storage event for multi-tab fallback
    try {
      localStorage.setItem('ar_book_sync_trigger', JSON.stringify(message));
    } catch {
      // ignore
    }

    // 3. Same-window local event notification
    this.notifyListeners(message);
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(msg: SyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (e) {
        console.error('Error in sync listener callback:', e);
      }
    });
  }
}

export const realtimeSync = new RealtimeSyncManager();
