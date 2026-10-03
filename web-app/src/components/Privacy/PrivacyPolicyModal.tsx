import React from 'react';
import { ShieldCheck, X, Camera, HardDrive, Lock, Mail } from 'lucide-react';
import { useI18n } from '../../i18n';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { lang, t } = useI18n();
  if (!isOpen) return null;

  // English / Tagalog: translated summary (the detailed policy below is in Indonesian)
  if (lang !== 'id') {
    return (
      <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl text-white overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">{t('privacyTitle')}</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="p-5 text-sm text-slate-200 leading-relaxed">{t('privacyBody')}</p>
          <div className="p-4 border-t border-white/10 flex justify-end">
            <button onClick={onClose} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold">
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Kebijakan Privasi</h3>
              <p className="text-[11px] text-slate-400">Vinu Veti (AR Book Explorer) &bull; Google Play Compliant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Summary Box */}
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <h4 className="font-bold text-emerald-400 text-xs mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Komitmen Privasi 100% On-Device
            </h4>
            <p className="text-[11px] text-emerald-200/90">
              Aplikasi ini <strong>tidak mengumpulkan</strong> atau mengirim data pribadi pengguna ke server mana pun. Semua pemrosesan citra kamera dan model 3D dilakukan sepenuhnya secara offline pada perangkat Anda.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5 text-sky-400">
              <Camera className="w-3.5 h-3.5" />
              1. Penggunaan Kamera (android.permission.CAMERA)
            </h4>
            <p className="text-slate-400 text-[11px]">
              Kamera hanya digunakan secara waktu nyata (live preview) untuk memindai stiker QR pada buku fisik dan memproyeksikan objek 3D interaktif. Gambar/video <strong>tidak pernah disimpan, direkam, atau diunggah</strong>.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5 text-emerald-400">
              <HardDrive className="w-3.5 h-3.5" />
              2. Penyimpanan Model 3D (.GLB) & Audio Offline
            </h4>
            <p className="text-slate-400 text-[11px]">
              Model 3D dan file audio disimpan dalam ruang penyimpanan privat aplikasi (Scoped Storage) dan IndexedDB lokal. Aplikasi tidak meminta izin penyimpanan berbahaya dan data Anda aman dari aplikasi lain.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-1">
              3. Privasi Anak-Anak & Keluarga (COPPA Compliant)
            </h4>
            <p className="text-slate-400 text-[11px]">
              Aplikasi ini ramah edukasi dan aman untuk segala usia termasuk anak-anak. Tidak ada pelacakan identitas, analitik pihak ketiga, maupun iklan berbayar.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5 text-amber-400">
              <Mail className="w-3.5 h-3.5" />
              4. Kontak Pengembang
            </h4>
            <p className="text-slate-400 text-[11px]">
              Jika memiliki pertanyaan terkait kebijakan privasi ini, hubungi pengembang melalui:
              <br />
              <strong className="text-slate-200">Email:</strong> <span className="text-emerald-400">linggadhani79@gmail.com</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-white/10 bg-slate-950 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-500">Versi 1.0 &bull; ID: com.aistudio.arbook.kxywzp</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
