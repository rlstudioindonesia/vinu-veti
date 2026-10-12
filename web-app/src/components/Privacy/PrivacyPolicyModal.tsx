import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useI18n } from '../../i18n';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The full privacy policy (including the AR safety warning) in the selected language. It is the
 * same page that is published for Google Play (docs/privacy-policy.html), bundled with the app so
 * it also opens offline; ?lang shows only that language.
 */
export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const { lang, t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-3" role="dialog" aria-modal="true">
      <div className="flex h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white text-[#173A6B] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#D7E9F0] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-[#1BA7A0]/15 p-2 text-[#1BA7A0]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold">{t('privacyTitle')}</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-[#173A6B]/60 hover:bg-[#EEF8FB]" aria-label={t('close')}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <iframe
          key={lang}
          src={`./privacy-policy.html?lang=${lang}&embed=1`}
          title={t('privacyTitle')}
          className="w-full flex-1 border-0"
        />

        <div className="flex shrink-0 justify-end border-t border-[#D7E9F0] px-4 py-3">
          <button onClick={onClose} className="rounded-full bg-[#1BA7A0] px-6 py-2 text-sm font-semibold text-white">
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
