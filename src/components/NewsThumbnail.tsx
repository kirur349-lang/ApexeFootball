import React from 'react';

interface NewsThumbnailProps {
  id: string;
  category: string;
}

export const NewsThumbnail: React.FC<NewsThumbnailProps> = ({ id, category }) => {
  if (id === 'news-1' || category === 'GAME NEWS') {
    // Gameplay Update / Patch
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-[#0c204d] to-[#087BFF] flex items-center justify-center overflow-hidden">
        {/* Subtle pitch pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 80">
          <circle cx="50" cy="40" r="28" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeDasharray="3 3" />
          <line x1="50" y1="0" x2="50" y2="80" stroke="#FFFFFF" strokeWidth="1.5" />
          <rect x="0" y="20" width="20" height="40" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-xs border border-white/30 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-white tracking-wider mt-1 drop-shadow-sm font-mono">v4.2.0</span>
        </div>
      </div>
    );
  }

  if (id === 'news-2' || category === 'TOURNAMENT') {
    // Tournament Cup / Apex Championship
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-[#0A1A3B] to-[#1E429F] flex items-center justify-center overflow-hidden">
        {/* Radial arena glow */}
        <div className="absolute w-20 h-20 bg-[#087BFF] rounded-full blur-xl opacity-60" />
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 80">
          <polygon points="50,10 85,30 85,70 50,78 15,70 15,30" stroke="#FFF" strokeWidth="1.2" fill="none" />
        </svg>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-9 h-9 rounded-lg bg-[#FFD700]/15 border border-[#FFD700]/50 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-[#FFD700]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-[#FFD700] tracking-wider mt-1 drop-shadow-sm">$5,000</span>
        </div>
      </div>
    );
  }

  if (id === 'news-3' || category === 'COINS') {
    // Safe Coins / Top-up
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-[#101C3A] via-[#0E2961] to-[#D98200] flex items-center justify-center overflow-hidden">
        <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-[#FFB800] rounded-full blur-lg opacity-40" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF9900] to-[#FFD700] border-2 border-white/80 flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-white tracking-widest mt-1 drop-shadow-sm uppercase">COINS</span>
        </div>
      </div>
    );
  }

  // PLAYER NEWS
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0c1836] to-[#044bb3] flex items-center justify-center overflow-hidden">
      <div className="absolute w-16 h-16 bg-[#00D4FF] rounded-full blur-lg opacity-35" />
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 80">
        <circle cx="50" cy="40" r="32" stroke="#00D4FF" strokeWidth="1.2" fill="none" strokeDasharray="4 4" />
        <line x1="15" y1="40" x2="85" y2="40" stroke="#FFF" strokeWidth="1" />
        <line x1="50" y1="10" x2="50" y2="70" stroke="#FFF" strokeWidth="1" />
      </svg>
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-white/15 border border-white/40 flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <span className="text-[10px] font-black text-[#00E5FF] tracking-wider mt-1 drop-shadow-sm font-mono">TOP 5</span>
      </div>
    </div>
  );
};
