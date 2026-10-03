import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ARQRTarget } from '../../types/arBook';
import { X, Printer, Plus, Eye, Tag } from 'lucide-react';

interface QRStickerPrintModalProps {
  targets: ARQRTarget[];
  onSelectTargetForAR: (target: ARQRTarget) => void;
  onOpenCreate: () => void;
  onClose: () => void;
}

function QRCodeCanvas({ text }: { text: string }) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(text, {
      width: 260,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error(err));
  }, [text]);

  if (!dataUrl) {
    return <div className="w-36 h-36 bg-slate-800 rounded-lg animate-pulse" />;
  }

  return (
    <div className="bg-white p-2 rounded-xl shadow-xs inline-block border border-slate-200">
      <img src={dataUrl} alt={`QR Code ${text}`} className="w-36 h-36 object-contain" />
      <span className="block text-center font-mono text-[10px] font-bold text-slate-800 mt-1 uppercase tracking-wider">
        {text}
      </span>
    </div>
  );
}

export const QRStickerPrintModal: React.FC<QRStickerPrintModalProps> = ({
  targets,
  onSelectTargetForAR,
  onOpenCreate,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              Cetak Stiker QR Buku
            </h3>
            <p className="text-[11px] text-slate-400">
              Cetak stiker QR ini pada kertas / stiker label lalu tempelkan pada halaman buku
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {targets.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-200 mb-1">
                Belum Ada Stiker QR Terdaftar
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Buat kode QR baru dan unggah file 3D .GLB Anda untuk mulai mencetak stiker QR yang ditempel di buku.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreate();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Tambah Stiker QR
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {targets.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center justify-between"
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                      <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {t.bookPage ? `Hal. ${t.bookPage}` : 'Stiker Buku'}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">{t.customGlbFileName || t.name}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white mb-2">{t.name}</h4>

                    {/* Scannable QR Code */}
                    <div className="my-2 flex justify-center">
                      <QRCodeCanvas text={t.qrCode} />
                    </div>
                  </div>

                  <div className="w-full pt-3 mt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Kode: <strong className="text-emerald-300 font-mono">{t.qrCode}</strong>
                    </span>
                    <button
                      onClick={() => {
                        onSelectTargetForAR(t);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Uji di AR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-slate-950/60">
          {targets.length > 0 && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              Cetak Semua Stiker QR
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold ml-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
