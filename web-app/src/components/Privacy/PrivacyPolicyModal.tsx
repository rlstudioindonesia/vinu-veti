import React from 'react';
import { ShieldCheck, X, Mail, FileText } from 'lucide-react';
import { useI18n } from '../../i18n';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Short privacy + AR safety summary in the selected language. The full policy (Indonesian and
 * English) is privacy-policy.html, bundled with the app and published for Google Play.
 */
export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useI18n();
  if (!isOpen) return null;
  const fullPolicy = `./privacy-policy.html${lang === 'id' ? '#id' : '#en'}`;

  return (
    <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">{t('privacyTitle')}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10" aria-label={t('close')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-slate-200 leading-relaxed">
          <p>{t('privacyBody')}</p>

          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3.5">
            <h4 className="mb-1.5 font-bold text-amber-300">⚠️ {t('safetyTitle')}</h4>
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-amber-50/90">
              <li>{t('safetyAdult')}</li>
              <li>{t('safetySurroundings')}</li>
              <li>{t('safetyBreak')}</li>
            </ul>
          </div>

          <a href={fullPolicy} className="flex items-center gap-2 font-semibold text-emerald-400 underline">
            <FileText className="w-4 h-4 shrink-0" />
            {t('privacyTitle')} (Bahasa Indonesia / English)
          </a>
          <p className="flex items-center gap-2 text-slate-400">
            <Mail className="w-4 h-4 shrink-0" />
            linggadhani79@gmail.com
          </p>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
