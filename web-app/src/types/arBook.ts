export interface ARQRTargetAsset {
  id: string;
  name: string;
  fileName: string;
  url?: string; // bundled / online location (used when no local copy exists)
}

export interface ARQRTarget {
  id: string;
  name: string; // e.g. "Stiker 3D Halaman 1"
  qrCode: string; // The text encoded in the QR sticker
  bookPage?: number;
  // Main 3D model (.GLB). The file itself is stored locally under the target id.
  customGlbFileName?: string;
  customGlbUrl?: string; // bundled / online location of the main model
  assets?: ARQRTargetAsset[]; // Extra models for the same QR (tap the object to switch)
  modelScale: number; // Model height relative to the QR sticker width (1.0 = default)
  elevationOffset: number; // Height above the QR, in QR widths
  // Narration audio (.mp3, .wav, .m4a)
  hasCustomAudio?: boolean;
  customAudioName?: string;
  audioUrl?: string; // bundled / online location of the audio
  autoPlayAudio?: boolean;
  // 'local' = created in the admin panel on this device, 'pack' = installed from a content pack
  source?: 'local' | 'pack';
  createdAt: number;
  updatedAt: number;
}
