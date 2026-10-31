import React, { useState } from 'react';
import { useAuth, DEV_MOCK_PRESETS } from '../context/AuthContext';
import { ShieldAlert, Users, Settings, Sparkles, X, Check, ExternalLink } from 'lucide-react';

interface DevPreviewBannerProps {
  onOpenSetupGuide: () => void;
}

export const DevPreviewBanner: React.FC<DevPreviewBannerProps> = ({ onOpenSetupGuide }) => {
  const { player, isDevPreview, loginAsDevMock, isNewAccount } = useAuth();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  if (!isDevPreview && !isNewAccount) return null;

  return (
    <>
      <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-b border-amber-300/40 px-3 py-1.5 flex items-center justify-between text-xs backdrop-blur-md select-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider shrink-0">
            DEV PREVIEW
          </span>
          <span className="text-[#101C3A] font-semibold truncate text-[11px]">
            {player?.firstName} ({player?.apexGamerTag})
          </span>
          {isNewAccount && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              <span>New Account Provisioned</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSwitchModal(true)}
            className="text-[11px] font-bold text-[#087BFF] hover:underline flex items-center gap-1"
          >
            <Users className="w-3 h-3" />
            <span>Switch Mock</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={onOpenSetupGuide}
            className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            <span>Bot Setup</span>
          </button>
        </div>
      </div>

      {/* Switch Mock Player Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full rounded-3xl p-5 shadow-2xl border border-white/90 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EDFA]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#087BFF]" />
                <h3 className="font-bold text-sm text-[#101C3A]">Switch Mock Player</h3>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-[#71819A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#71819A] mt-2 mb-3">
              Test player records, welcome coin bonuses, and rankings using realistic Telegram user payloads.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  loginAsDevMock('pro');
                  setShowSwitchModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-white/80 hover:bg-[#EBF4FF] border border-white/90 text-left flex items-center justify-between transition-all"
              >
                <div>
                  <h4 className="font-bold text-xs text-[#101C3A]">ViperX (Pro Competitor)</h4>
                  <p className="text-[11px] text-[#71819A]">Verified Division 1 rank, 2,130 coins</p>
                </div>
                {player?.username === DEV_MOCK_PRESETS.pro.username && (
                  <Check className="w-4 h-4 text-[#087BFF]" />
                )}
              </button>

              <button
                onClick={() => {
                  loginAsDevMock('rookie');
                  setShowSwitchModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-white/80 hover:bg-[#EBF4FF] border border-white/90 text-left flex items-center justify-between transition-all"
              >
                <div>
                  <h4 className="font-bold text-xs text-[#101C3A]">Alex (New Player / Rookie)</h4>
                  <p className="text-[11px] text-[#71819A]">250 welcome coins, Challenger rank</p>
                </div>
                {player?.username === DEV_MOCK_PRESETS.rookie.username && (
                  <Check className="w-4 h-4 text-[#087BFF]" />
                )}
              </button>

              <button
                onClick={() => {
                  loginAsDevMock('streamer');
                  setShowSwitchModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-white/80 hover:bg-[#EBF4FF] border border-white/90 text-left flex items-center justify-between transition-all"
              >
                <div>
                  <h4 className="font-bold text-xs text-[#101C3A]">Kage (Esports Streamer)</h4>
                  <p className="text-[11px] text-[#71819A]">Verified creator role, Master rank</p>
                </div>
                {player?.username === DEV_MOCK_PRESETS.streamer.username && (
                  <Check className="w-4 h-4 text-[#087BFF]" />
                )}
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5EDFA] flex justify-end">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 bg-[#087BFF] text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
