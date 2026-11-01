import React, { useState } from 'react';
import { Send, Shield, Trophy, Zap, X, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isInsideTelegram, triggerHaptic } from '../utils/telegram';

interface TelegramAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string | null;
  onOpenDiagnostics?: () => void;
}

export const TelegramAuthModal: React.FC<TelegramAuthModalProps> = ({
  isOpen,
  onClose,
  reason,
  onOpenDiagnostics,
}) => {
  const { loginWithTelegram, loginAsDevMock, isLoading } = useAuth();
  const [retrying, setRetrying] = useState(false);
  const insideTg = isInsideTelegram();

  if (!isOpen) return null;

  const handleRetryTelegram = async () => {
    setRetrying(true);
    triggerHaptic('light');
    try {
      await loginWithTelegram();
      onClose();
    } finally {
      setRetrying(false);
    }
  };

  const handleDevMock = async () => {
    triggerHaptic('light');
    await loginAsDevMock('rookie');
    onClose();
  };

  const handleOpenBot = () => {
    triggerHaptic('light');
    // Open Telegram bot link
    window.open('https://t.me/ApexEFootballBot', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4 selection:bg-[#087BFF] selection:text-white">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(8,123,255,0.22)] overflow-hidden border border-white/80 animate-in zoom-in-95 duration-200 relative">
        {/* Top subtle light reflection */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/60 flex items-center justify-between glass-header">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#087BFF] text-white flex items-center justify-center shadow-xs">
              <Send className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-extrabold text-sm text-[#101C3A]">
              Telegram Account Required
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/60 hover:bg-white border border-white/80 flex items-center justify-center text-[#71819A] hover:text-[#101C3A] active:scale-90 transition-all shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Reason Badge */}
          {reason && (
            <div className="mb-4 p-3 rounded-2xl bg-[#087BFF]/[0.08] border border-[#087BFF]/20 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-[#087BFF] shrink-0 mt-0.5" />
              <div className="text-xs text-[#101C3A]">
                <span className="font-bold block text-[#087BFF]">Action: {reason}</span>
                <span className="text-[#71819A]">
                  Verified player identity is required to participate and save records.
                </span>
              </div>
            </div>
          )}

          {/* Hero Banner Icon */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#087BFF] to-[#00D4FF] text-white flex items-center justify-center mx-auto mb-3 shadow-[0_4px_16px_rgba(8,123,255,0.30)] border border-white/40">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-base font-extrabold text-[#101C3A]">
              Sign in with Telegram
            </h4>
            <p className="text-xs text-[#71819A] mt-1 max-w-xs mx-auto leading-relaxed">
              Link your Telegram identity to compete in tournaments, purchase coins, and track your eFootball career ranking.
            </p>
          </div>

          {/* Features Checklist */}
          <div className="space-y-2 mb-6 bg-[#F8FAFD] p-3.5 rounded-2xl border border-[#E5EDFA]">
            <div className="flex items-center gap-2.5 text-xs text-[#101C3A]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium">Compete for $5,000 USD prize pools</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#101C3A]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium">Direct Konami ID coin top-ups in 60s</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-[#101C3A]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium">250 welcome bonus coins on registration</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {insideTg ? (
              <button
                onClick={handleRetryTelegram}
                disabled={retrying || isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-[#087BFF] hover:bg-[#076fe6] active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-[#087BFF]/25 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{retrying || isLoading ? 'Authenticating...' : 'Sign in with Telegram'}</span>
              </button>
            ) : (
              <button
                onClick={handleOpenBot}
                className="w-full py-3 px-4 rounded-2xl bg-[#087BFF] hover:bg-[#076fe6] active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-[#087BFF]/25 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Open in Telegram Bot</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}

            {/* Browser preview helper */}
            {!insideTg && (
              <button
                onClick={handleDevMock}
                className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-[#E5EDFA] text-[#101C3A] font-semibold text-xs active:scale-[0.99] flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Test Action in Dev Preview Mode</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-2xl text-xs font-semibold text-[#71819A] hover:text-[#101C3A] hover:bg-slate-100/60 transition-all text-center"
            >
              Continue Browsing as Guest
            </button>
          </div>

          {/* Diagnostics Link */}
          {onOpenDiagnostics && (
            <div className="mt-4 pt-3 border-t border-[#E5EDFA] text-center">
              <button
                onClick={() => {
                  onClose();
                  onOpenDiagnostics();
                }}
                className="text-[11px] font-semibold text-[#087BFF] hover:underline"
              >
                View Telegram & Backend Auth Diagnostics
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
