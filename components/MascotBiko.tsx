import React from 'react';

interface MascotBikoProps {
  expression?: 'welcoming' | 'thinking' | 'happy' | 'celebrating' | 'alert';
  size?: number;
  className?: string;
  animate?: boolean;
}

export function MascotBiko({
  expression = 'welcoming',
  size = 140,
  className = '',
  animate = true,
}: MascotBikoProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-md ${animate ? 'transition-transform duration-300 hover:scale-105' : ''}`}
      >
        {/* Shadow Ground */}
        <ellipse cx="100" cy="188" rx="55" ry="8" fill="#e2e8f0" opacity="0.6" />

        {/* Glow Halo / Aura for Celebrating */}
        {expression === 'celebrating' && (
          <circle cx="100" cy="100" r="88" fill="#fef08a" opacity="0.4" className="animate-pulse" />
        )}

        {/* Owl Ear Tufts */}
        <path
          d="M60 48 L75 22 L90 42 Z"
          fill="#4f46e5"
          stroke="#4338ca"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M140 48 L125 22 L110 42 Z"
          fill="#4f46e5"
          stroke="#4338ca"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Outer Body / Head (Soft Indigo/Violet) */}
        <rect
          x="44"
          y="36"
          width="112"
          height="136"
          rx="56"
          fill="url(#bikoBodyGrad)"
          stroke="#4338ca"
          strokeWidth="3.5"
        />

        {/* Soft Tummy / Breast (Warm Cream) */}
        <ellipse cx="100" cy="126" rx="42" ry="46" fill="#fef9c3" opacity="0.95" />

        {/* Cute Feathers Pattern on Chest */}
        <path d="M90 114 Q100 120 110 114" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M85 128 Q95 134 105 128" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M96 142 Q106 148 116 142" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Owl Wings */}
        {expression === 'celebrating' ? (
          // Wings Raised Up in Joy
          <>
            <path
              d="M48 95 C30 75 25 50 42 45 C50 65 52 82 52 95 Z"
              fill="#6366f1"
              stroke="#4338ca"
              strokeWidth="3"
            />
            <path
              d="M152 95 C170 75 175 50 158 45 C150 65 148 82 148 95 Z"
              fill="#6366f1"
              stroke="#4338ca"
              strokeWidth="3"
            />
          </>
        ) : (
          // Relaxed Wings at sides
          <>
            <path
              d="M46 95 C36 115 38 140 50 150 C54 135 52 110 48 95 Z"
              fill="#4338ca"
              stroke="#3730a3"
              strokeWidth="2.5"
            />
            <path
              d="M154 95 C164 115 162 140 150 150 C146 135 148 110 152 95 Z"
              fill="#4338ca"
              stroke="#3730a3"
              strokeWidth="2.5"
            />
          </>
        )}

        {/* Eyes White Base Background */}
        <circle cx="76" cy="80" r="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="124" cy="80" r="24" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Eyes Expression Pupils */}
        {expression === 'happy' || expression === 'celebrating' ? (
          // Inverted Arches (Happy Smiling Eyes)
          <>
            <path d="M66 82 Q76 70 86 82" stroke="#1e1b4b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M114 82 Q124 70 134 82" stroke="#1e1b4b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </>
        ) : expression === 'thinking' ? (
          // Looking up / to the side thoughtfully
          <>
            <circle cx="78" cy="74" r="10" fill="#1e1b4b" />
            <circle cx="81" cy="71" r="3.5" fill="#ffffff" />
            <circle cx="126" cy="74" r="10" fill="#1e1b4b" />
            <circle cx="129" cy="71" r="3.5" fill="#ffffff" />
          </>
        ) : expression === 'alert' ? (
          // Wide watchful pupils
          <>
            <circle cx="76" cy="80" r="13" fill="#1e1b4b" />
            <circle cx="73" cy="76" r="4.5" fill="#ffffff" />
            <circle cx="124" cy="80" r="13" fill="#1e1b4b" />
            <circle cx="121" cy="76" r="4.5" fill="#ffffff" />
          </>
        ) : (
          // Welcoming Big Sparkly Eyes
          <>
            <circle cx="76" cy="80" r="11" fill="#1e1b4b" />
            <circle cx="73" cy="76" r="4" fill="#ffffff" />
            <circle cx="79" cy="83" r="2" fill="#ffffff" />
            <circle cx="124" cy="80" r="11" fill="#1e1b4b" />
            <circle cx="121" cy="76" r="4" fill="#ffffff" />
            <circle cx="127" cy="83" r="2" fill="#ffffff" />
          </>
        )}

        {/* Blush Cheeks */}
        <ellipse cx="60" cy="98" rx="8" ry="5" fill="#fda4af" opacity="0.8" />
        <ellipse cx="140" cy="98" rx="8" ry="5" fill="#fda4af" opacity="0.8" />

        {/* Iconic Round Scholarly Glasses (Golden/Teal Frame) */}
        <circle
          cx="76"
          cy="80"
          r="26"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4"
        />
        <circle
          cx="124"
          cy="80"
          r="26"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4"
        />
        {/* Glasses Bridge */}
        <path d="M102 80 L98 80" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

        {/* Cute Orange Beak */}
        <path
          d="M94 92 L106 92 L100 106 Z"
          fill="#f97316"
          stroke="#c2410c"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Cute Counselor Scarf (Teal & Amber) */}
        <path
          d="M66 122 Q100 134 134 122 C138 128 132 136 126 138 Q100 146 74 138 C68 135 62 128 66 122 Z"
          fill="#0d9488"
          stroke="#0f766e"
          strokeWidth="2.5"
        />
        <path
          d="M110 134 L114 162 L128 160 L124 133 Z"
          fill="#14b8a6"
          stroke="#0f766e"
          strokeWidth="2"
        />

        {/* Cute Little Feet */}
        <ellipse cx="80" cy="174" rx="10" ry="5" fill="#f97316" />
        <ellipse cx="120" cy="174" rx="10" ry="5" fill="#f97316" />

        {/* Graduation / Counselor Star Badge on Scarf */}
        <circle cx="119" cy="148" r="4.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />

        {/* Sparkles for Celebrating */}
        {expression === 'celebrating' && (
          <>
            <path d="M25 40 L30 45 L25 50 L20 45 Z" fill="#fbbf24" />
            <path d="M175 40 L180 45 L175 50 L170 45 Z" fill="#fbbf24" />
            <path d="M185 85 L188 90 L185 95 L182 90 Z" fill="#38bdf8" />
            <path d="M15 85 L18 90 L15 95 L12 90 Z" fill="#f43f5e" />
          </>
        )}

        {/* SVG Gradients */}
        <defs>
          <linearGradient id="bikoBodyGrad" x1="44" y1="36" x2="156" y2="172" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="0.6" stopColor="#4f46e5" />
            <stop offset="1" stopColor="#4338ca" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
