import React from 'react';
import { ArrowLeft, Share2, Clock, Calendar, CheckCircle2, Bookmark } from 'lucide-react';
import { NewsItem } from '../types';
import { NewsThumbnail } from './NewsThumbnail';

interface ArticleModalProps {
  article: NewsItem | null;
  onClose: () => void;
  onNavigateCoins?: () => void;
  onNavigateTournaments?: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onNavigateCoins,
  onNavigateTournaments,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  if (!article) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md flex justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white/92 backdrop-blur-2xl min-h-screen sm:min-h-0 sm:my-8 sm:rounded-3xl shadow-[0_20px_60px_rgba(8,123,255,0.18)] overflow-hidden flex flex-col border border-white/80">
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-20 glass-header px-4 h-14 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 -ml-2 rounded-xl text-[#101C3A] hover:bg-white/80 active:scale-95 transition-all text-xs font-semibold border border-transparent hover:border-white/60 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#087BFF]" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaved(!saved)}
              aria-label="Bookmark"
              className={`p-2 rounded-full transition-colors border ${
                saved
                  ? 'text-[#087BFF] bg-[#EBF4FF] border-[#087BFF]/30'
                  : 'text-[#71819A] bg-white/60 hover:bg-white border-white/80 shadow-xs'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share Article"
              className="p-2 rounded-full text-[#71819A] bg-white/60 hover:bg-white border border-white/80 shadow-xs transition-colors relative"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -bottom-8 right-0 bg-[#101C3A] text-white text-[10px] py-1 px-2 rounded-md shadow-md whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Article Body Content */}
        <div className="p-5 sm:p-7 flex-1">
          {/* Hero Thumbnail Banner */}
          <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-white/80 shadow-sm mb-5 relative">
            <NewsThumbnail id={article.id} category={article.category} />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/20 pointer-events-none rounded-2xl" />
          </div>

          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-xs mb-2.5">
            <span className="font-extrabold text-[#087BFF] uppercase tracking-wider text-[11px]">
              {article.category}
            </span>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1 text-[#71819A]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{article.date}</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center gap-1 text-[#71819A]">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime}</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#101C3A] leading-snug tracking-tight mb-3">
            {article.title}
          </h1>

          {/* Summary Lead */}
          <p className="text-sm sm:text-base text-[#101C3A]/90 font-medium bg-[#F4F8FD] p-3.5 rounded-xl border border-[#E5EDFA] mb-6">
            {article.summary}
          </p>

          {/* Key Highlights */}
          {article.keyHighlights && article.keyHighlights.length > 0 && (
            <div className="mb-6 bg-white p-4 rounded-xl border border-[#E5EDFA] shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#101C3A] mb-2.5">
                Key Points & Intel
              </h3>
              <ul className="space-y-2">
                {article.keyHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-[#101C3A]">
                    <CheckCircle2 className="w-4 h-4 text-[#087BFF] shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Body Paragraphs */}
          <div className="space-y-4 text-sm sm:text-base text-[#101C3A]/85 leading-relaxed">
            {article.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Contextual CTAs based on Category */}
          {article.category === 'COINS' && onNavigateCoins && (
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-[#0c2356] to-[#087BFF] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div>
                <h4 className="text-sm font-bold">Ready to top up your squad?</h4>
                <p className="text-xs text-white/80">Get instant coin delivery with 15% bonus.</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateCoins();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-white text-[#087BFF] font-bold text-xs rounded-lg hover:bg-slate-100 active:scale-95 transition-all shadow-xs shrink-0"
              >
                Go to Coins Store
              </button>
            </div>
          )}

          {article.category === 'TOURNAMENT' && onNavigateTournaments && (
            <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-[#0c1836] to-[#087BFF] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div>
                <h4 className="text-sm font-bold">Register for Apex Championship</h4>
                <p className="text-xs text-white/80">Compete for the $5,000 cash pool.</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateTournaments();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-[#FFD700] text-[#101C3A] font-extrabold text-xs rounded-lg hover:bg-[#ffc800] active:scale-95 transition-all shadow-xs shrink-0"
              >
                View Tournament Bracket
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
