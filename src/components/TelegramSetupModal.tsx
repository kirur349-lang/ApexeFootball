import React, { useState } from 'react';
import { X, Copy, Check, Send, ShieldCheck, Key, Globe, ArrowRight } from 'lucide-react';

interface TelegramSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramSetupModal: React.FC<TelegramSetupModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-white/90 animate-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5EDFA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#101C3A]">Telegram Mini App Setup</h3>
              <p className="text-[11px] text-[#71819A]">Vercel Deployment & Bot Connection Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-[#71819A]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-[#101C3A]">
          {/* Step 1 */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90">
            <div className="flex items-center gap-2 font-bold text-[#101C3A] mb-1">
              <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Create Bot on Telegram with @BotFather</span>
            </div>
            <p className="text-[#71819A] leading-relaxed pl-7">
              Open Telegram and search for <strong>@BotFather</strong>. Send <code>/newbot</code>, choose a display name (e.g., <em>Apex eFootball</em>) and a bot username (e.g., <em>Apexify_eFootball_bot</em>).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90">
            <div className="flex items-center gap-2 font-bold text-[#101C3A] mb-1">
              <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Register the Mini App with @BotFather</span>
            </div>
            <p className="text-[#71819A] leading-relaxed pl-7">
              In @BotFather, send <code>/newapp</code>, pick your bot, set title and description, and when prompted for the Web App URL, enter your deployed Vercel URL:
            </p>
            <div className="mt-2 pl-7 flex items-center gap-2">
              <code className="px-2.5 py-1.5 rounded-lg bg-[#F4F8FD] font-mono text-[11px] text-[#087BFF] border border-[#E5EDFA] flex-1 truncate">
                https://apexefootball.vercel.app
              </code>
              <button
                onClick={() => handleCopy('https://apexefootball.vercel.app', 'url')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E5EDFA] hover:bg-slate-50 flex items-center gap-1 shrink-0"
              >
                {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90">
            <div className="flex items-center gap-2 font-bold text-[#101C3A] mb-1">
              <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Set Required Environment Variables in Vercel</span>
            </div>
            <p className="text-[#71819A] leading-relaxed pl-7 mb-2">
              In Vercel Project Settings &rarr; <strong>Environment Variables</strong>:
            </p>
            <div className="pl-7 space-y-1.5 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-[#0c1836] text-white flex items-center justify-between">
                <span>TELEGRAM_BOT_TOKEN=&quot;your_bot_token&quot;</span>
                <span className="text-[10px] text-amber-300 font-sans font-bold">REQUIRED</span>
              </div>
              <p className="text-[10px] text-[#71819A] font-sans mt-1">
                Under the <strong>Storage</strong> tab in Vercel, attach a <strong>Vercel Blob</strong> store. Vercel automatically injects <code>BLOB_READ_WRITE_TOKEN</code>.
              </p>
            </div>
          </div>

          {/* Security Assurance */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              <strong>Zero-Password Authentication:</strong> The server verifies the HMAC-SHA256 signature of Telegram&apos;s <code>initData</code>. Accounts are securely keyed by the verified Telegram User ID.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#E5EDFA] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#087BFF] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-[#087BFF]/25"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
