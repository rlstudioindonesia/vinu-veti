// Manual Audio Service for user-uploaded audio files (.mp3, .wav, .m4a)
class SoundService {
  private currentAudio: HTMLAudioElement | null = null;
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

  public playScanBeep() {
    if (this.isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
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
        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        src = URL.createObjectURL(blob);
        this.currentAudioUrl = src;
      }
      const audio = new Audio(src);
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
