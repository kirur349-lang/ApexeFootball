import React from 'react';
import { Bell, User } from 'lucide-react';
import { PlayerProfile } from '../types/player';

interface HeaderProps {
  unreadCount: number;
  onOpenNotifications: () => void;
  player?: PlayerProfile | null;
  isLoading?: boolean;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadCount,
  onOpenNotifications,
  player,
  isLoading,
  onOpenProfile,
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Reset img error if player photo changes
  React.useEffect(() => {
    setImgError(false);
  }, [player?.photoUrl]);

  return (
    <header className="sticky top-0 z-30 w-full glass-header transition-colors duration-300">
      {/* Specular hairline light reflection along top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Apexify Logo + Brand Name */}
        <div className="flex items-center gap-2.5 select-none">
          {/* Apexify Custom Esports Logo with Glass Luster */}
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-[#087BFF] via-[#1A87FF] to-[#42A1FF] shadow-[0_2px_10px_rgba(8,123,255,0.30)] flex items-center justify-center p-1.5 shrink-0 transition-transform active:scale-95 border border-white/40">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-full h-full text-white drop-shadow-xs"
            >
              <path
                d="M12 2.5L20 19H15.2L12 11.5L8.8 19H4L12 2.5Z"
                fill="currentColor"
              />
              <path
                d="M12 14.5L14.2 19.5H9.8L12 14.5Z"
                fill="#FFFFFF"
                opacity="0.9"
              />
            </svg>
            <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
          </div>

          {/* Brand Name */}
          <span className="text-xl font-extrabold tracking-tight text-[#101C3A]">
            Apexify
          </span>
        </div>

        {/* Right: Authenticated Player Badge or Guest Pill + Glass Notification Bell */}
        <div className="flex items-center gap-2">
          {isLoading && !player ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 backdrop-blur-md border border-white/70 shadow-xs text-xs animate-pulse select-none"
              title="Connecting Telegram player profile..."
            >
              <div className="w-4 h-4 rounded-full bg-[#087BFF]/20" />
              <span className="text-[11px] font-bold text-[#71819A]">Syncing...</span>
            </div>
          ) : player ? (
            <button
              onClick={onOpenProfile}
              aria-label="View Player Profile"
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_2px_8px_rgba(8,123,255,0.06)] active:scale-95 transition-all text-xs group"
            >
              {/* Coin Balance Chip */}
              <div className="flex items-center gap-1 font-mono font-bold text-[#101C3A]">
                <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#FFAE00] to-[#FFD700] flex items-center justify-center text-[8px] text-white shadow-xs">
                  e
                </span>
                <span className="text-[11px]">{player.coinsBalance.toLocaleString()}</span>
              </div>

              {/* Player Avatar */}
              <div className="relative w-5 h-5 rounded-full bg-[#087BFF] text-white font-extrabold text-[9px] flex items-center justify-center ring-1 ring-white shadow-xs overflow-hidden shrink-0">
                {player.photoUrl && !imgError ? (
                  <img
                    src={player.photoUrl}
                    alt=""
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{player.firstName.slice(0, 2).toUpperCase()}</span>
                )}
                {/* Verified Green Dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenProfile}
              aria-label="Guest Profile"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_2px_8px_rgba(8,123,255,0.06)] active:scale-95 transition-all text-xs text-[#71819A] hover:text-[#101C3A]"
            >
              <div className="w-4 h-4 rounded-full bg-[#71819A]/15 flex items-center justify-center">
                <User className="w-2.5 h-2.5 text-[#71819A]" />
              </div>
              <span className="text-[11px] font-bold">Guest</span>
            </button>
          )}

          {/* Glass Notification Bell Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full bg-white/60 hover:bg-white/90 backdrop-blur-md border border-white/80 shadow-[0_2px_8px_rgba(8,123,255,0.06)] flex items-center justify-center text-[#101C3A] hover:text-[#087BFF] active:scale-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087BFF]"
          >
            <Bell className="w-4 h-4 text-[#101C3A] transition-colors" strokeWidth={2.2} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#087BFF] shadow-[0_0_6px_#087BFF] ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
