import React, { useState } from 'react';
import { Trophy, Calendar, Users, Flame, Clock, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { MatchSchedule } from '../types';
import { MATCH_SCHEDULES } from '../data/mockData';

import { useAuth } from '../context/AuthContext';

interface TournamentsViewProps {
  onBackToHome: () => void;
  onOpenLiveMatch: () => void;
  onRequireAuth?: (reason: string) => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  onBackToHome,
  onOpenLiveMatch,
  onRequireAuth,
}) => {
  const { player } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LIVE' | 'UPCOMING' | 'FINISHED'>('ALL');
  const [selectedMatch, setSelectedMatch] = useState<MatchSchedule | null>(null);
  const [votes, setVotes] = useState<Record<string, 'A' | 'B'>>({});
  const [registered, setRegistered] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [gamerTag, setGamerTag] = useState(player?.apexGamerTag || '');

  const filteredMatches = MATCH_SCHEDULES.filter((m) => {
    if (activeFilter === 'ALL') return true;
    return m.status === activeFilter;
  });

  const handleVote = (matchId: string, team: 'A' | 'B') => {
    setVotes((prev) => ({ ...prev, [matchId]: team }));
  };

  const handleRegisterClick = () => {
    if (!player) {
      onRequireAuth?.('Register for Global Master Bracket Tournament');
      return;
    }
    setGamerTag(player.apexGamerTag);
    setShowRegModal(true);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) {
      setShowRegModal(false);
      onRequireAuth?.('Register for Global Master Bracket Tournament');
      return;
    }
    if (!gamerTag.trim()) return;
    setRegistered(true);
    setShowRegModal(false);
  };

  return (
    <div className="w-full pb-24 pt-2 max-w-2xl mx-auto px-4">
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
            Apex Championships
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#71819A] uppercase tracking-wider block">Prize Pool</span>
          <span className="text-sm font-black text-[#087BFF]">$5,000 USD</span>
        </div>
      </div>

      {/* Hero Tournament Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#071738] via-[#0b2b6e] to-[#087BFF] p-5 text-white shadow-md border border-[#E5EDFA] mb-5">
        <div className="relative z-10 max-w-[70%]">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-extrabold tracking-wider mb-2 border border-white/20">
            <Trophy className="w-3 h-3 text-[#FFD700]" />
            <span>SEASON 4 FINALS</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black leading-tight">
            Global Master Bracket 2026
          </h2>
          <p className="text-xs text-white/80 mt-1 line-clamp-2">
            128 players, double-elimination, official eFootball Mobile rules.
          </p>

          <div className="mt-3 flex items-center gap-2">
            {registered ? (
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Registered: Seed #94</span>
              </span>
            ) : (
              <button
                onClick={handleRegisterClick}
                className="px-3.5 py-1.5 bg-[#FFD700] hover:bg-[#ffc800] text-[#101C3A] font-extrabold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
              >
                Register to Play
              </button>
            )}
            <button
              onClick={onOpenLiveMatch}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/30 active:scale-95 transition-all"
            >
              Watch Arena
            </button>
          </div>
        </div>

        {/* Subtle decorative trophy outline on right */}
        <div className="absolute -right-4 -bottom-6 w-36 h-36 opacity-20 pointer-events-none">
          <Award className="w-full h-full text-white" />
        </div>
      </div>

      {/* Interactive Match Schedule Widgets Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-[#101C3A]">
            Match Schedule & Fixtures
          </h3>
          <span className="text-xs text-[#71819A]">Best-of-3 Format</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(['ALL', 'LIVE', 'UPCOMING', 'FINISHED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-[#087BFF] text-white shadow-xs'
                  : 'bg-[#F4F7FC] text-[#71819A] hover:text-[#101C3A]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {filteredMatches.map((match) => {
          const isLive = match.status === 'LIVE';
          const userVoted = votes[match.id];

          return (
            <div
              key={match.id}
              className={`rounded-2xl p-4 transition-all duration-300 ${
                isLive
                  ? 'glass-card border-[#087BFF]/50 shadow-[0_8px_30px_rgba(8,123,255,0.18)]'
                  : 'glass-card'
              }`}
            >
              {/* Match Top Bar */}
              <div className="flex items-center justify-between border-b border-[#E5EDFA] pb-2.5 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#101C3A]">{match.stage}</span>
                  <span className="text-[#71819A]">·</span>
                  <span className="text-[#71819A]">{match.bracketGroup}</span>
                </div>

                {isLive ? (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                    <span className="text-[10px] font-black tracking-wider uppercase">
                      LIVE {match.matchTimeMinute}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[#71819A]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{match.time}</span>
                  </div>
                )}
              </div>

              {/* Head to Head Teams */}
              <div className="grid grid-cols-7 items-center gap-2 my-2">
                {/* Team A */}
                <div className="col-span-3 text-right">
                  <h4 className="font-bold text-sm text-[#101C3A] leading-tight truncate">
                    {match.teamA.name}
                  </h4>
                  <p className="text-[11px] text-[#71819A] truncate">
                    {match.teamA.player} ({match.teamA.tag})
                  </p>
                </div>

                {/* Score or VS */}
                <div className="col-span-1 text-center">
                  {match.status === 'UPCOMING' ? (
                    <span className="text-xs font-black text-[#71819A] px-2 py-1 bg-[#F4F7FC] rounded-lg">
                      VS
                    </span>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`text-base font-black ${
                          isLive ? 'text-[#087BFF]' : 'text-[#101C3A]'
                        }`}
                      >
                        {match.teamA.score}
                      </span>
                      <span className="text-xs text-[#71819A]">-</span>
                      <span
                        className={`text-base font-black ${
                          isLive ? 'text-[#087BFF]' : 'text-[#101C3A]'
                        }`}
                      >
                        {match.teamB.score}
                      </span>
                    </div>
                  )}
                </div>

                {/* Team B */}
                <div className="col-span-3 text-left">
                  <h4 className="font-bold text-sm text-[#101C3A] leading-tight truncate">
                    {match.teamB.name}
                  </h4>
                  <p className="text-[11px] text-[#71819A] truncate">
                    {match.teamB.player} ({match.teamB.tag})
                  </p>
                </div>
              </div>

              {/* Bottom Interactive Bar (Community Prediction & Watch) */}
              <div className="mt-3 pt-2.5 border-t border-[#E5EDFA] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#71819A] mr-1">Predict Winner:</span>
                  <button
                    onClick={() => handleVote(match.id, 'A')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      userVoted === 'A'
                        ? 'bg-[#087BFF] text-white border-[#087BFF]'
                        : 'bg-[#F4F7FC] text-[#101C3A] border-[#E5EDFA] hover:bg-[#E5EDFA]'
                    }`}
                  >
                    {match.teamA.tag}
                  </button>
                  <button
                    onClick={() => handleVote(match.id, 'B')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      userVoted === 'B'
                        ? 'bg-[#087BFF] text-white border-[#087BFF]'
                        : 'bg-[#F4F7FC] text-[#101C3A] border-[#E5EDFA] hover:bg-[#E5EDFA]'
                    }`}
                  >
                    {match.teamB.tag}
                  </button>
                </div>

                {isLive ? (
                  <button
                    onClick={onOpenLiveMatch}
                    className="inline-flex items-center gap-1 text-[#087BFF] font-bold hover:underline"
                  >
                    <span>Watch Stream</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="inline-flex items-center gap-1 text-[#71819A] hover:text-[#087BFF]"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl border border-[#E5EDFA]">
            <h3 className="text-base font-bold text-[#101C3A] mb-1">
              Apex Championship Entry
            </h3>
            <p className="text-xs text-[#71819A] mb-4">
              Enter your competitive gamer handle to register for the 128-player master bracket.
            </p>
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#101C3A] mb-1">
                  eFootball Gamer Tag
                </label>
                <input
                  type="text"
                  value={gamerTag}
                  onChange={(e) => setGamerTag(e.target.value)}
                  placeholder="e.g. Apex_Viper"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E5EDFA] text-xs bg-[#F8FAFD] focus:bg-white focus:outline-none focus:border-[#087BFF]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="flex-1 py-2 rounded-xl border border-[#E5EDFA] text-xs font-semibold text-[#71819A] hover:bg-[#F4F7FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#087BFF] text-white text-xs font-bold shadow-sm"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match Details Quick Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl border border-[#E5EDFA]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-[#087BFF]">{selectedMatch.stage}</span>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-xs text-[#71819A] hover:text-[#101C3A]"
              >
                Close
              </button>
            </div>
            <h4 className="text-sm font-bold text-[#101C3A] text-center mb-1">
              {selectedMatch.teamA.name} vs {selectedMatch.teamB.name}
            </h4>
            <p className="text-xs text-[#71819A] text-center mb-4">Scheduled for {selectedMatch.time}</p>
            <div className="p-3 bg-[#F4F8FD] rounded-xl text-xs space-y-2 border border-[#E5EDFA]">
              <div className="flex justify-between">
                <span className="text-[#71819A]">Stage:</span>
                <span className="font-semibold text-[#101C3A]">{selectedMatch.bracketGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71819A]">Platform:</span>
                <span className="font-semibold text-[#101C3A]">Mobile Dedicated Server</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71819A]">Prizes:</span>
                <span className="font-semibold text-[#101C3A]">Winner advances to Semifinals</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedMatch(null)}
              className="mt-4 w-full py-2 bg-[#087BFF] text-white text-xs font-bold rounded-xl"
            >
              Back to Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
