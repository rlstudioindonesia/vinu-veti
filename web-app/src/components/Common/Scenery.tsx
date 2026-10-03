import React from 'react';

// Mascot artwork (Vinu & Veti waving). Put the transparent PNG at web-app/public/mascot.png.
export const MASCOT_SRC = './mascot.png';

export const Cloud: React.FC<{ className: string }> = ({ className }) => (
  <svg viewBox="0 0 200 100" className={className} aria-hidden="true">
    <g fill="#fff">
      <circle cx="60" cy="60" r="34" />
      <circle cx="105" cy="45" r="42" />
      <circle cx="148" cy="62" r="30" />
      <rect x="30" y="60" width="150" height="34" rx="17" />
    </g>
  </svg>
);

export const Star: React.FC<{ className: string }> = ({ className }) => (
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

export const Spark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`text-amber-400 ${className}`} aria-hidden="true">✦</span>
);

export const Hills: React.FC<{ className: string }> = ({ className }) => (
  <svg viewBox="0 0 400 140" preserveAspectRatio="none" className={className} aria-hidden="true">
    <path d="M0 70 C70 20 140 30 210 60 S330 40 400 55 V140 H0Z" fill="#A7E3B8" />
    <path d="M0 95 C90 55 170 70 250 85 S360 75 400 80 V140 H0Z" fill="#7FD3A0" />
    <path d="M0 120 C100 95 220 105 400 112 V140 H0Z" fill="#F4FAEC" />
  </svg>
);

export const Leaf: React.FC<{ className: string; flip?: boolean }> = ({ className, flip }) => (
  <svg viewBox="0 0 80 80" className={className} style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
    <ellipse cx="30" cy="45" rx="14" ry="28" transform="rotate(-25 30 45)" fill="#4CB774" />
    <ellipse cx="52" cy="40" rx="13" ry="26" transform="rotate(20 52 40)" fill="#5FCB86" />
    <ellipse cx="42" cy="58" rx="12" ry="20" fill="#3FA865" />
  </svg>
);


/** Sky gradient shared by the splash and home screens. */
export const SKY_GRADIENT = 'linear-gradient(180deg,#FBFBEF 0%,#CFEFFB 18%,#A9E2F8 45%,#D9F3F1 62%,#F4FAEC 100%)';
