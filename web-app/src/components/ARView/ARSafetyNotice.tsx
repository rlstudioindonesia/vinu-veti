import React from 'react';
import { useI18n } from '../../i18n';

interface ARSafetyNoticeProps {
  onAccept: () => void;
}

/**
 * Safety warning shown every time the AR camera starts (Google Play Families policy for AR):
 * adult supervision and awareness of the surroundings. The character only appears after "OK".
 */
export const ARSafetyNotice: React.FC<ARSafetyNoticeProps> = ({ onAccept }) => {
  const { t } = useI18n();
  const items = [
    { icon: '👨‍👩‍👧', text: t('safetyAdult') },
    { icon: '👀', text: t('safetySurroundings') },
    { icon: '⏱️', text: t('safetyBreak') },
  ];
  return (
    <div
      className="home-font fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ar-safety-title"
    >
      <div className="w-full max-w-sm rounded-[28px] bg-white p-5 text-[#173A6B] shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFDD4A] text-2xl">⚠️</span>
          <h2 id="ar-safety-title" className="text-xl font-bold leading-tight">
            {t('safetyTitle')}
          </h2>
        </div>
        <ul className="space-y-2.5">
          {items.map((it) => (
            <li key={it.icon} className="flex gap-3 rounded-2xl bg-[#EEF8FB] p-3 text-sm font-semibold leading-snug">
              <span className="text-2xl leading-none" aria-hidden="true">
                {it.icon}
              </span>
              <span>{it.text}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onAccept}
          autoFocus
          className="mt-4 w-full rounded-full bg-gradient-to-b from-[#FFE55C] to-[#FFD21F] py-3 text-lg font-bold text-[#173A6B] shadow-[0_4px_0_#E9A800] active:translate-y-0.5"
        >
          {t('safetyOk')}
        </button>
      </div>
    </div>
  );
};
