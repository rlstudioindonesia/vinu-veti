/**
 * ZXing's QR reader only (the whole @zxing/library is several times bigger: barcodes, writers, PDF417…).
 * Loaded on demand by barcodeScanner: phones with the built-in Android QR detector only need it in
 * dark rooms, so it is not downloaded and parsed when the AR camera opens.
 */
import BarcodeFormat from '@zxing/library/esm/core/BarcodeFormat';
import BinaryBitmap from '@zxing/library/esm/core/BinaryBitmap';
import DecodeHintType from '@zxing/library/esm/core/DecodeHintType';
import HybridBinarizer from '@zxing/library/esm/core/common/HybridBinarizer';
import QRCodeReader from '@zxing/library/esm/core/qrcode/QRCodeReader';
import { HTMLCanvasElementLuminanceSource } from '@zxing/library/esm/browser/HTMLCanvasElementLuminanceSource';

export interface ZxingQr {
  text: string;
  // [bottomLeft, topLeft, topRight] finder centres and, for version 2+, the alignment pattern (canvas px)
  points: Array<{ x: number; y: number; moduleSize: number }>;
}

const reader = new QRCodeReader();
const hints = new Map<DecodeHintType, unknown>([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]],
  [DecodeHintType.TRY_HARDER, true],
]);

/** Reads a QR code from the canvas, or null when there is none. */
export function decodeQr(canvas: HTMLCanvasElement): ZxingQr | null {
  try {
    const result = reader.decode(new BinaryBitmap(new HybridBinarizer(new HTMLCanvasElementLuminanceSource(canvas))), hints);
    return {
      text: result.getText(),
      points: result.getResultPoints().map((p) => ({
        x: p.getX(),
        y: p.getY(),
        moduleSize: (p as unknown as { getEstimatedModuleSize?: () => number }).getEstimatedModuleSize?.() ?? 0,
      })),
    };
  } catch {
    return null;
  } finally {
    reader.reset();
  }
}
