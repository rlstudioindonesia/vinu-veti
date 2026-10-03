import React, { useState } from 'react';
import { Camera, Lock, ShieldCheck, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { VinuVetiLogo } from '../Common/VinuVetiLogo';
import { soundService } from '../../services/soundService';

interface WelcomeScreenProps {
  onStartCamera: () => void;
  onOpenAdmin: () => void;
  onOpenPrivacy: () => void;
  hasContent: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartCamera,
  onOpenAdmin,
  onOpenPrivacy,
  hasContent,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!soundService.getMuted());

  const toggleSound = () => {
    soundService.setMuted(soundEnabled);
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-linear-to-b from-[#38BDF8] via-[#6366F1] to-[#9333EA] text-white select-none overflow-y-auto">
      {/* Ambient Cartoon Clouds and Floating Sparkles in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Soft Background Radial Light */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-300/25 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl" />

        {/* Fluffy Cartoon Cloud 1 (Top Left) */}
        <div className="absolute top-6 -left-8 w-44 h-16 bg-white/30 backdrop-blur-xs rounded-full shadow-lg" />
        <div className="absolute top-2 left-6 w-20 h-20 bg-white/30 rounded-full" />
        <div className="absolute top-6 left-18 w-24 h-24 bg-white/30 rounded-full" />

        {/* Fluffy Cartoon Cloud 2 (Top Right) */}
        <div className="absolute top-12 -right-10 w-48 h-18 bg-white/25 rounded-full shadow-md" />
        <div className="absolute top-8 right-16 w-24 h-24 bg-white/25 rounded-full" />

        {/* Twinkling Stars */}
        <div className="absolute top-28 left-8 text-amber-200 text-lg animate-pulse">⭐</div>
        <div className="absolute top-20 right-14 text-yellow-300 text-xl animate-bounce">✨</div>
        <div className="absolute top-64 right-6 text-pink-200 text-base animate-pulse">🌟</div>
        <div className="absolute bottom-40 left-6 text-cyan-200 text-xl animate-bounce">🎈</div>
        <div className="absolute bottom-24 right-10 text-amber-300 text-lg">🌈</div>
      </div>

      {/* Top Header: Sound Toggle & Parent Shortcut */}
      <div className="relative z-10 w-full px-4 pt-4 sm:pt-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border-2 border-white/40 shadow-xl ring-1 ring-black/30">
          <div className="w-5 h-5 shrink-0">
            <VinuVetiLogo className="w-full h-full" showGlow={false} />
          </div>
          <span className="font-black text-xs tracking-wider text-amber-300 drop-shadow-sm">VINU VETI</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-full bg-slate-950/85 hover:bg-slate-900 active:scale-90 text-white backdrop-blur-md border-2 border-white/40 shadow-xl transition-all"
            title="Suara"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-white/60" />}
          </button>

          {/* Parent & Teacher Lock Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 hover:bg-black active:scale-95 text-white font-extrabold text-xs border-2 border-white/40 backdrop-blur-md shadow-xl transition-all cursor-pointer"
            title="Area Orang Tua & Guru"
          >
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-white font-bold">Guru & Ortu</span>
          </button>
        </div>
      </div>

      {/* Main Content Card Container */}
      <div className="relative z-10 flex-1 max-w-sm w-full mx-auto px-5 py-4 flex flex-col items-center justify-center text-center">
        {/* Elegant Clean Brand Centerpiece */}
        <div className="relative my-4 flex flex-col items-center">
          {/* Subtle glowing halo */}
          <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />

          {/* Elegant Vinu Veti Logo Squircle */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 relative z-10 drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-105 active:scale-95">
            <VinuVetiLogo className="w-full h-full" showGlow={false} />
          </div>

          {/* Clean Elegant Sub-badge */}
          <div className="relative mt-3 z-20 bg-slate-950/85 backdrop-blur-md text-white font-extrabold text-xs px-4 py-1.5 rounded-full shadow-xl border border-white/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-300 font-bold">Augmented Reality 3D</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-3 mb-4">
          <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)] flex items-center justify-center gap-2">
            <span>Vinu Veti</span>
            <span className="text-amber-300 text-3xl">✨</span>
          </h1>
          <p className="text-sm font-bold text-amber-200 drop-shadow-sm mt-0.5">
            Buku Bergambar Menjadi Nyata!
          </p>
        </div>

        {/* Big Chunky Primary Action Button for 5yo Kids */}
        <div className="w-full space-y-3">
          <button
            onClick={() => {
              soundService.playScanBeep();
              onStartCamera();
            }}
            className="w-full py-4 px-6 rounded-3xl bg-linear-to-r from-amber-400 via-orange-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 active:scale-95 text-slate-950 font-black text-lg flex items-center justify-center gap-3 shadow-[0_8px_0_#9a3412] hover:shadow-[0_4px_0_#9a3412] active:translate-y-1 active:shadow-none border-2 border-white transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/90 flex items-center justify-center shadow-inner">
              <Camera className="w-6 h-6 text-rose-600" />
            </div>
            <div className="text-left">
              <div className="leading-tight text-white font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                BUKA KAMERA AJAIB!
              </div>
              <div className="text-[11px] font-bold text-amber-100 opacity-95">
                Sentuh untuk memindai stiker
              </div>
            </div>
          </button>

          {!hasContent && (
            <p className="text-[11px] font-bold text-white/90 bg-slate-950/40 rounded-xl px-3 py-2">
              Belum ada konten AR. Tambahkan stiker & model 3D di menu Guru & Ortu.
            </p>
          )}
        </div>

        {/* Friendly 3-Step Picture Guide */}
        <div className="w-full mt-4 p-3 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 shadow-sm">
          <div className="text-[11px] font-extrabold text-white/90 mb-2 flex items-center justify-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Cara Bermain Sangat Mudah:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <div className="text-base">📖</div>
              <div className="text-[10px] font-extrabold text-amber-100">1. Buka Buku</div>
            </div>
            <div className="p-1.5 bg-white/20 rounded-xl">
              <div className="text-base">📸</div>
              <div className="text-[10px] font-extrabold text-amber-100">2. Arahkan Kamera</div>
            </div>
            <div className="p-1.5 bg-white/20 rounded-xl">
              <div className="text-base">🎉</div>
              <div className="text-[10px] font-extrabold text-amber-100">3. Muncul 3D!</div>
            </div>
          </div>
        </div>

        {/* Footer: Privacy Policy */}
        <div className="mt-4 pt-1">
          <button
            onClick={onOpenPrivacy}
            className="text-[11px] text-white/80 hover:text-white font-semibold underline decoration-white/40 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Kebijakan Privasi Ramah Anak & Edukasi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
