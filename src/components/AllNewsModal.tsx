import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, ChevronRight } from 'lucide-react';
import { NewsItem } from '../types';
import { NewsThumbnail } from './NewsThumbnail';

interface AllNewsModalProps {
  news: NewsItem[];
  onClose: () => void;
  onSelectArticle: (article: NewsItem) => void;
}

const CATEGORIES = ['ALL', 'GAME NEWS', 'TOURNAMENT', 'COINS', 'PLAYER NEWS'];

export const AllNewsModal: React.FC<AllNewsModalProps> = ({
  news,
  onClose,
  onSelectArticle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [news, selectedCategory, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FAFCFF] flex flex-col">
      {/* Ambient background light */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#087BFF]/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4FF]/[0.04] rounded-full blur-[100px]" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 glass-header px-4 h-14 flex items-center justify-between max-w-2xl mx-auto w-full">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 py-1.5 px-3 -ml-2 rounded-xl text-[#101C3A] hover:bg-white/80 active:scale-95 transition-all text-xs font-semibold border border-transparent hover:border-white/60 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#087BFF]" />
          <span>Home</span>
        </button>
        <span className="text-sm font-bold text-[#101C3A]">News & Intel Hub</span>
        <div className="w-12" /> {/* balance spacing */}
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 pt-4 pb-20 flex-1">
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71819A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news, updates, tournaments..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 text-xs sm:text-sm text-[#101C3A] placeholder-[#71819A] focus:outline-none focus:border-[#087BFF]/40 focus:bg-white transition-all shadow-[0_2px_12px_rgba(8,123,255,0.04)]"
          />
        </div>

        {/* Category Filter Pills (Functional button filters) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all select-none ${
                selectedCategory === cat
                  ? 'bg-[#087BFF] text-white shadow-xs'
                  : 'bg-[#F4F7FC] text-[#71819A] hover:text-[#101C3A] hover:bg-[#EBF2FA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* News List */}
        <div className="space-y-3">
          {filteredNews.length > 0 ? (
            filteredNews.map((item) => (
              <article
                key={item.id}
                onClick={() => onSelectArticle(item)}
                className="glass-card group relative w-full rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 cursor-pointer text-left hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300"
              >
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden shrink-0 border border-white/80 shadow-xs relative">
                  <NewsThumbnail id={item.id} category={item.category} />
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <span className="text-[10px] font-bold tracking-wider text-[#087BFF] uppercase mb-0.5 block">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#101C3A] group-hover:text-[#087BFF] transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#71819A]">
                    <span>{item.date}</span>
                    <span>·</span>
                    <span>{item.readTime}</span>
                  </div>
                </div>
                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-white/40 group-hover:bg-[#087BFF]/10 text-[#71819A] group-hover:text-[#087BFF] group-hover:translate-x-0.5 transition-all duration-200 border border-white/60 group-hover:border-[#087BFF]/20">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-12 text-[#71819A]">
              <p className="text-sm">No articles match your criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs font-semibold text-[#087BFF] hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
