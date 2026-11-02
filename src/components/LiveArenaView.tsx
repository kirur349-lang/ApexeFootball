import React, { useState, useEffect } from 'react';
import { Radio, Users, Volume2, VolumeX, MessageSquare, Flame } from 'lucide-react';
import { useLiveArenaCurrent } from '../services/firestoreData';

interface LiveArenaViewProps {
  onBackToHome: () => void;
}

interface CommentaryEvent {
  id: number;
  minute: string;
  type: 'goal' | 'save' | 'foul' | 'tactic';
  text: string;
}

export const LiveArenaView: React.FC<LiveArenaViewProps> = ({ onBackToHome }) => {
  const arenaData = useLiveArenaCurrent();
  const [minute, setMinute] = useState(74);
  const [scoreA, setScoreA] = useState(2);
  const [scoreB, setScoreB] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [cheers, setCheers] = useState({ fire: 342, goal: 589, clap: 218 });
  const [commentary, setCommentary] = useState<CommentaryEvent[]>([
    {
      id: 1,
      minute: "72'",
      type: 'goal',
      text: 'GOAL! ViperX slots it into the bottom-right corner with a clinical double-touch finish! Apex Velocity takes the lead 2-1!',
    },
    {
      id: 2,
      minute: "68'",
      type: 'save',
      text: 'Tremendous reflex save from Kage_99’s goalkeeper denying a dipping long-range curler!',
    },
    {
      id: 3,
      minute: "61'",
      type: 'tactic',
      text: 'Nova Esports adjusts tactical instruction to Full-Back Overlap & Gegenpress.',
    },
    {
      id: 4,
      minute: "44'",
      type: 'goal',
      text: 'GOAL! Nova Esports equalizes 1-1 right before the halftime whistle from a near-post corner header.',
    },
  ]);

  // Subtle live clock simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setMinute((m) => (m < 90 ? m + 1 : 90));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleCheer = (type: 'fire' | 'goal' | 'clap') => {
    setCheers((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  return (
    <div className="w-full pb-24 pt-2 max-w-2xl mx-auto px-4">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <button
            onClick={onBackToHome}
            className="text-xs text-[#087BFF] font-semibold hover:underline mb-0.5"
          >
            ← Back to Home
          </button>
          <h1 className="text-xl font-extrabold text-[#101C3A] tracking-tight flex items-center gap-2">
            <span>Apex Live Arena</span>
            {arenaData?.isLive !== false ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                LIVE
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500 text-white text-[10px] font-black uppercase tracking-wider">
                OFFLINE
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#71819A]">
          <Users className="w-3.5 h-3.5" />
          <span className="font-mono font-bold text-[#101C3A]">
            {arenaData?.viewerCount
              ? `${arenaData.viewerCount.toLocaleString()} watching`
              : '14,820 watching'}
          </span>
        </div>
      </div>

      {/* Live Stream / Match Pitch Simulator Screen */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0A162D] border border-[#E5EDFA] shadow-lg mb-4 aspect-video flex flex-col justify-between p-4 text-white">
        {/* Pitch Lines background */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 225">
          <rect x="20" y="20" width="360" height="185" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          <line x1="200" y1="20" x2="200" y2="205" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="200" cy="112" r="35" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          <circle cx="200" cy="112" r="3" fill="#FFFFFF" />
        </svg>

        {/* Ambient Stadium Lighting */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-[#087BFF]/30 blur-2xl rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-[#00D4FF]/20 blur-2xl rounded-full" />

        {/* Video Top Controls */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold border border-white/10 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
            <span>{arenaData?.tournamentName || 'Grand Final · Game 3 of 5'}</span>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg bg-black/50 backdrop-blur-md hover:bg-black/70 border border-white/10"
            aria-label="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Score Overlay Centerpiece */}
        <div className="relative z-10 my-auto flex items-center justify-center">
          <div className="bg-[#071329]/90 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-6">
            <div className="text-center">
              <span className="block text-xs font-black tracking-wider text-[#00E5FF]">APX</span>
              <span className="text-[10px] text-white/70 max-w-[80px] truncate block">
                {arenaData?.player1Name || 'ViperX'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-white font-mono">
                {arenaData?.player1Score ?? scoreA}
              </span>
              <span className="text-xs font-bold text-white/40">:</span>
              <span className="text-3xl font-black text-white font-mono">
                {arenaData?.player2Score ?? scoreB}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-xs font-black tracking-wider text-[#FFD700]">NVA</span>
              <span className="text-[10px] text-white/70 max-w-[80px] truncate block">
                {arenaData?.player2Name || 'Kage_99'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Match Clock & Possession bar */}
        <div className="relative z-10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-emerald-400 bg-black/50 px-2 py-0.5 rounded">
              {arenaData?.currentMinute ? `${arenaData.currentMinute}'` : `${minute}'`}
            </span>
            <span className="text-[11px] text-white/80">Possession: APX 54% - 46% NVA</span>
          </div>
          <span className="text-[10px] text-white/60 font-mono">
            {arenaData?.resolution || '1080p'} {arenaData?.fps || 60}fps
          </span>
        </div>
      </div>

      {/* Cheer Reactions Strip */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5EDFA] shadow-xs mb-4">
        <span className="text-xs font-bold text-[#101C3A]">Live Match Fan Cheers:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleCheer('fire')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-bold text-orange-600 active:scale-95 transition-all"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{cheers.fire}</span>
          </button>
          <button
            onClick={() => handleCheer('goal')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-[#087BFF] active:scale-95 transition-all"
          >
            <span>⚽</span>
            <span>{cheers.goal}</span>
          </button>
          <button
            onClick={() => handleCheer('clap')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-600 active:scale-95 transition-all"
          >
            <span>👏</span>
            <span>{cheers.clap}</span>
          </button>
        </div>
      </div>

      {/* Live Match Commentary Feed */}
      <div className="bg-white rounded-2xl border border-[#E5EDFA] p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E5EDFA] pb-2.5 mb-3">
          <h3 className="text-sm font-bold text-[#101C3A] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#087BFF]" />
            <span>Match Intel & Commentary Feed</span>
          </h3>
          <span className="text-[11px] text-[#71819A]">Auto-updating</span>
        </div>

        <div className="space-y-3">
          {commentary.map((event) => (
            <div key={event.id} className="flex items-start gap-3 text-xs">
              <span className="font-mono font-bold text-[#087BFF] bg-[#EBF4FF] px-1.5 py-0.5 rounded text-[11px] shrink-0">
                {event.minute}
              </span>
              <p className="text-[#101C3A] leading-relaxed flex-1">
                {event.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
