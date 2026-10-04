import React, { useRef, useState } from 'react';
import { Lock, Volume2, VolumeX, ChevronRight, Sparkles } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { LANGS, useI18n } from '../../i18n';
import { InstallHint } from './InstallHint';
import { MASCOT_SRC, Cloud, Star, Spark, Hills, Leaf, SKY_GRADIENT } from '../Common/Scenery';

export interface ContentStatus {
  phase: 'idle' | 'downloading' | 'ready' | 'partial';
  done: number;
  total: number;
}

interface WelcomeScreenProps {
  contentStatus: ContentStatus;
  onOpenLanguage: () => void;
  onStartCamera: () => void;
  onOpenAdmin: () => void;
  showAdminButton: boolean; // false in the Play Store build: open admin by tapping the badge 7 times
  onOpenPrivacy: () => void;
  hasContent: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartCamera, onOpenAdmin, showAdminButton, onOpenPrivacy, onOpenLanguage, hasContent, contentStatus }) => {
  const { t, lang } = useI18n();
  const currentLang = LANGS.find((l) => l.code === lang)!;
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!soundService.getMuted());
  const [mascotOk, setMascotOk] = useState<boolean>(true);

  // Hidden admin entry (like Android's developer mode): 7 quick taps on the badge
  const tapsRef = useRef<number[]>([]);
  const handleBadgeTap = () => {
    const now = Date.now();
    tapsRef.current = [...tapsRef.current.filter((t) => now - t < 3000), now];
    if (tapsRef.current.length >= 7) {
      tapsRef.current = [];
      navigator.vibrate?.(60);
      onOpenAdmin();
    }
  };

  const toggleSound = () => {
    soundService.setMuted(soundEnabled);
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div
      className="home-font fixed inset-0 z-30 overflow-y-auto overflow-x-hidden text-[#123B6D]"
      style={{ background: SKY_GRADIENT }}
    >
      {/* Decorations */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px]">
        <Cloud className="absolute -left-10 top-36 w-36 opacity-95" />
        <Cloud className="absolute -right-8 top-32 w-32 opacity-95" />
        <Cloud className="absolute -left-12 top-[300px] w-32 opacity-90" />
        <Cloud className="absolute -right-10 top-[260px] w-36 opacity-90" />
        <Star className="absolute left-5 top-[220px] w-7 animate-pulse" />
        <Star className="absolute right-12 top-[330px] w-7" />
        <Star className="absolute right-6 top-[380px] w-5 animate-pulse" />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-md flex-col px-4 pb-6 pt-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <div
            onClick={handleBadgeTap}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#1BA7A0] to-[#13827D] px-4 py-2 shadow-[0_4px_0_#0E6B66]"
          >
            <span className="text-lg leading-none">📖</span>
            <span className="whitespace-nowrap text-base font-bold tracking-wide text-white">
              VINU <span className="text-[#FFD43B]">&amp;</span> VETI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLanguage}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-[0_3px_0_rgba(18,59,109,0.25)] active:translate-y-0.5"
              aria-label={t('language')}
              title={t('language')}
            >
              {currentLang.flag}
            </button>
            <button
              onClick={toggleSound}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#1BA7A0] to-[#0E6B7A] shadow-[0_3px_0_#0B5560] active:translate-y-0.5"
              aria-label={soundEnabled ? t('soundOff') : t('soundOn')}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5 text-[#FFD43B]" /> : <VolumeX className="h-5 w-5 text-white/70" />}
            </button>
            {showAdminButton && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 rounded-full bg-[#173A6B] px-3.5 py-2 text-sm font-semibold text-white shadow-[0_3px_0_#0C2346] active:translate-y-0.5"
            >
              <Lock className="h-4 w-4 text-[#FFD43B]" />
              {t('teacherParent')}
            </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 rounded-full bg-[#FFDD4A] px-4 py-1.5 text-xs font-bold tracking-wide text-[#173A6B] shadow-sm">
            <Sparkles className="h-4 w-4 text-[#F57C00]" />
            {t('storybook3d')}
          </div>
          <h1 className="mt-3 flex items-center gap-2 text-[52px] font-bold leading-none drop-shadow-[0_3px_0_rgba(255,255,255,0.9)]">
            <Spark className="text-2xl" />
            <span className="text-[#159E9A]">Vinu</span>
            <span className="text-[#FFC107]">&amp;</span>
            <span className="text-[#1450A3]">Veti</span>
            <Spark className="text-2xl" />
          </h1>
          <p className="mt-2 text-lg font-semibold text-[#173A6B]">{t('tagline')}</p>
        </div>

        {/* Mascot */}
        <div className="relative flex flex-1 items-end justify-center">
          {mascotOk ? (
            <img
              src={MASCOT_SRC}
              alt="Vinu dan Veti"
              onError={() => setMascotOk(false)}
              className="relative z-10 -mb-6 max-h-[300px] w-auto max-w-[92%] object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.15)]"
              draggable={false}
            />
          ) : (
            <div className="h-48" />
          )}
        </div>

        {/* Ground + actions */}
        <div className="relative -mx-4">
          <Hills className="absolute inset-x-0 -top-24 h-32 w-full" />
          <Leaf className="absolute -left-2 -top-28 w-20" />
          <Leaf className="absolute -right-2 -top-32 w-20" flip />
        </div>

        <div className="relative z-10 mt-6 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Spark />
            <span className="rounded-full bg-[#168C8A] px-5 py-1.5 text-sm font-semibold text-white shadow">Augmented Reality 3D</span>
            <Spark />
          </div>

          <button
            onClick={() => {
              soundService.playScanBeep();
              onStartCamera();
            }}
            className="flex w-full items-center gap-4 rounded-[28px] bg-gradient-to-b from-[#FFE55C] to-[#FFD21F] px-4 py-4 text-left shadow-[0_6px_0_#E9A800,0_10px_20px_rgba(233,168,0,0.35)] transition-transform active:translate-y-1 active:shadow-[0_2px_0_#E9A800]"
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-4xl shadow-inner">📷</span>
            <span className="flex-1">
              <span className={`block font-bold leading-tight text-[#173A6B] ${lang === 'id' ? 'whitespace-nowrap text-[22px] max-[360px]:text-lg' : 'text-[19px] max-[360px]:text-base'}`}>{t('openCamera')}</span>
              <span className="block text-sm font-semibold text-[#168C8A]">{t('tapToScan')}</span>
            </span>
            <ChevronRight className="h-7 w-7 shrink-0 text-[#173A6B]" strokeWidth={3} />
          </button>

          {contentStatus.phase !== 'idle' && (
            <div
              className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-center text-xs font-semibold ${
                contentStatus.phase === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-white/85 text-[#173A6B]'
              }`}
            >
              {contentStatus.phase === 'downloading' && (
                <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[#1BA7A0] border-t-transparent" />
              )}
              <span>
                {contentStatus.phase === 'downloading'
                  ? t('downloadingContent').replace('{done}', String(contentStatus.done)).replace('{total}', String(contentStatus.total))
                  : contentStatus.phase === 'ready'
                    ? t('contentReady')
                    : t('contentPartial')}
              </span>
            </div>
          )}

          {!hasContent && contentStatus.phase !== 'downloading' && (
            <p className="rounded-2xl bg-white/80 px-3 py-2 text-center text-xs font-semibold text-[#173A6B]">
              {showAdminButton
                ? t('noContentAdmin')
                : t('noContent')}
            </p>
          )}

          <div className="rounded-[28px] bg-white/90 p-4 shadow-[0_6px_20px_rgba(18,59,109,0.08)]">
            <div className="mb-3 flex items-center justify-center gap-2 text-base font-bold text-[#173A6B]">
              <Spark />
              <span>📖</span>
              {t('howToPlay')}
              <Spark />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: '📖', label: t('step1') },
                { icon: '📷', label: t('step2') },
                { icon: '✨', label: t('step3') },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-[#EEF8FB] px-1 py-3">
                  <div className="text-4xl leading-none">{s.icon}</div>
                  <div className="mt-2 text-[12px] font-semibold text-[#173A6B]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenPrivacy}
            className="mx-auto flex items-center gap-2 py-2 text-sm font-semibold text-[#173A6B]"
          >
            <Spark />
            <span className="text-xl">🛡️</span>
            {t('safeToPlay')}
            <Spark />
          </button>
        </div>
      </div>
      <InstallHint />
    </div>
  );
};
