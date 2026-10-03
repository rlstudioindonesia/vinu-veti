import React, { useState } from 'react';
import { soundService } from '../../services/soundService';

interface KidsMascotProps {
  className?: string;
  size?: number;
  onTap?: () => void;
}

export const KidsMascot: React.FC<KidsMascotProps> = ({
  className = 'w-32 h-32',
  size = 128,
  onTap,
}) => {
  const [isExcited, setIsExcited] = useState<boolean>(false);

  const handleClick = () => {
    setIsExcited(true);
    try {
      soundService.playScanBeep();
    } catch {
      // ignore
    }
    if (onTap) onTap();
    setTimeout(() => setIsExcited(false), 800);
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer transition-transform duration-300 ${
        isExcited ? 'scale-115 rotate-6' : 'hover:scale-105 active:scale-95'
      } ${className}`}
      title="Sentuh aku! Halo temanku!"
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        <defs>
          {/* Dino Skin Gradient - Fresh Joyful Mint to Emerald */}
          <linearGradient id="dino-body" x1="60" y1="40" x2="140" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Belly Gradient - Sunny Buttercup Yellow */}
          <linearGradient id="dino-belly" x1="80" y1="90" x2="120" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>

          {/* Hat / Crown Gradient - Golden Sunny Amber */}
          <linearGradient id="dino-hat" x1="70" y1="20" x2="130" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Coral Blush */}
          <radialGradient id="blush-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
          </radialGradient>

          {/* Magical Star Wand */}
          <linearGradient id="wand-star" x1="140" y1="80" x2="170" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Soft Shadow under Dino */}
        <ellipse cx="100" cy="182" rx="55" ry="10" fill="#000000" fillOpacity="0.18" />

        {/* Tail */}
        <path
          d="M 55 140 C 35 145 20 135 15 115 C 25 125 40 128 58 130 Z"
          fill="#10B981"
        />

        {/* Spikes / Back Plates (Colorful Candy Spikes) */}
        <path d="M 45 90 L 35 80 L 48 76 Z" fill="#F43F5E" />
        <path d="M 48 70 L 40 58 L 54 56 Z" fill="#FB923C" />
        <path d="M 57 50 L 52 36 L 66 38 Z" fill="#FACC15" />
        <path d="M 72 34 L 72 18 L 84 26 Z" fill="#38BDF8" />

        {/* Dino Main Chubby Body */}
        <path
          d="M 60 90 C 50 60 75 40 100 40 C 128 40 145 60 145 95 C 145 135 138 165 100 165 C 65 165 60 130 60 90 Z"
          fill="url(#dino-body)"
        />

        {/* Cute Chubby Feet */}
        <ellipse cx="80" cy="165" rx="14" ry="10" fill="#059669" />
        <ellipse cx="120" cy="165" rx="14" ry="10" fill="#059669" />
        {/* Little White Toenails */}
        <circle cx="75" cy="168" r="2.5" fill="#FFFFFF" />
        <circle cx="80" cy="170" r="2.5" fill="#FFFFFF" />
        <circle cx="85" cy="168" r="2.5" fill="#FFFFFF" />
        <circle cx="115" cy="168" r="2.5" fill="#FFFFFF" />
        <circle cx="120" cy="170" r="2.5" fill="#FFFFFF" />
        <circle cx="125" cy="168" r="2.5" fill="#FFFFFF" />

        {/* Joyful Belly Patch */}
        <ellipse cx="102" cy="118" rx="26" ry="32" fill="url(#dino-belly)" />

        {/* Rosy Blush Cheeks */}
        <circle cx="76" cy="100" r="8" fill="url(#blush-grad)" />
        <circle cx="126" cy="100" r="8" fill="url(#blush-grad)" />

        {/* Big Cartoon Eyes */}
        {/* Left Eye */}
        <ellipse cx="84" cy="85" rx="10" ry="12" fill="#1E293B" />
        <circle cx="81" cy="81" r="4.5" fill="#FFFFFF" />
        <circle cx="86" cy="88" r="2" fill="#FFFFFF" />

        {/* Right Eye */}
        <ellipse cx="118" cy="85" rx="10" ry="12" fill="#1E293B" />
        <circle cx="115" cy="81" r="4.5" fill="#FFFFFF" />
        <circle cx="120" cy="88" r="2" fill="#FFFFFF" />

        {/* Big Happy Smile */}
        <path
          d="M 94 98 Q 101 108 108 98"
          stroke="#1E293B"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="#F43F5E"
        />

        {/* Explorer Safari Hat / Cap with AR Badge */}
        <path
          d="M 72 44 C 75 25 125 25 128 44 Z"
          fill="url(#dino-hat)"
        />
        <path
          d="M 64 44 C 64 40 136 40 136 44 C 136 48 64 48 64 44 Z"
          fill="#D97706"
        />
        {/* Hat Badge (Mini Star) */}
        <circle cx="100" cy="34" r="5" fill="#FEF08A" />

        {/* Left Arm Waving */}
        <path
          d="M 62 108 C 45 100 48 85 56 80 C 62 88 65 98 62 108 Z"
          fill="#10B981"
        />

        {/* Right Arm Holding Magic Wand */}
        <path
          d="M 136 108 C 150 102 152 115 142 120 Z"
          fill="#059669"
        />
        {/* Magic Wand Stick */}
        <line x1="138" y1="122" x2="162" y2="82" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />
        {/* Glowing Star Top */}
        <polygon
          points="164,72 168,80 177,81 170,87 172,96 164,91 156,96 158,87 151,81 160,80"
          fill="url(#wand-star)"
        />
        {/* Sparkles around Star */}
        <circle cx="178" cy="74" r="2" fill="#FDE047" />
        <circle cx="152" cy="70" r="1.5" fill="#FDE047" />
        <circle cx="174" cy="98" r="1.5" fill="#38BDF8" />
      </svg>
    </div>
  );
};
