import React from 'react';

interface PromoArtworkProps {
  slideId: string;
}

export const PromotionalArtwork: React.FC<PromoArtworkProps> = ({ slideId }) => {
  if (slideId === 'slide-1') {
    // eFOOTBALL COINS ARTWORK
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c2356] via-[#0b388b] to-[#087BFF]" />
        
        {/* Pitch Lines / Tech Overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 600 300" preserveAspectRatio="none">
          <circle cx="500" cy="150" r="140" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeDasharray="6 6" />
          <circle cx="500" cy="150" r="40" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          <path d="M 380 0 L 380 300" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M 380 70 L 460 70 L 460 230 L 380 230" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          {/* Subtle grid lines */}
          <path d="M 0 100 L 600 100 M 0 200 L 600 200" stroke="#FFFFFF" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.3" />
        </svg>

        {/* Ambient Glows */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#00D4FF] rounded-full blur-3xl opacity-40" />
        <div className="absolute right-32 top-6 w-36 h-36 bg-[#FFB800] rounded-full blur-2xl opacity-20" />

        {/* 3D Visual Graphic: Glowing Coins & Football Shield on Right Side */}
        <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-44 sm:w-56 h-44 sm:h-52 flex items-center justify-center">
          {/* Outer Rotating Energy Ring */}
          <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full border border-[#FFD700]/30 border-dashed" />

          {/* Holographic Player Card Base */}
          <div className="absolute w-24 sm:w-28 h-36 sm:h-40 rounded-xl bg-gradient-to-tr from-[#051838] to-[#0A3D80] border border-white/30 shadow-2xl rotate-12 -right-1 sm:right-2 backdrop-blur-sm p-2 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] text-white font-extrabold tracking-wider">
              <span className="text-[#FFD700]">EPIC</span>
              <span className="bg-[#087BFF] px-1 py-0.5 rounded text-[9px]">104</span>
            </div>
            <div className="my-auto flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <svg className="w-6 h-6 text-[#FFD700]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <span className="text-[10px] text-white font-bold mt-1">SHOWTIME</span>
            </div>
            <div className="text-[9px] text-center text-white/70 font-mono">BOOSTER</div>
          </div>

          {/* Main Glowing eFootball Coin */}
          <div className="relative z-10 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-gradient-to-tr from-[#E5A100] via-[#FFD700] to-[#FFF099] shadow-[0_0_35px_rgba(255,215,0,0.45)] border-2 border-white/80 flex items-center justify-center transform -translate-x-3 -rotate-6">
            {/* Inner Ring */}
            <div className="w-20 sm:w-26 h-20 sm:h-26 rounded-full border border-[#B37E00] flex items-center justify-center bg-gradient-to-b from-[#FFAE00] to-[#E58900]">
              <div className="text-center">
                <svg className="w-9 sm:w-12 h-9 sm:h-12 text-white drop-shadow-md mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.93 4.93 4.24 4.24" />
                  <path d="m14.83 9.17 4.24-4.24" />
                  <path d="m14.83 14.83 4.24 4.24" />
                  <path d="m9.17 14.83-4.24 4.24" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <div className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#5B3D00] uppercase mt-0.5">eCOIN</div>
              </div>
            </div>
            {/* Shimmer Sparkle */}
            <div className="absolute top-2 right-4 w-3 h-3 bg-white rounded-full blur-[1px] animate-ping opacity-75" />
          </div>

          {/* Secondary Stacked Coin */}
          <div className="absolute -bottom-1 -left-2 z-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-tr from-[#D98200] via-[#FFB800] to-[#FFE066] border border-white/60 shadow-lg flex items-center justify-center opacity-90">
            <div className="text-white font-extrabold text-xs sm:text-sm drop-shadow">+15%</div>
          </div>
        </div>

        {/* Clean Vignette & Scrim on left for crystal-clear text readability */}
        <div className="absolute inset-y-0 left-0 w-4/5 sm:w-2/3 bg-gradient-to-r from-[#071738]/95 via-[#071738]/80 to-transparent z-10" />
      </div>
    );
  }

  if (slideId === 'slide-2') {
    // TOURNAMENTS ARTWORK
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1836] via-[#0e2c6c] to-[#044bb3]" />

        {/* Esports Arena Stadium Volumetric Lighting */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-32 h-64 bg-white/10 rotate-45 blur-2xl" />
          <div className="absolute top-0 right-10 w-48 h-72 bg-[#087BFF]/30 -rotate-30 blur-2xl" />
          <div className="absolute -bottom-10 right-20 w-52 h-52 bg-[#00E5FF]/20 rounded-full blur-3xl" />
        </div>

        {/* Stadium Hexagonal Grid & Field Markings */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 600 300" preserveAspectRatio="none">
          <polygon points="460,40 520,75 520,145 460,180 400,145 400,75" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          <polygon points="530,120 590,155 590,225 530,260 470,225 470,155" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          <circle cx="480" cy="150" r="100" stroke="#087BFF" strokeWidth="2" fill="none" strokeDasharray="4 8" />
        </svg>

        {/* Grand Championship Trophy Graphic */}
        <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-44 sm:w-56 h-44 sm:h-52 flex items-center justify-center">
          {/* Trophy Glow Aura */}
          <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00F0FF] blur-xl opacity-40 animate-pulse" />

          {/* Trophy Illustration */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Crown / Stars */}
            <div className="flex gap-1 mb-1">
              <span className="text-[#FFD700] text-xs">★</span>
              <span className="text-[#FFD700] text-sm font-bold">★</span>
              <span className="text-[#FFD700] text-xs">★</span>
            </div>

            {/* Cup Body */}
            <div className="relative w-24 sm:w-28 h-24 sm:h-28">
              {/* Trophy Cup SVG */}
              <svg className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" viewBox="0 0 100 100" fill="none">
                {/* Handles */}
                <path d="M 22 25 C 10 25 10 50 25 55 L 30 55" stroke="url(#trophySilver)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 78 25 C 90 25 90 50 75 55 L 70 55" stroke="url(#trophySilver)" strokeWidth="6" strokeLinecap="round" />
                {/* Main Vessel */}
                <path d="M 25 20 L 75 20 C 75 50 64 62 50 64 C 36 62 25 50 25 20 Z" fill="url(#trophyGold)" stroke="#FFF" strokeWidth="1.5" />
                {/* Cup Stem & Base */}
                <path d="M 45 64 L 55 64 L 56 76 L 44 76 Z" fill="url(#trophySilver)" />
                <path d="M 32 76 L 68 76 L 72 88 L 28 88 Z" fill="url(#trophyBase)" stroke="#FFF" strokeWidth="1" />
                {/* Emblem on Cup */}
                <circle cx="50" cy="40" r="10" fill="#0c1836" stroke="#00D4FF" strokeWidth="1.5" />
                <path d="M 47 43 L 50 35 L 53 43 L 45 38 L 55 38 Z" fill="#FFD700" />
                
                <defs>
                  <linearGradient id="trophyGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFF3A8" />
                    <stop offset="40%" stopColor="#FFCC00" />
                    <stop offset="100%" stopColor="#D48800" />
                  </linearGradient>
                  <linearGradient id="trophySilver" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#CBD5E1" />
                    <stop offset="100%" stopColor="#64748B" />
                  </linearGradient>
                  <linearGradient id="trophyBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Prize Badge Pill */}
            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00B4D8] border border-white/40 shadow-md">
              <span className="text-[10px] font-black text-white tracking-wider">$5,000 CASH</span>
            </div>
          </div>
        </div>

        {/* Clean Vignette & Scrim on left */}
        <div className="absolute inset-y-0 left-0 w-4/5 sm:w-2/3 bg-gradient-to-r from-[#081329]/95 via-[#081329]/80 to-transparent z-10" />
      </div>
    );
  }

  // SLIDE 3 — APEX NEWS ARTWORK
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1f44] via-[#09357a] to-[#0557cc]" />

      {/* Cyber tactical grid & radar */}
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 600 300" preserveAspectRatio="none">
        <circle cx="480" cy="150" r="130" stroke="#00D4FF" strokeWidth="1" fill="none" />
        <circle cx="480" cy="150" r="85" stroke="#00D4FF" strokeWidth="1.5" fill="none" strokeDasharray="8 6" />
        <circle cx="480" cy="150" r="40" stroke="#FFFFFF" strokeWidth="1" fill="none" />
        <line x1="350" y1="150" x2="600" y2="150" stroke="#00D4FF" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="480" y1="20" x2="480" y2="280" stroke="#00D4FF" strokeWidth="1" strokeDasharray="3 3" />
      </svg>

      {/* Dynamic Action Graphic: Pro Player Strike & Data Intel */}
      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-44 sm:w-56 h-44 sm:h-52 flex items-center justify-center">
        {/* Glow */}
        <div className="absolute w-40 h-40 bg-[#087BFF] rounded-full blur-2xl opacity-50" />
        
        {/* Floating Patch Info Card */}
        <div className="relative z-10 w-36 sm:w-44 bg-[#0a1836]/90 border border-[#087BFF]/50 rounded-xl p-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-[10px] font-bold text-[#00E5FF] tracking-wider uppercase">v4.2.0 PATCH</span>
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#087BFF]" />
              <span className="text-[10px] text-white/90 font-medium truncate">Shielding Inertia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
              <span className="text-[10px] text-white/90 font-medium truncate">Smart AI Wing Runs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
              <span className="text-[10px] text-white/90 font-medium truncate">Low Latency Netcode</span>
            </div>
          </div>
          <div className="mt-2.5 pt-1.5 border-t border-white/10 flex justify-between items-center">
            <span className="text-[9px] text-white/50 font-mono">KONAMI LIVE</span>
            <span className="text-[9px] text-[#00E5FF] font-bold">100% READY</span>
          </div>
        </div>
      </div>

      {/* Clean Vignette & Scrim on left */}
      <div className="absolute inset-y-0 left-0 w-4/5 sm:w-2/3 bg-gradient-to-r from-[#071530]/95 via-[#071530]/80 to-transparent z-10" />
    </div>
  );
};
