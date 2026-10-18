/**
 * Low-light state of the AR camera (darkness + torch), shared between the QR scanner and the torch
 * button. Kept free of three.js / ZXing so the home screen bundle stays small.
 */
type TorchSetter = (on: boolean) => Promise<boolean>;

const listeners = new Set<() => void>();

export const cameraLight = {
  /** The picture is too dark to read the QR easily. */
  dark: false,
  torchSupported: false,
  torchOn: false,
  setter: null as TorchSetter | null,

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  notify() {
    listeners.forEach((fn) => fn());
  },

  /** Turns the phone's flashlight on/off (only while the camera runs, where supported). */
  setTorch(on: boolean): Promise<boolean> {
    return this.setter ? this.setter(on) : Promise.resolve(false);
  },
};
