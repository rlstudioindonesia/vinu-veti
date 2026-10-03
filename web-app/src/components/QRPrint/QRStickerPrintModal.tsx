import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { ARQRTarget } from '../../types/arBook';
import { saveFileToDevice } from '../../services/contentPack';
import { X, Printer, Tag, Download } from 'lucide-react';

interface QRStickerPrintModalProps {
  targets: ARQRTarget[];
  onClose: () => void;
}

function useQrDataUrl(text: string, width = 600) {
  const [dataUrl, setDataUrl] = useState<string>('');
  useEffect(() => {
    // Version 3+ QR codes contain an alignment pattern, so they still scan when the book is seen at an
    // angle and give accurate corners for placing the 3D model. Longer texts fall back to the auto size.
    const opts = { width, margin: 2, errorCorrectionLevel: 'Q' as const, color: { dark: '#000000', light: '#ffffff' } };
    QRCode.toDataURL(text, { ...opts, version: 3 })
      .catch(() => QRCode.toDataURL(text, opts))
      .then(setDataUrl)
      .catch((err) => console.error(err));
  }, [text, width]);
  return dataUrl;
}

function QRCard({ target, onSaved }: { target: ARQRTarget; onSaved: (msg: string) => void }) {
  const dataUrl = useQrDataUrl(target.qrCode);

  const handleSavePng = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const safe = target.qrCode.replace(/[^a-z0-9_-]+/gi, '_');
      const where = await saveFileToDevice(blob, `QR_${safe}.png`);
      onSaved(`Gambar QR disimpan: ${where}`);
    } catch (e) {
      onSaved(e instanceof Error ? e.message : 'Gagal menyimpan gambar');
    }
  };

  return (
    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mb-2">
        <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/20">
          {target.bookPage ? `Hal. ${target.bookPage}` : 'Stiker Buku'}
        </span>
        <span className="font-mono text-emerald-300 font-bold">{target.qrCode}</span>
      </div>
      <h4 className="font-bold text-sm text-white mb-2">{target.name}</h4>
      <div className="bg-white p-2 rounded-xl">
        {dataUrl ? (
          <img src={dataUrl} alt={`QR ${target.qrCode}`} className="w-36 h-36 object-contain" />
        ) : (
          <div className="w-36 h-36 bg-slate-200 animate-pulse rounded" />
        )}
      </div>
      <button
        onClick={handleSavePng}
        className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400" />
        Simpan Gambar QR
      </button>
    </div>
  );
}

function PrintItem({ target }: { target: ARQRTarget }) {
  const dataUrl = useQrDataUrl(target.qrCode);
  return (
    <div className="print-item">
      {dataUrl && <img src={dataUrl} alt={target.qrCode} />}
      <div className="print-label">{target.name}</div>
      <div className="print-code">{target.qrCode}</div>
    </div>
  );
}

export const QRStickerPrintModal: React.FC<QRStickerPrintModalProps> = ({ targets, onClose }) => {
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4000);
  };

  const handlePrint = () => {
    const bridge = (window as unknown as { AndroidBridge?: { printPage?: () => void } }).AndroidBridge;
    if (bridge?.printPage) {
      bridge.printPage(); // Android print dialog (printer or "Save as PDF")
    } else {
      window.print();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-black/80">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                Cetak Stiker QR Buku
              </h3>
              <p className="text-[11px] text-slate-400">
                Cetak lalu tempel di halaman buku. Model 3D akan muncul tepat di atas stiker.
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {notice && <div className="bg-emerald-600/95 text-white px-4 py-2 text-xs font-semibold text-center">{notice}</div>}

          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {targets.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto mb-3">
                  <Tag className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-200 mb-1">Belum Ada Stiker QR</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tambahkan stiker dan unggah model 3D .GLB terlebih dahulu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {targets.map((t) => (
                  <QRCard key={t.id} target={t} onSaved={showNotice} />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-slate-950/60">
            {targets.length > 0 && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                Cetak / Simpan PDF
              </button>
            )}
            <button onClick={onClose} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold ml-auto">
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Only visible when printing (rendered outside #root, which is hidden in print) */}
      {createPortal(
        <div className="print-sheet">
          {targets.map((t) => (
            <PrintItem key={t.id} target={t} />
          ))}
        </div>,
        document.body
      )}
    </>
  );
};
