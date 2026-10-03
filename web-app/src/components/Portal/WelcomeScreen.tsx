import React, { useState } from 'react';
import { Camera, Lock, ShieldCheck, Sparkles, BookOpen, Volume2, VolumeX, Eye, Star, Heart, Rocket } from 'lucide-react';
import { ARQRTarget } from '../../types/arBook';
import { VinuVetiLogo } from '../Common/VinuVetiLogo';
import { soundService } from '../../services/soundService';

interface WelcomeScreenProps {
  onStartCamera: () => void;
  onOpenAdmin: () => void;
  onOpenPrivacy: () => void;
  targets?: ARQRTarget[];
  onPreviewTarget?: (target: ARQRTarget) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartCamera,
  onOpenAdmin,
  onOpenPrivacy,
  targets = [],
  onPreviewTarget,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showDemoShelf, setShowDemoShelf] = useState<boolean>(false);
  const [bubblePop, setBubblePop] = useState<string | null>(null);

  const handlePlaySound = () => {
    if (soundEnabled) {
      soundService.playScanBeep();
    }
  };

  const handlePop = (id: string) => {
    setBubblePop(id);
    handlePlaySound();
    setTimeout(() => setBubblePop(null), 600);
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
            onClick={() => setSoundEnabled(!soundEnabled)}
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
        {/* Interactive Floating Toys (Kids can tap to pop!) */}
        <div className="w-full flex justify-between items-center px-4 mb-1">
          <button
            onClick={() => handlePop('rocket')}
            className={`p-2 rounded-2xl bg-amber-400/30 border border-amber-300/40 text-xl shadow-md transition-transform ${
              bubblePop === 'rocket' ? 'scale-125 rotate-12' : 'hover:scale-110 active:scale-90'
            }`}
            title="Ketuk aku!"
          >
            🚀
          </button>

          <div className="px-3 py-1 bg-amber-400 text-slate-900 font-black text-[11px] rounded-full shadow-md uppercase tracking-wider flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Buku Cerita Ajaib 3D</span>
          </div>

          <button
            onClick={() => handlePop('dino')}
            className={`p-2 rounded-2xl bg-emerald-400/30 border border-emerald-300/40 text-xl shadow-md transition-transform ${
              bubblePop === 'dino' ? 'scale-125 -rotate-12' : 'hover:scale-110 active:scale-90'
            }`}
            title="Ketuk aku!"
          >
            🦖
          </button>
        </div>

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
              handlePlaySound();
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

          {/* Quick 3D Demo Shelf Toggle Button */}
          {targets.length > 0 && onPreviewTarget && (
            <button
              onClick={() => {
                handlePlaySound();
                setShowDemoShelf(!showDemoShelf);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/40 backdrop-blur-md shadow-md transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              <span>{showDemoShelf ? 'Tutup Koleksi Karakter' : '✨ Mau Coba Lihat Karakter 3D Langsung?'}</span>
            </button>
          )}

          {/* Expandable 3D Character Shelf for Kids */}
          {showDemoShelf && targets.length > 0 && onPreviewTarget && (
            <div className="w-full p-3 bg-white/25 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-[11px] font-extrabold text-amber-200 flex items-center justify-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>Pilih Karakter untuk Dilihat:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {targets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      handlePlaySound();
                      onPreviewTarget(t);
                    }}
                    className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-900 active:scale-95 text-left border border-white shadow-sm flex flex-col items-center text-center transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-xl mb-1 shadow-inner">
                      {t.name.toLowerCase().includes('dino') ? '🦖' : t.name.toLowerCase().includes('bumi') || t.name.toLowerCase().includes('earth') ? '🌍' : t.name.toLowerCase().includes('pesawat') ? '✈️' : '✨'}
                    </div>
                    <span className="font-extrabold text-xs truncate max-w-full">{t.name}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Sentuh untuk Lihat</span>
                  </button>
                ))}
              </div>
            </div>
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
