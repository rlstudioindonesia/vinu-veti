import React, { useState } from 'react';
import { Share, PlusSquare, Smartphone, X } from 'lucide-react';
import { useI18n } from '../../i18n';
import { isAndroidApp, isIOS, isStandalone } from '../../utils/platform';

const DISMISS_KEY = 'vv_install_hint_dismissed';

function shouldShow(): boolean {
  if (!isIOS() || isStandalone() || isAndroidApp()) return false;
  try {
    return localStorage.getItem(DISMISS_KEY) !== '1';
  } catch {
    return true;
  }
}

/** Other iPhone browsers (Chrome, in-app browsers) cannot add web apps to the home screen everywhere. */
function inOtherIosBrowser(): boolean {
  const ua = navigator.userAgent;
  return isIOS() && (!/Safari/.test(ua) || /CriOS|FxiOS|EdgiOS|FBAN|FBAV|Instagram|Line\//.test(ua));
}

/** The install steps (or "open in Safari" when on iPhone in another browser). */
const InstallSteps: React.FC = () => {
  const { t } = useI18n();
  if (inOtherIosBrowser()) return <p className="text-sm font-semibold">{t('installSafari')}</p>;
  return (
    <ol className="space-y-2 text-sm font-semibold">
      <li className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1BA7A0] text-xs text-white">1</span>
        <span className="flex-1">{t('installStep1')}</span>
        <Share className="h-5 w-5 shrink-0 text-[#0A84FF]" />
      </li>
      <li className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1BA7A0] text-xs text-white">2</span>
        <span className="flex-1">{t('installStep2')}</span>
        <PlusSquare className="h-5 w-5 shrink-0 text-[#173A6B]" />
      </li>
      <li className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1BA7A0] text-xs text-white">3</span>
        <span className="flex-1">{t('installStep3')}</span>
      </li>
    </ol>
  );
};

/**
 * iPhone/iPad in Safari: explains how to add the app to the home screen (there it opens full screen,
 * works offline and keeps its downloaded content).
 */
export const InstallHint: React.FC = () => {
  const { t } = useI18n();
  const [show, setShow] = useState(shouldShow);
  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
    setShow(false);
  };

  return (
    <div
      className="fixed inset-x-3 z-40 mx-auto max-w-md rounded-[24px] bg-white p-4 text-left text-[#173A6B] shadow-[0_10px_40px_rgba(18,59,109,0.35)]"
      style={{ bottom: 'calc(12px + env(safe-area-inset-bottom))' }}
    >
      <button onClick={dismiss} className="absolute right-3 top-3 rounded-full p-1 text-[#173A6B]/60" aria-label={t('installLater')}>
        <X className="h-4 w-4" />
      </button>
      <div className="mb-2 flex items-center gap-2 text-base font-bold">
        <img src="./icons/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
        {t('installTitle')}
      </div>
      <InstallSteps />
      <button onClick={dismiss} className="mt-3 w-full rounded-full bg-[#EEF8FB] py-2 text-sm font-semibold text-[#173A6B]">
        {t('installLater')}
      </button>
    </div>
  );
};

/** Small "Install on iPhone" button for the language picker: web version only, not once installed. */
export const InstallButton: React.FC = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  if (isStandalone() || isAndroidApp()) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#173A6B] shadow-[0_2px_0_rgba(18,59,109,0.15)] active:translate-y-px"
      >
        <Smartphone className="h-3.5 w-3.5" />
        {t('installButton')}
      </button>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-[#123B6D]/40 p-3 sm:items-center" onClick={() => setOpen(false)}>
          <div
            className="relative w-full max-w-md rounded-[24px] bg-white p-4 text-left text-[#173A6B] shadow-[0_10px_40px_rgba(18,59,109,0.35)]"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-full p-1 text-[#173A6B]/60" aria-label={t('installClose')}>
              <X className="h-4 w-4" />
            </button>
            <div className="mb-2 flex items-center gap-2 text-base font-bold">
              <img src="./icons/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
              {t('installTitle')}
            </div>
            <InstallSteps />
            <button onClick={() => setOpen(false)} className="mt-3 w-full rounded-full bg-[#EEF8FB] py-2 text-sm font-semibold text-[#173A6B]">
              {t('installClose')}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
