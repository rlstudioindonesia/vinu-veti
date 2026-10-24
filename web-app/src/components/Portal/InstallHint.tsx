import React, { useState } from 'react';
import { Share, PlusSquare, Smartphone, X, MoreVertical, Download } from 'lucide-react';
import { useI18n } from '../../i18n';
import { isAndroid, isAndroidApp, isAndroidInAppBrowser, isIOS, isStandalone } from '../../utils/platform';
import { promptInstall, useCanPromptInstall } from '../../utils/installPrompt';

const DISMISS_KEY = 'vv_install_hint_dismissed';

function dismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Web version on a phone, not installed yet (the Play Store app and installed apps need no hint). */
function canSuggest(): boolean {
  return !isStandalone() && !isAndroidApp() && (isIOS() || isAndroid());
}

/** Other iPhone browsers (Chrome, in-app browsers) cannot add web apps to the home screen everywhere. */
function inOtherIosBrowser(): boolean {
  const ua = navigator.userAgent;
  return isIOS() && (!/Safari/.test(ua) || /CriOS|FxiOS|EdgiOS|FBAN|FBAV|Instagram|Line\//.test(ua));
}

const Step: React.FC<{ n: number; text: string; icon?: React.ReactNode }> = ({ n, text, icon }) => (
  <li className="flex items-center gap-2">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1BA7A0] text-xs text-white">{n}</span>
    <span className="flex-1">{text}</span>
    {icon}
  </li>
);

/** The install steps of this device (or "open in Safari / Chrome" inside another app's browser). */
const InstallSteps: React.FC = () => {
  const { t } = useI18n();
  if (isAndroid()) {
    if (isAndroidInAppBrowser()) return <p className="text-sm font-semibold">{t('installChrome')}</p>;
    return (
      <ol className="space-y-2 text-sm font-semibold">
        <Step n={1} text={t('installAndroidStep1')} icon={<MoreVertical className="h-5 w-5 shrink-0 text-[#173A6B]" />} />
        <Step n={2} text={t('installAndroidStep2')} icon={<Download className="h-5 w-5 shrink-0 text-[#173A6B]" />} />
        <Step n={3} text={t('installStep3')} />
      </ol>
    );
  }
  if (inOtherIosBrowser()) return <p className="text-sm font-semibold">{t('installSafari')}</p>;
  return (
    <ol className="space-y-2 text-sm font-semibold">
      <Step n={1} text={t('installStep1')} icon={<Share className="h-5 w-5 shrink-0 text-[#0A84FF]" />} />
      <Step n={2} text={t('installStep2')} icon={<PlusSquare className="h-5 w-5 shrink-0 text-[#173A6B]" />} />
      <Step n={3} text={t('installStep3')} />
    </ol>
  );
};

/** Card content: title, then the browser's own install dialog when it offers one, else the steps. */
const InstallCard: React.FC<{ onClose: () => void; closeLabel: string; onInstalled?: () => void }> = ({ onClose, closeLabel, onInstalled }) => {
  const { t } = useI18n();
  const canPrompt = useCanPromptInstall();
  const android = isAndroid();
  const install = async () => {
    if (await promptInstall()) onInstalled?.();
  };
  return (
    <>
      <button onClick={onClose} className="absolute right-3 top-3 rounded-full p-1 text-[#173A6B]/60" aria-label={closeLabel}>
        <X className="h-4 w-4" />
      </button>
      <div className="mb-2 flex items-center gap-2 text-base font-bold">
        <img src="./icons/icon-192.png" alt="" className="h-8 w-8 rounded-lg" />
        {t(android ? 'installTitleAndroid' : canPrompt ? 'installButtonApp' : 'installTitle')}
      </div>
      {android && <p className="mb-2 text-xs font-semibold text-[#173A6B]/75">{t('installAndroidIntro')}</p>}
      {canPrompt ? (
        <button
          onClick={install}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#1BA7A0] to-[#0E6B7A] py-3 text-sm font-bold text-white shadow-[0_4px_0_#0B5560] active:translate-y-0.5"
        >
          <Download className="h-4 w-4" />
          {t('installNow')}
        </button>
      ) : (
        <InstallSteps />
      )}
      <button onClick={onClose} className="mt-3 w-full rounded-full bg-[#EEF8FB] py-2 text-sm font-semibold text-[#173A6B]">
        {closeLabel}
      </button>
    </>
  );
};

/**
 * Phone browser (iPhone/iPad Safari, Android Chrome): suggests installing the app on the home screen
 * once (there it opens full screen, works offline and keeps its downloaded content). On Android the
 * browser's own install dialog is used when Chrome offers it.
 */
export const InstallHint: React.FC = () => {
  const { t } = useI18n();
  const [show, setShow] = useState(() => canSuggest() && !dismissed());
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
      <InstallCard onClose={dismiss} closeLabel={t('installLater')} onInstalled={dismiss} />
    </div>
  );
};

/**
 * Small install button for the language picker (web version only, not once installed): "Install on
 * Android" / "Install on iPhone"; on a computer whose browser can install apps "Install the app".
 */
export const InstallButton: React.FC = () => {
  const { t } = useI18n();
  const canPrompt = useCanPromptInstall();
  const [open, setOpen] = useState(false);
  if (isStandalone() || isAndroidApp()) return null;

  const android = isAndroid();
  const label = android ? 'installButtonAndroid' : isIOS() || !canPrompt ? 'installButton' : 'installButtonApp';
  const onClick = async () => {
    // Computer with an install dialog: straight to it; phones get the explanation first
    if (!android && !isIOS() && canPrompt) await promptInstall();
    else setOpen(true);
  };

  return (
    <>
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#173A6B] shadow-[0_2px_0_rgba(18,59,109,0.15)] active:translate-y-px"
      >
        <Smartphone className="h-3.5 w-3.5" />
        {t(label)}
      </button>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-[#123B6D]/40 p-3 sm:items-center" onClick={() => setOpen(false)}>
          <div
            className="relative w-full max-w-md rounded-[24px] bg-white p-4 text-left text-[#173A6B] shadow-[0_10px_40px_rgba(18,59,109,0.35)]"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <InstallCard onClose={() => setOpen(false)} closeLabel={t('installClose')} onInstalled={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};
