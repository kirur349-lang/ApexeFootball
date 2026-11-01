import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTelegramDiagnosticInfo, triggerHaptic } from '../utils/telegram';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Server,
  Key,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface AuthDiagnosticsScreenProps {
  onClose?: () => void;
}

export const AuthDiagnosticsScreen: React.FC<AuthDiagnosticsScreenProps> = ({ onClose }) => {
  const { authError, authErrorCode, authDiagnostics, loginWithTelegram, loginAsDevMock, clearError } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);
  const [showRawDetails, setShowRawDetails] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    tested: boolean;
    telegramConfigured?: boolean;
    vercelBlobConfigured?: boolean;
    blobStatus?: string;
  }>({ tested: false });

  const clientDiag = getTelegramDiagnosticInfo();

  const handleRetry = async () => {
    setIsRetrying(true);
    triggerHaptic('light');
    try {
      await loginWithTelegram();
    } finally {
      setIsRetrying(false);
    }
  };

  const checkHealth = async () => {
    triggerHaptic('light');
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus({
        tested: true,
        telegramConfigured: data.telegramConfigured,
        vercelBlobConfigured: data.vercelBlobConfigured,
        blobStatus: data.blobStatus,
      });
      triggerHaptic('success');
    } catch {
      setHealthStatus({
        tested: true,
        telegramConfigured: false,
        vercelBlobConfigured: false,
      });
      triggerHaptic('error');
    }
  };

  // Determine specific error explanation
  let errorTitle = 'Authentication Required';
  let guidanceMessage = 'To protect player accounts, Telegram cryptographically verifies all Mini App connections.';

  if (authErrorCode === 'MISSING_BOT_TOKEN') {
    errorTitle = 'TELEGRAM_BOT_TOKEN Missing on Vercel';
    guidanceMessage =
      'Your Vercel deployment does not have the TELEGRAM_BOT_TOKEN environment variable configured. The backend cannot verify your bot’s HMAC signature without it.';
  } else if (authErrorCode === 'SIGNATURE_MISMATCH') {
    errorTitle = 'Bot Token Signature Mismatch';
    guidanceMessage =
      'The TELEGRAM_BOT_TOKEN set in Vercel does not match the bot that generated this Mini App session. Ensure the token in Vercel matches your bot from @BotFather.';
  } else if (authErrorCode === 'MISSING_INIT_DATA') {
    errorTitle = 'No Signed Telegram Data Detected';
    guidanceMessage =
      'This Mini App was opened without signed Telegram parameters. Please open it through your bot’s "Open" menu button or inline keyboard.';
  } else if (authErrorCode === 'AUTH_DATE_EXPIRED') {
    errorTitle = 'Telegram Session Expired';
    guidanceMessage = 'The Telegram signature is older than 24 hours. Please close the window and re-open the Mini App from your bot.';
  }

  const isTokenConfigured =
    healthStatus.tested
      ? healthStatus.telegramConfigured
      : authDiagnostics?.botTokenConfigured !== false && authErrorCode !== 'MISSING_BOT_TOKEN';

  return (
    <div className="min-h-screen bg-[#FAFCFF] flex flex-col items-center justify-center p-4 selection:bg-[#087BFF] selection:text-white relative overflow-hidden">
      {/* Ambient Glass Glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-[#087BFF]/[0.08] blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-red-500/[0.04] blur-[80px]" />
      </div>

      <div className="glass-card max-w-md w-full rounded-3xl p-6 sm:p-7 border border-white/90 shadow-2xl relative">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5EDFA]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#087BFF] to-[#00D4FF] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-[#087BFF]/20">
              A
            </div>
            <div>
              <h1 className="text-xs font-black tracking-wider text-[#101C3A] uppercase">Apexify eFootball</h1>
              <span className="text-[10px] text-[#71819A]">Diagnostics</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Auth Status</span>
            </span>
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#71819A] hover:text-[#101C3A] transition-all"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Warning Hero */}
        <div className="text-center my-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#101C3A]">{errorTitle}</h2>
          <p className="text-xs text-[#71819A] mt-1.5 leading-relaxed">{authError || guidanceMessage}</p>
        </div>

        {/* Diagnostic Checklist */}
        <div className="my-5 rounded-2xl bg-white/70 border border-[#E5EDFA] p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between font-semibold text-[#101C3A] pb-2 border-b border-gray-100">
            <span className="text-[11px] uppercase tracking-wider text-[#71819A]">Verification Diagnostics</span>
            <button
              onClick={checkHealth}
              className="text-[10px] text-[#087BFF] hover:underline flex items-center gap-1 font-bold"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Test Server</span>
            </button>
          </div>

          {/* 1. Telegram WebApp SDK */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-[#101C3A]">
              <Smartphone className="w-3.5 h-3.5 text-[#71819A]" />
              <span>Telegram SDK</span>
            </div>
            {clientDiag.sdkLoaded ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Detected ({clientDiag.platform})</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500 font-semibold text-[10px] bg-red-50 px-2 py-0.5 rounded-full">
                <XCircle className="w-3 h-3" />
                <span>Not Loaded</span>
              </span>
            )}
          </div>

          {/* 2. initData Payload */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-[#101C3A]">
              <Key className="w-3.5 h-3.5 text-[#71819A]" />
              <span>Signed initData</span>
            </div>
            {clientDiag.hasInitData ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Present ({clientDiag.initDataLength}b)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 font-semibold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full">
                <XCircle className="w-3 h-3" />
                <span>Missing</span>
              </span>
            )}
          </div>

          {/* 3. Server Vercel Endpoint */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-[#101C3A]">
              <Server className="w-3.5 h-3.5 text-[#71819A]" />
              <span>Backend /api/auth</span>
            </div>
            {authErrorCode === 'NETWORK_OR_SERVER_ERROR' ? (
              <span className="flex items-center gap-1 text-red-500 font-semibold text-[10px] bg-red-50 px-2 py-0.5 rounded-full">
                <XCircle className="w-3 h-3" />
                <span>Unreachable</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Connected</span>
              </span>
            )}
          </div>

          {/* 4. TELEGRAM_BOT_TOKEN on Vercel */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-[#101C3A]">
              <Key className="w-3.5 h-3.5 text-[#71819A]" />
              <span>TELEGRAM_BOT_TOKEN</span>
            </div>
            {isTokenConfigured ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Configured</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600 font-bold text-[10px] bg-red-50 px-2 py-0.5 rounded-full">
                <XCircle className="w-3 h-3" />
                <span>Missing on Vercel</span>
              </span>
            )}
          </div>

          {/* 5. Vercel Blob Status Note */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-[#101C3A]">
              <Server className="w-3.5 h-3.5 text-[#71819A]" />
              <span>Permanent Storage</span>
            </div>
            {healthStatus.vercelBlobConfigured ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Vercel Blob Active</span>
              </span>
            ) : (
              <span className="text-[10px] text-[#71819A] bg-gray-50 px-2 py-0.5 rounded-full">
                <span>Session (Blob Pending)</span>
              </span>
            )}
          </div>
        </div>

        {/* Actionable Setup Hint */}
        {authErrorCode === 'MISSING_BOT_TOKEN' && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            <p className="font-bold mb-1">How to fix in 1 minute:</p>
            <ol className="list-decimal list-inside space-y-1 text-amber-800">
              <li>Open your <strong>Vercel Dashboard</strong>.</li>
              <li>Go to <strong>Project Settings → Environment Variables</strong>.</li>
              <li>Add key <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-mono">TELEGRAM_BOT_TOKEN</code>.</li>
              <li>Paste your bot token from <span className="font-semibold">@BotFather</span>.</li>
              <li>Redeploy your project on Vercel.</li>
            </ol>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full py-2.5 rounded-xl bg-[#087BFF] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-[#087BFF]/25 disabled:opacity-60 cursor-pointer"
          >
            {isRetrying ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isRetrying ? 'Verifying with Telegram...' : 'Retry Telegram Authentication'}</span>
          </button>

          <button
            onClick={() => {
              clearError();
              loginAsDevMock('rookie');
            }}
            className="w-full py-2.5 rounded-xl bg-white/80 hover:bg-white text-[#101C3A] text-xs font-bold border border-[#E5EDFA] flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#087BFF]" />
            <span>Preview with Dev Account (Rookie)</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#101C3A] text-xs font-bold transition-all cursor-pointer"
            >
              Close Diagnostics & Return to App
            </button>
          )}
        </div>

        {/* Collapsible Technical Details */}
        <div className="mt-4 pt-3 border-t border-[#E5EDFA]">
          <button
            onClick={() => setShowRawDetails((prev) => !prev)}
            className="w-full flex items-center justify-between text-[11px] text-[#71819A] hover:text-[#101C3A] font-medium"
          >
            <span>Technical Diagnostic Payload</span>
            {showRawDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRawDetails && (
            <div className="mt-2 p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto max-h-40 leading-relaxed">
              <pre>
                {JSON.stringify(
                  {
                    errorCode: authErrorCode,
                    error: authError,
                    client: clientDiag,
                    serverDiagnostics: authDiagnostics,
                    health: healthStatus.tested ? healthStatus : 'untested',
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
