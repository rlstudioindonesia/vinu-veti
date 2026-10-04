/** Audio type from the first bytes (Safari only plays a blob when its type is right). */
function sniffAudioType(b: Uint8Array): string {
  const tag = String.fromCharCode(...b.slice(0, 4));
  if (tag === 'RIFF') return 'audio/wav';
  if (tag === 'OggS') return 'audio/ogg';
  if (String.fromCharCode(...b.slice(4, 8)) === 'ftyp') return 'audio/mp4';
  return 'audio/mpeg';
}

// Manual Audio Service for user-uploaded audio files (.mp3, .wav, .m4a)
class SoundService {
  private currentAudio: HTMLAudioElement | null = null;
  // iPhone/iPad only play sound started by a tap: one audio element and one audio context are
  // unlocked on the first tap (see unlock) and reused for every voice and beep afterwards
  private voiceEl: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private currentAudioUrl: string | null = null;
  private isMuted: boolean = false;

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private audioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => undefined);
    return this.ctx;
  }

  /** Call from a tap (e.g. "open camera"): allows voices to play later on iPhone/iPad. */
  public unlock() {
    try {
      this.audioContext();
      if (!this.voiceEl) {
        this.voiceEl = new Audio();
        this.voiceEl.setAttribute('playsinline', '');
        // A tiny silent clip played inside the tap unlocks this element for later playback
        this.voiceEl.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
        this.voiceEl.play().catch(() => undefined);
      }
    } catch {
      // ignore
    }
  }

  public playScanBeep() {
    if (this.isMuted) return;
    try {
      const ctx = this.audioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore
    }
  }

  public async playManualAudio(audioData: Blob | ArrayBuffer | string) {
    if (this.isMuted) return;
    this.stopAudio();
    try {
      let src: string;
      if (typeof audioData === 'string') {
        src = audioData;
      } else if (audioData instanceof Blob) {
        src = URL.createObjectURL(audioData);
        this.currentAudioUrl = src;
      } else {
        const blob = new Blob([audioData], { type: sniffAudioType(new Uint8Array(audioData, 0, Math.min(12, audioData.byteLength))) });
        src = URL.createObjectURL(blob);
        this.currentAudioUrl = src;
      }
      const audio = this.voiceEl ?? new Audio();
      audio.src = src;
      this.currentAudio = audio;
      await audio.play();
    } catch (e) {
      console.warn('Manual audio playback notice:', e);
    }
  }

  public stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
      this.currentAudioUrl = null;
    }
  }
}

export const soundService = new SoundService();
