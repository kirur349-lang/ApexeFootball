import React, { useState } from 'react';
import {
  Send,
  Shield,
  BookOpen,
  Bell,
  Smartphone,
  ChevronRight,
  ExternalLink,
  User,
  Edit2,
  Check,
  Award,
  Coins,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTelegramWebApp, triggerHaptic } from '../utils/telegram';

interface MoreViewProps {
  onBackToHome: () => void;
  onOpenNotifications: () => void;
  onOpenSetupGuide?: () => void;
  onRequireAuth?: (reason: string) => void;
  onOpenDiagnostics?: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  onBackToHome,
  onOpenNotifications,
  onOpenSetupGuide,
  onRequireAuth,
  onOpenDiagnostics,
}) => {
  const { player, updatePlayerProfile, isDevPreview } = useAuth();
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Edit states
  const [isEditingGamerTag, setIsEditingGamerTag] = useState(false);
  const [gamerTagInput, setGamerTagInput] = useState(player?.apexGamerTag || '');
  const [isEditingKonamiId, setIsEditingKonamiId] = useState(false);
  const [konamiIdInput, setKonamiIdInput] = useState(player?.konamiId || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tg = getTelegramWebApp();

  const handleSaveGamerTag = async () => {
    if (!gamerTagInput.trim()) return;
    const ok = await updatePlayerProfile({ apexGamerTag: gamerTagInput });
    if (ok) {
      setIsEditingGamerTag(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleSaveKonamiId = async () => {
    const ok = await updatePlayerProfile({ konamiId: konamiIdInput });
    if (ok) {
      setIsEditingKonamiId(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  return (
    <div className="w-full pb-28 pt-2 max-w-2xl mx-auto px-4">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <button
            onClick={onBackToHome}
            className="text-xs text-[#087BFF] font-semibold hover:underline mb-0.5"
          >
            ← Back to Home
          </button>
          <h1 className="text-xl font-extrabold text-[#101C3A] tracking-tight">
            Player Profile & Settings
          </h1>
        </div>
        <span className="text-xs font-mono bg-white/70 border border-white/80 text-[#087BFF] font-bold px-2.5 py-1 rounded-full shadow-xs">
          v4.2.0
        </span>
      </div>

      {/* Verified Telegram Player Account Card */}
      {player && (
        <div className="glass-card rounded-3xl p-5 mb-4 shadow-[0_12px_36px_rgba(8,123,255,0.08)] border border-white/90 relative overflow-hidden">
          {/* Subtle top light sheen */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

          <div className="flex items-start gap-4">
            {/* Telegram Profile Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#087BFF] to-[#389BFD] border-2 border-white shadow-md flex items-center justify-center text-white font-extrabold text-xl overflow-hidden shrink-0">
              {player.photoUrl ? (
                <img src={player.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                player.firstName.slice(0, 2).toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-base text-[#101C3A] truncate">
                  {player.firstName} {player.lastName || ''}
                </h3>
                {player.isPremium && (
                  <span className="px-1.5 py-0.2 rounded-md bg-[#0088cc]/10 text-[#0088cc] font-black text-[9px] uppercase tracking-wider">
                    STAR
                  </span>
                )}
                {isDevPreview && (
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-700 font-bold text-[9px] uppercase tracking-wider">
                    DEV MOCK
                  </span>
                )}
                {player.isBlobPending && (
                  <span className="px-1.5 py-0.2 rounded-md bg-blue-500/10 text-[#087BFF] font-bold text-[9px] uppercase tracking-wider" title="Real Telegram account active in session memory. Attach Vercel Blob in Vercel Dashboard for permanent player saves.">
                    SESSION (BLOB PENDING)
                  </span>
                )}
              </div>

              {player.username && (
                <p className="text-xs text-[#71819A] font-mono">@{player.username}</p>
              )}

              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#71819A]">
                <span>Telegram ID: <strong className="font-mono text-[#101C3A]">{player.telegramId}</strong></span>
                <span>·</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Player Gaming Meta Stats Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#E5EDFA]">
            <div className="p-2.5 rounded-2xl bg-white/60 border border-white/80 text-center">
              <span className="text-[10px] text-[#71819A] block uppercase font-bold tracking-wider">Coins</span>
              <span className="text-sm font-black text-[#087BFF] font-mono">
                {player.coinsBalance.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/60 border border-white/80 text-center">
              <span className="text-[10px] text-[#71819A] block uppercase font-bold tracking-wider">Rank</span>
              <span className="text-xs font-bold text-[#101C3A] truncate block">
                {player.rankTitle}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/60 border border-white/80 text-center">
              <span className="text-[10px] text-[#71819A] block uppercase font-bold tracking-wider">Matches</span>
              <span className="text-sm font-black text-[#101C3A] font-mono">
                {player.matchesPlayed}
              </span>
            </div>
          </div>

          {/* Editable Gaming Profile Fields */}
          <div className="mt-4 pt-3 border-t border-[#E5EDFA] space-y-3">
            {/* Apex Gamer Tag */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#101C3A]">Apex Esports Gamer Tag</span>
                {!isEditingGamerTag ? (
                  <button
                    onClick={() => {
                      setGamerTagInput(player.apexGamerTag);
                      setIsEditingGamerTag(true);
                    }}
                    className="text-[#087BFF] font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveGamerTag}
                    className="text-emerald-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                )}
              </div>
              {isEditingGamerTag ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={gamerTagInput}
                    onChange={(e) => setGamerTagInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#087BFF] bg-white text-xs font-bold text-[#101C3A] focus:outline-none"
                    placeholder="Enter gamer tag..."
                  />
                  <button
                    onClick={handleSaveGamerTag}
                    className="px-3 py-1.5 rounded-xl bg-[#087BFF] text-white text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-white/60 border border-white/80 text-xs font-bold text-[#101C3A] font-mono">
                  {player.apexGamerTag}
                </div>
              )}
            </div>

            {/* Konami / Game ID */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#101C3A]">eFootball Konami ID</span>
                {!isEditingKonamiId ? (
                  <button
                    onClick={() => {
                      setKonamiIdInput(player.konamiId || '');
                      setIsEditingKonamiId(true);
                    }}
                    className="text-[#087BFF] font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{player.konamiId ? 'Edit' : 'Link ID'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveKonamiId}
                    className="text-emerald-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                )}
              </div>
              {isEditingKonamiId ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={konamiIdInput}
                    onChange={(e) => setKonamiIdInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#087BFF] bg-white text-xs font-mono text-[#101C3A] focus:outline-none"
                    placeholder="e.g. 842-195-302"
                  />
                  <button
                    onClick={handleSaveKonamiId}
                    className="px-3 py-1.5 rounded-xl bg-[#087BFF] text-white text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-white/60 border border-white/80 text-xs text-[#71819A] font-mono">
                  {player.konamiId || 'No Konami ID linked yet (click Link ID to connect)'}
                </div>
              )}
            </div>

            {saveSuccess && (
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Profile updated in Vercel storage!</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Guest Explorer Card (shown when browsing without login) */}
      {!player && (
        <div className="glass-card rounded-3xl p-5 mb-4 shadow-[0_12px_36px_rgba(8,123,255,0.08)] border border-white/90 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border-2 border-white shadow-md flex items-center justify-center text-[#71819A] text-xl shrink-0">
              <User className="w-8 h-8 text-[#71819A]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-base text-[#101C3A]">
                  Guest Visitor
                </h3>
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[#71819A] font-bold text-[9px] uppercase tracking-wider">
                  PUBLIC MODE
                </span>
              </div>
              <p className="text-xs text-[#71819A] mt-1 leading-relaxed">
                You can freely browse tournaments, match arena, and coin store. Sign in with Telegram to compete in brackets and save your records.
              </p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onRequireAuth?.('Player Profile & Settings')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#087BFF] hover:bg-[#076ee5] text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Sign In with Telegram</span>
                </button>
                {onOpenDiagnostics && (
                  <button
                    onClick={onOpenDiagnostics}
                    className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[#101C3A] font-semibold text-xs border border-[#E5EDFA] active:scale-95 transition-all"
                  >
                    Diagnostics
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Mini App Status Card */}
      <div className="glass-card rounded-3xl p-4 mb-4 border border-white/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#101C3A]">Telegram Mini App Foundation</h3>
              <p className="text-xs text-[#71819A]">
                {tg?.platform ? `Platform: ${tg.platform} · WebApp v${tg.version || '8.0'}` : 'Vercel Serverless + Vercel Blob'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenDiagnostics && (
              <button
                onClick={onOpenDiagnostics}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#101C3A] text-xs font-semibold active:scale-95 transition-all"
              >
                Diagnostics
              </button>
            )}
            {onOpenSetupGuide && (
              <button
                onClick={onOpenSetupGuide}
                className="px-2.5 py-1.5 rounded-xl bg-[#EBF4FF] hover:bg-[#D8EAFF] text-[#087BFF] text-xs font-bold active:scale-95 transition-all flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Guide</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Community & Esports Links */}
      <div className="glass-card rounded-3xl p-4 mb-4 border border-white/90">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#71819A] mb-2.5">
          Community & Esports
        </h3>
        <div className="divide-y divide-[#E5EDFA]">
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 flex items-center justify-between hover:bg-white/60 rounded-xl px-2 -mx-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EBF4FF] text-[#087BFF] flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#101C3A]">Apex Telegram Channel</h4>
                <p className="text-xs text-[#71819A]">Tournament updates & coin flash sales</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#71819A]" />
          </a>

          <div className="py-3 flex items-center justify-between hover:bg-white/60 rounded-xl px-2 -mx-2 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/70 text-[#087BFF] flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#101C3A]">Fair Play & Anticheat Code</h4>
                <p className="text-xs text-[#71819A]">Official Konami competitive guidelines</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#71819A]" />
          </div>

          <div className="py-3 flex items-center justify-between hover:bg-white/60 rounded-xl px-2 -mx-2 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/70 text-[#087BFF] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#101C3A]">Tournament Rulebook</h4>
                <p className="text-xs text-[#71819A]">Division guidelines, match duration & rules</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#71819A]" />
          </div>
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="glass-card rounded-3xl p-4 mb-4 border border-white/90">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#71819A] mb-2.5">
          App Preferences
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/70 text-[#087BFF] flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#101C3A]">Telegram Haptic Feedback</h4>
                <p className="text-xs text-[#71819A]">Vibration feedback on Mini App taps</p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !hapticsEnabled;
                setHapticsEnabled(next);
                if (next) triggerHaptic('light');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                hapticsEnabled ? 'bg-[#087BFF]' : 'bg-[#E5EDFA]'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E5EDFA]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/70 text-[#087BFF] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#101C3A]">Tournament Alerts</h4>
                <p className="text-xs text-[#71819A]">Notifications when your match is up</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                notificationsEnabled ? 'bg-[#087BFF]' : 'bg-[#E5EDFA]'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
