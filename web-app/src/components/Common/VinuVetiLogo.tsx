import React from 'react';

interface VinuVetiLogoProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
}

export const VinuVetiLogo: React.FC<VinuVetiLogoProps> = ({
  className = 'w-full h-full',
  size,
  showGlow = true,
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
        {/* Background Radial Glow */}
        <radialGradient
          id="vv-bg-glow"
          cx="50%"
          cy="45%"
          r="65%"
          fx="50%"
          fy="45%"
        >
          <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0.8" />
          <stop offset="45%" stopColor="#0B132B" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#070A14" stopOpacity="1" />
        </radialGradient>

        {/* Outer V Gradient (Vinu) */}
        <linearGradient id="vv-grad-vinu" x1="140" y1="200" x2="370" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>

        {/* Inner V Gradient (Veti) */}
        <linearGradient id="vv-grad-veti" x1="180" y1="160" x2="330" y2="290" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>

        {/* Center Crystal Core Gradient */}
        <linearGradient id="vv-diamond-top" x1="218" y1="108" x2="294" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0F9FF" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </linearGradient>

        <linearGradient id="vv-diamond-left" x1="218" y1="146" x2="256" y2="218" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient id="vv-diamond-right" x1="294" y1="146" x2="256" y2="218" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {showGlow && (
          <filter id="vv-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Modern Badge Container */}
      <rect width="512" height="512" rx="120" fill="url(#vv-bg-glow)" />
      <rect width="510" height="510" x="1" y="1" rx="119" stroke="#38BDF8" strokeOpacity="0.25" strokeWidth="2" />

      {/* Cybernetic Grid Accents */}
      <g stroke="#38BDF8" strokeOpacity="0.12" strokeWidth="1.2">
        <line x1="85" y1="40" x2="85" y2="472" />
        <line x1="170" y1="40" x2="170" y2="472" />
        <line x1="256" y1="40" x2="256" y2="472" />
        <line x1="342" y1="40" x2="342" y2="472" />
        <line x1="427" y1="40" x2="427" y2="472" />
        <line x1="40" y1="85" x2="472" y2="85" />
        <line x1="40" y1="170" x2="472" y2="170" />
        <line x1="40" y1="256" x2="472" y2="256" />
        <line x1="40" y1="342" x2="472" y2="342" />
        <line x1="40" y1="427" x2="472" y2="427" />
      </g>

      {/* Dynamic Orbital Radar Ring */}
      <circle
        cx="256"
        cy="256"
        r="165"
        stroke="#8B5CF6"
        strokeOpacity="0.25"
        strokeWidth="2.5"
        strokeDasharray="8 12"
      />

      {/* AR Corner Targets (Reticle) */}
      <g stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 120 155 L 120 120 L 155 120" />
        <path d="M 357 120 L 392 120 L 392 155" />
        <path d="M 120 357 L 120 392 L 155 392" />
        <path d="M 357 392 L 392 392 L 392 357" />
      </g>

      {/* Outer V (Vinu) Wings */}
      <path
        d="M 148 208 L 256 370 L 364 208 L 336 208 L 256 328 L 176 208 Z"
        fill="url(#vv-grad-vinu)"
        filter={showGlow ? 'url(#vv-neon-glow)' : undefined}
      />

      {/* Inner V (Veti) Wings */}
      <path
        d="M 180 170 L 256 284 L 332 170 L 304 170 L 256 242 L 208 170 Z"
        fill="url(#vv-grad-veti)"
        filter={showGlow ? 'url(#vv-neon-glow)' : undefined}
      />

      {/* Open Book Base Curve */}
      <path
        d="M 152 346 Q 204 330 256 346 Q 308 330 360 346"
        stroke="#38BDF8"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* 3D Holographic Crystal Prism (Diamond Core) */}
      <g filter={showGlow ? 'url(#vv-neon-glow)' : undefined}>
        {/* Top Facet */}
        <polygon points="256,108 294,146 256,170 218,146" fill="url(#vv-diamond-top)" />
        {/* Left Facet */}
        <polygon points="218,146 256,170 256,218 218,146" fill="url(#vv-diamond-left)" />
        {/* Right Facet */}
        <polygon points="294,146 256,170 256,218 294,146" fill="url(#vv-diamond-right)" />
        {/* Facet Edges */}
        <polygon
          points="256,108 294,146 256,218 218,146"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <line x1="256" y1="108" x2="256" y2="218" stroke="#FFFFFF" strokeWidth="3" />
      </g>

      {/* Apex Sparkle Star */}
      <path
        d="M 256 88 L 261 101 L 274 106 L 261 111 L 256 124 L 251 111 L 238 106 L 251 101 Z"
        fill="#FFFFFF"
      />

      {/* Laser Hologram Projection Horizon */}
      <line
        x1="156"
        y1="208"
        x2="356"
        y2="208"
        stroke="#67E8F9"
        strokeWidth="3.5"
        strokeOpacity="0.85"
        strokeLinecap="round"
      />
    </svg>
  );
};
