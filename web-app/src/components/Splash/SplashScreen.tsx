import React, { useEffect, useState } from 'react';
import { VinuVetiLogo } from '../Common/VinuVetiLogo';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onLoaded: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState<number>(10);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(45), 200);
    const timer2 = setTimeout(() => setProgress(85), 500);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(onLoaded, 250);
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onLoaded]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-b from-[#38BDF8] via-[#6366F1] to-[#9333EA] text-white p-6 select-none animate-in fade-in duration-300">
      {/* Background Soft Glow */}
      <div className="absolute w-72 h-72 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />

      {/* Modern Vinu Veti Logo in Playful White Cloud Border */}
      <div className="relative mb-5">
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center p-2.5 shadow-2xl shadow-indigo-900/30 overflow-hidden animate-bounce">
          <VinuVetiLogo className="w-full h-full" />
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-amber-300/50 animate-ping opacity-30 pointer-events-none" />
      </div>

      <h1 className="font-black text-3xl tracking-tight mb-1 text-white drop-shadow-md flex items-center gap-2">
        <span>Vinu Veti</span>
        <span className="text-amber-300 text-2xl">✨</span>
      </h1>
      <p className="text-xs text-amber-200 font-extrabold mb-6 drop-shadow-sm flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        <span>Buku Cerita Ajaib 3D</span>
      </p>

      {/* Colorful Rainbow Progress Bar */}
      <div className="w-52 h-3.5 bg-black/25 backdrop-blur-md rounded-full overflow-hidden border-2 border-white/40 p-0.5 shadow-inner">
        <div
          className="h-full bg-linear-to-r from-amber-400 via-rose-400 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-white/90 font-bold mt-2.5 drop-shadow-sm">
        🌟 Menyiapkan Dunia Ajaib... ({progress}%)
      </span>
    </div>
  );
};
