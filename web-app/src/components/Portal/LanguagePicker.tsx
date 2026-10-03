import React from 'react';
import { Lang, LANGS, useI18n } from '../../i18n';
import { Cloud, Star, SKY_GRADIENT, MASCOT_SRC } from '../Common/Scenery';

interface LanguagePickerProps {
  onDone: () => void;
}

const TITLES: Record<Lang, string> = { id: 'Pilih Bahasa', en: 'Choose Language', tl: 'Pumili ng Wika' };

export const LanguagePicker: React.FC<LanguagePickerProps> = ({ onDone }) => {
  const { lang, setLang } = useI18n();

  const choose = (l: Lang) => {
    setLang(l);
    onDone();
  };

  return (
    <div className="home-font fixed inset-0 z-[90] flex flex-col items-center overflow-y-auto text-[#123B6D]" style={{ background: SKY_GRADIENT }}>
      <Cloud className="pointer-events-none absolute -left-10 top-20 w-36 opacity-95" />
      <Cloud className="pointer-events-none absolute -right-8 top-40 w-32 opacity-95" />
      <Star className="pointer-events-none absolute left-6 top-[42%] w-7 animate-pulse" />
      <Star className="pointer-events-none absolute right-8 top-[30%] w-6" />

      <div className="relative z-10 flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 px-6 py-10">
        <img src={MASCOT_SRC} alt="" className="max-h-[26vh] w-auto object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.15)]" draggable={false} />
        {/* Title in all three languages, so everyone recognises it */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#159E9A]">{TITLES[lang]}</h1>
          <p className="mt-1 text-sm font-semibold text-[#173A6B]/80">
            {LANGS.filter((l) => l.code !== lang)
              .map((l) => TITLES[l.code])
              .join(' · ')}
          </p>
        </div>

        <div className="w-full space-y-3">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => choose(l.code)}
              className={`flex w-full items-center gap-4 rounded-[24px] px-5 py-4 text-left text-xl font-bold shadow-[0_5px_0_rgba(18,59,109,0.18)] transition-transform active:translate-y-1 ${
                l.code === lang ? 'bg-gradient-to-b from-[#FFE55C] to-[#FFD21F] text-[#173A6B]' : 'bg-white text-[#173A6B]'
              }`}
            >
              <span className="text-4xl leading-none">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
