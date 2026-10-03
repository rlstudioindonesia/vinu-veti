export interface ARQRTargetAsset {
  id: string;
  name: string;
  fileName: string;
}

export interface ARQRTarget {
  id: string;
  name: string; // e.g. "Stiker 3D Halaman 1"
  qrCode: string; // The text encoded in the QR sticker
  bookPage?: number;
  description?: string;
  // 3D Model (.GLB)
  modelType: 'custom_glb' | 'heart' | 'solar' | 'trex' | 'dna' | 'rocket';
  customGlbFileName?: string;
  customGlbData?: string;
  customGlbUrl?: string;
  assets?: ARQRTargetAsset[]; // Can store multiple 3D assets for 1 QR sticker
  modelScale: number; // default 1.0
  rotationSpeed: number; // default 0 (object does not rotate automatically)
  elevationOffset: number; // height above QR plane
  accentColor: string;
  playAnimation: boolean;
  // Manual Audio File (.mp3, .wav, .m4a)
  hasCustomAudio?: boolean;
  customAudioName?: string;
  autoPlayAudio?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ARBookTarget = ARQRTarget;

export interface SyncMessage {
  type: 'TARGET_CREATED' | 'TARGET_UPDATED' | 'TARGET_DELETED' | 'DB_RESET';
  targetId?: string;
  timestamp: number;
}
