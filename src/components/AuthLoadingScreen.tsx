import React from 'react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFCFF] p-4 select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -right-16 w-80 h-80 rounded-full bg-[#087BFF]/[0.08] blur-[90px]" />
      <div className="absolute bottom-1/4 -left-16 w-80 h-80 rounded-full bg-[#00D4FF]/[0.06] blur-[90px]" />

      {/* Frosted Glass Card Container */}
      <div className="relative z-10 glass-card rounded-3xl p-8 max-w-xs w-full text-center flex flex-col items-center shadow-[0_16px_40px_rgba(8,123,255,0.12)] border border-white/90">
        {/* Pulsing Apex Crest */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#087BFF] via-[#1A87FF] to-[#42A1FF] shadow-[0_4px_20px_rgba(8,123,255,0.4)] flex items-center justify-center p-3 mb-5 border border-white/50 animate-pulse">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
            <path d="M12 2.5L20 19H15.2L12 11.5L8.8 19H4L12 2.5Z" fill="currentColor" />
            <path d="M12 14.5L14.2 19.5H9.8L12 14.5Z" fill="#FFFFFF" opacity="0.9" />
          </svg>
          <div className="absolute inset-0 rounded-2xl ring-2 ring-white/40 pointer-events-none" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-black text-[#101C3A] tracking-tight">Apex eFootball</h2>
        <p className="text-xs text-[#71819A] mt-1">Telegram Mini App Foundation</p>

        {/* Loading Spinner & Status */}
        <div className="mt-6 flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-[#087BFF] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#101C3A]">Verifying Telegram session...</span>
        </div>
      </div>
    </div>
  );
};
