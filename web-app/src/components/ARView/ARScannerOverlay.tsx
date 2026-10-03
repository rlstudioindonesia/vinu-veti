import React from 'react';
import { ARQRTarget } from '../../types/arBook';
import { ChevronLeft } from 'lucide-react';
import { useI18n } from '../../i18n';

interface ARScannerOverlayProps {
  activeTarget: ARQRTarget | null;
  onBackToHome: () => void;
}

export const ARScannerOverlay: React.FC<ARScannerOverlayProps> = ({
  activeTarget,
  onBackToHome,
}) => {
  const { t } = useI18n();
  // 5 quick taps on the sticker name toggle the tracking diagnostics (for support)
  const tapsRef = React.useRef<number[]>([]);
  const handleChipTap = () => {
    const now = Date.now();
    tapsRef.current = [...tapsRef.current.filter((x) => now - x < 2500), now];
    if (tapsRef.current.length >= 5) {
      tapsRef.current = [];
      window.dispatchEvent(new Event('vv-debug-toggle'));
    }
  };
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-5">
      {/* Minimal Top Header - Back Button */}
      <div className="flex items-center justify-between pointer-events-auto pt-2 sm:pt-3">
        <button
          onClick={onBackToHome}
          className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-90"
          title={t('backToMenu')}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {activeTarget && (
          <div
            onClick={handleChipTap}
            className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 animate-in fade-in"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{activeTarget.name}</span>
          </div>
        )}
      </div>

      {/* Pure, Minimal Center Square Reticle (Only when searching for QR) */}
      {!activeTarget && (
        <div className="flex-1 flex items-center justify-center pointer-events-none">
          <div className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-3xl flex items-center justify-center">
            {/* 4 Clean Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-xl" />

            <div className="text-center px-4">
              <p className="text-[11px] font-medium text-white/70 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                {t('pointAtQr')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty bottom spacer */}
      <div className="h-6 pointer-events-none" />
    </div>
  );
};
