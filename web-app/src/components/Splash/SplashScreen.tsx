import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { MASCOT_SRC, Cloud, Star, Spark, Hills, Leaf, SKY_GRADIENT } from '../Common/Scenery';

interface SplashScreenProps {
  onLoaded: () => void;
}

const MIN_DURATION = 1200;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState<number>(8);
  const [mascotOk, setMascotOk] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    // Wait for the mascot + fonts so the home screen appears complete, then finish the bar
    const mascot = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = img.onerror = () => resolve();
      img.src = MASCOT_SRC;
    });
    const fonts = document.fonts?.ready.then(() => undefined) ?? Promise.resolve();
    const tick = window.setInterval(() => setProgress((p) => (p < 85 ? p + 7 : p)), 120);

    Promise.all([mascot, fonts]).then(() => {
      const wait = Math.max(0, MIN_DURATION - (Date.now() - start));
      window.setTimeout(() => {
        if (cancelled) return;
        window.clearInterval(tick);
        setProgress(100);
        window.setTimeout(() => !cancelled && onLoaded(), 300);
      }, wait);
    });

    return () => {
      cancelled = true;
      window.clearInterval(tick);
    };
  }, [onLoaded]);

  return (
    <div
      className="home-font fixed inset-0 z-50 flex flex-col items-center overflow-hidden text-[#123B6D] select-none"
      style={{ background: SKY_GRADIENT }}
    >
      <Cloud className="absolute -left-10 top-24 w-36 opacity-95" />
      <Cloud className="absolute -right-8 top-16 w-32 opacity-95" />
      <Cloud className="absolute -right-12 top-[45%] w-36 opacity-90" />
      <Star className="absolute left-6 top-[30%] w-7 animate-pulse" />
      <Star className="absolute right-10 top-[38%] w-6" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-10">
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

        {mascotOk ? (
          <img
            src={MASCOT_SRC}
            alt="Vinu dan Veti"
            onError={() => setMascotOk(false)}
            className="mt-6 max-h-[38vh] w-auto max-w-[85%] object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.15)] animate-[splash-bob_2.4s_ease-in-out_infinite]"
            draggable={false}
          />
        ) : (
          <div className="h-[30vh]" />
        )}
      </div>

      <div className="relative w-full">
        <Hills className="absolute inset-x-0 -top-24 h-32 w-full" />
        <Leaf className="absolute -left-2 -top-28 w-20" />
        <Leaf className="absolute -right-2 -top-32 w-20" flip />
      </div>

      <div className="relative z-10 w-full max-w-xs px-6 pb-14 pt-8 text-center">
        <div className="h-5 w-full overflow-hidden rounded-full bg-white p-1 shadow-[0_4px_12px_rgba(18,59,109,0.12)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FFD21F] via-[#FFC107] to-[#1BA7A0] transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-semibold text-[#173A6B]">Menyiapkan dunia ajaib... {progress}%</p>
      </div>
    </div>
  );
};
