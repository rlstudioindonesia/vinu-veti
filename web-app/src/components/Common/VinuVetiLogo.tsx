import React from 'react';

interface VinuVetiLogoProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
}

export const VinuVetiLogo: React.FC<VinuVetiLogoProps> = ({
  className = 'w-full h-full',
  size,
  showGlow = false,
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Subtle Luxury Slate Background */}
        <radialGradient
          id="vv-clean-bg"
          cx="50%"
          cy="35%"
          r="75%"
        >
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0B0F19" />
        </radialGradient>

        {/* Emerald Wing Gradient - Primary V (Vinu) */}
        <linearGradient id="vv-wing-emerald" x1="140" y1="160" x2="256" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Champagne Amber Wing Gradient - Secondary V (Veti) */}
        <linearGradient id="vv-wing-gold" x1="372" y1="160" x2="256" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Open Book Base Gradient */}
        <linearGradient id="vv-book-spine" x1="180" y1="360" x2="332" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#E2E8F0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.8" />
        </linearGradient>

        {/* Soft elegant shadow */}
        <filter id="vv-soft-shadow" x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Elegant Squircle Frame */}
      <rect width="512" height="512" rx="128" fill="url(#vv-clean-bg)" />
      <rect
        width="508"
        height="508"
        x="2"
        y="2"
        rx="126"
        stroke="#FFFFFF"
        strokeOpacity="0.12"
        strokeWidth="2"
      />

      {/* Main Mark: Clean Interlocking 3D Book & Geometric Monogram 'V' */}
      <g filter="url(#vv-soft-shadow)">
        {/* Left Wing (Vinu / Book Leaf Left) */}
        <path
          d="M 148 168 C 160 160 188 174 212 216 L 256 364 L 208 364 L 140 188 C 136 178 140 172 148 168 Z"
          fill="url(#vv-wing-emerald)"
        />

        {/* Right Wing (Veti / Book Leaf Right) */}
        <path
          d="M 364 168 C 352 160 324 174 300 216 L 256 364 L 304 364 L 372 188 C 376 178 372 172 364 168 Z"
          fill="url(#vv-wing-gold)"
        />

        {/* Central Core Fold: Clean Precision Chevron */}
        <path
          d="M 212 216 L 256 296 L 300 216 L 274 216 L 256 254 L 238 216 Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />

        {/* Minimal Open Book Base Arc */}
        <path
          d="M 172 396 Q 256 376 340 396"
          stroke="url(#vv-book-spine)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Elegant Minimal Accent: 4-Point Prism Sparkle at Crown */}
        <path
          d="M 256 128 L 260 144 L 276 148 L 260 152 L 256 168 L 252 152 L 236 148 L 252 144 Z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
      </g>
    </svg>
  );
};
