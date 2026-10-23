import React, { useId } from 'react';
import type { Lang } from '../../i18n';

/**
 * Language flag drawn as an SVG. Flag emojis are not shown on Windows (they appear as the letters
 * "ID", "GB", "PH"), so the flags are drawn here to look the same on every device.
 */
export const Flag: React.FC<{ lang: Lang; className?: string; title?: string }> = ({ lang, className = 'h-6 w-9', title }) => {
  const id = useId();
  const frame = `${className} inline-block shrink-0 overflow-hidden rounded-[4px] shadow-[0_0_0_1px_rgba(18,59,109,0.12)]`;

  if (lang === 'id') {
    return (
      <svg viewBox="0 0 3 2" className={frame} role="img" aria-label={title}>
        <rect width="3" height="1" fill="#CE1126" />
        <rect y="1" width="3" height="1" fill="#FFFFFF" />
      </svg>
    );
  }

  if (lang === 'en') {
    const all = `${id}-all`;
    const diag = `${id}-diag`;
    return (
      <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className={frame} role="img" aria-label={title}>
        <clipPath id={all}>
          <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id={diag}>
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <g clipPath={`url(#${all})`}>
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${diag})`} stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    );
  }

  // Philippines
  return (
    <svg viewBox="0 0 150 100" className={frame} role="img" aria-label={title}>
      <rect width="150" height="50" fill="#0038A8" />
      <rect y="50" width="150" height="50" fill="#CE1126" />
      <path d="M0,0 L86.6,50 L0,100 z" fill="#FFFFFF" />
      <g fill="#FCD116">
        <circle cx="29" cy="50" r="9" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect key={a} x="27.5" y="33" width="3" height="10" transform={`rotate(${a} 29 50)`} />
        ))}
        <circle cx="9" cy="11" r="4" />
        <circle cx="9" cy="89" r="4" />
        <circle cx="70" cy="50" r="4" />
      </g>
    </svg>
  );
};
