interface LogoProps {
  size?: number;
  animated?: boolean;
  showText?: boolean;
}

export default function NaradLogo({ size = 80, animated = false, showText = false }: LogoProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative ${animated ? 'animate-pulse-glow' : ''}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 512 512" className="w-full h-full">
          <defs>
            <linearGradient id="naradShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="50%" stopColor="#00B8D4" />
              <stop offset="100%" stopColor="#006B7D" />
            </linearGradient>
            <linearGradient id="naradEyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#0099B8" />
            </linearGradient>
            <radialGradient id="naradCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="1" />
              <stop offset="100%" stopColor="#006B7D" stopOpacity="0.3" />
            </radialGradient>
            <filter id="naradGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="naradGlowStrong">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer hex ring */}
          <polygon
            points="256,40 420,120 420,360 256,440 92,360 92,120"
            fill="none"
            stroke="rgba(0,229,255,0.15)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* Shield outline */}
          <path
            d="M256 72 L400 128 L400 280 Q400 384 256 444 Q112 384 112 280 L112 128 Z"
            fill="rgba(0, 229, 255, 0.03)"
            stroke="url(#naradShieldGrad)"
            strokeWidth="14"
            strokeLinejoin="round"
            filter="url(#naradGlow)"
          />

          {/* Inner shield accent */}
          <path
            d="M256 104 L372 152 L372 276 Q372 364 256 416 Q140 364 140 276 L140 152 Z"
            fill="none"
            stroke="rgba(0, 229, 255, 0.15)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Circuit lines - tech decoration */}
          <path d="M160 180 L200 180 L200 200 L240 200" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1.5" />
          <path d="M352 180 L312 180 L312 200 L272 200" fill="none" stroke="rgba(0,229,255,0.2)" strokeWidth="1.5" />
          <circle cx="200" cy="180" r="3" fill="rgba(0,229,255,0.4)" />
          <circle cx="312" cy="180" r="3" fill="rgba(0,229,255,0.4)" />

          {/* Third eye / Trinetra - the core */}
          <ellipse cx="256" cy="220" rx="62" ry="44" fill="none" stroke="url(#naradEyeGrad)" strokeWidth="12" filter="url(#naradGlow)" />
          <circle cx="256" cy="220" r="24" fill="url(#naradCore)" filter="url(#naradGlowStrong)" />
          <circle cx="256" cy="220" r="10" fill="#050B18" />
          <circle cx="256" cy="220" r="4" fill="#00E5FF" />

          {/* Iris detail lines */}
          <line x1="232" y1="220" x2="244" y2="220" stroke="#00E5FF" strokeWidth="1.5" opacity="0.6" />
          <line x1="268" y1="220" x2="280" y2="220" stroke="#00E5FF" strokeWidth="1.5" opacity="0.6" />
          <line x1="256" y1="196" x2="256" y2="204" stroke="#00E5FF" strokeWidth="1.5" opacity="0.6" />
          <line x1="256" y1="236" x2="256" y2="244" stroke="#00E5FF" strokeWidth="1.5" opacity="0.6" />

          {/* Sound waves / Aakashvani */}
          <path d="M190 288 Q256 268 322 288" fill="none" stroke="#00E5FF" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
          <path d="M208 312 Q256 298 304 312" fill="none" stroke="#00E5FF" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
          <path d="M224 334 Q256 324 288 334" fill="none" stroke="#00E5FF" strokeWidth="4" strokeLinecap="round" opacity="0.3" />

          {/* Bottom data lines */}
          <line x1="196" y1="368" x2="316" y2="368" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          <line x1="216" y1="384" x2="296" y2="384" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
        </svg>
      </div>
      {showText && (
        <div className="text-center">
          <h1 className="font-display text-2xl font-black tracking-widest text-narad-primary text-glow">NARAD</h1>
          <p className="font-deva text-sm text-narad-muted tracking-wide">नारद</p>
        </div>
      )}
    </div>
  );
}
