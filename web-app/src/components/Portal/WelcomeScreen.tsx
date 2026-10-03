import React, { useState } from 'react';
import { Lock, Volume2, VolumeX, ChevronRight, Sparkles } from 'lucide-react';
import { soundService } from '../../services/soundService';

interface WelcomeScreenProps {
  onStartCamera: () => void;
  onOpenAdmin?: () => void; // hidden when undefined (Play Store build)
  onOpenPrivacy: () => void;
  hasContent: boolean;
}

// Mascot artwork (Vinu & Veti waving). Put the transparent PNG at web-app/public/mascot.png.
const MASCOT_SRC = './mascot.png';

const Cloud: React.FC<{ className: string }> = ({ className }) => (
  <svg viewBox="0 0 200 100" className={className} aria-hidden="true">
    <g fill="#fff">
      <circle cx="60" cy="60" r="34" />
      <circle cx="105" cy="45" r="42" />
      <circle cx="148" cy="62" r="30" />
      <rect x="30" y="60" width="150" height="34" rx="17" />
    </g>
  </svg>
);

const Star: React.FC<{ className: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z"
      fill="#FDD835"
      stroke="#F9A825"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

const Spark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`text-amber-400 ${className}`} aria-hidden="true">✦</span>
);

const Hills: React.FC<{ className: string }> = ({ className }) => (
  <svg viewBox="0 0 400 140" preserveAspectRatio="none" className={className} aria-hidden="true">
    <path d="M0 70 C70 20 140 30 210 60 S330 40 400 55 V140 H0Z" fill="#A7E3B8" />
    <path d="M0 95 C90 55 170 70 250 85 S360 75 400 80 V140 H0Z" fill="#7FD3A0" />
    <path d="M0 120 C100 95 220 105 400 112 V140 H0Z" fill="#F4FAEC" />
  </svg>
);

const Leaf: React.FC<{ className: string; flip?: boolean }> = ({ className, flip }) => (
  <svg viewBox="0 0 80 80" className={className} style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
    <ellipse cx="30" cy="45" rx="14" ry="28" transform="rotate(-25 30 45)" fill="#4CB774" />
    <ellipse cx="52" cy="40" rx="13" ry="26" transform="rotate(20 52 40)" fill="#5FCB86" />
    <ellipse cx="42" cy="58" rx="12" ry="20" fill="#3FA865" />
  </svg>
);

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartCamera, onOpenAdmin, onOpenPrivacy, hasContent }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!soundService.getMuted());
  const [mascotOk, setMascotOk] = useState<boolean>(true);

  const toggleSound = () => {
    soundService.setMuted(soundEnabled);
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div
      className="home-font fixed inset-0 z-30 overflow-y-auto overflow-x-hidden text-[#123B6D]"
      style={{ background: 'linear-gradient(180deg,#FBFBEF 0%,#CFEFFB 18%,#A9E2F8 45%,#D9F3F1 62%,#F4FAEC 100%)' }}
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
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-[#1BA7A0] to-[#13827D] px-4 py-2 shadow-[0_4px_0_#0E6B66]">
            <span className="text-lg leading-none">📖</span>
            <span className="text-base font-bold tracking-wide text-white">
              VINU <span className="text-[#FFD43B]">&amp;</span> VETI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-[#1BA7A0] to-[#0E6B7A] shadow-[0_3px_0_#0B5560] active:translate-y-0.5"
              aria-label={soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5 text-[#FFD43B]" /> : <VolumeX className="h-5 w-5 text-white/70" />}
            </button>
            {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 rounded-full bg-[#173A6B] px-3.5 py-2 text-sm font-semibold text-white shadow-[0_3px_0_#0C2346] active:translate-y-0.5"
            >
              <Lock className="h-4 w-4 text-[#FFD43B]" />
              Guru &amp; Ortu
            </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 rounded-full bg-[#FFDD4A] px-4 py-1.5 text-xs font-bold tracking-wide text-[#173A6B] shadow-sm">
            <Sparkles className="h-4 w-4 text-[#F57C00]" />
            BUKU CERITA AJAIB 3D
          </div>
          <h1 className="mt-3 flex items-center gap-2 text-[52px] font-bold leading-none drop-shadow-[0_3px_0_rgba(255,255,255,0.9)]">
            <Spark className="text-2xl" />
            <span className="text-[#159E9A]">Vinu</span>
            <span className="text-[#FFC107]">&amp;</span>
            <span className="text-[#1450A3]">Veti</span>
            <Spark className="text-2xl" />
          </h1>
          <p className="mt-2 text-lg font-semibold text-[#173A6B]">Buku Bergambar Menjadi Nyata!</p>
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
              <span className="block whitespace-nowrap text-[22px] font-bold leading-tight text-[#173A6B] max-[360px]:text-lg">BUKA KAMERA AJAIB!</span>
              <span className="block text-sm font-semibold text-[#168C8A]">Sentuh untuk memindai stiker</span>
            </span>
            <ChevronRight className="h-7 w-7 shrink-0 text-[#173A6B]" strokeWidth={3} />
          </button>

          {!hasContent && (
            <p className="rounded-2xl bg-white/80 px-3 py-2 text-center text-xs font-semibold text-[#173A6B]">
              {onOpenAdmin
                ? 'Belum ada konten AR. Tambahkan stiker & model 3D di menu Guru & Ortu.'
                : 'Konten AR belum tersedia di versi ini.'}
            </p>
          )}

          <div className="rounded-[28px] bg-white/90 p-4 shadow-[0_6px_20px_rgba(18,59,109,0.08)]">
            <div className="mb-3 flex items-center justify-center gap-2 text-base font-bold text-[#173A6B]">
              <Spark />
              <span>📖</span>
              Cara Bermain Sangat Mudah:
              <Spark />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { icon: '📖', label: '1. Buka Buku' },
                { icon: '📷', label: '2. Arahkan Kamera' },
                { icon: '✨', label: '3. Muncul 3D!' },
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
            Aman untuk Belajar &amp; Bermain
            <Spark />
          </button>
        </div>
      </div>
    </div>
  );
};
