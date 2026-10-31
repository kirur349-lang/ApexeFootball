import React from 'react';
import { ChevronRight } from 'lucide-react';
import { NewsItem } from '../types';
import { NewsThumbnail } from './NewsThumbnail';

interface LatestNewsSectionProps {
  news: NewsItem[];
  onSelectArticle: (article: NewsItem) => void;
  onViewAllNews: () => void;
}

export const LatestNewsSection: React.FC<LatestNewsSectionProps> = ({
  news,
  onSelectArticle,
  onViewAllNews,
}) => {
  // Enforce strictly four news cards on the homepage as requested in rule #6
  const displayNews = news.slice(0, 4);

  return (
    <section className="w-full pt-3 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-lg font-bold text-[#101C3A] tracking-tight">
            Latest News
          </h2>
          <button
            onClick={onViewAllNews}
            className="text-xs sm:text-sm font-semibold text-[#087BFF] hover:text-[#0665d0] inline-flex items-center gap-1 group active:scale-95 transition-all focus:outline-none"
          >
            <span>View All</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>

        {/* Four Horizontal Glass News Cards */}
        <div className="space-y-3">
          {displayNews.map((item) => (
            <article
              key={item.id}
              onClick={() => onSelectArticle(item)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectArticle(item);
                }
              }}
              className="glass-card group relative w-full rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 cursor-pointer text-left select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087BFF] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300"
            >
              {/* Subtle top specular sheen */}
              <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

              {/* Left: Thumbnail Image (sharp, beautiful rounded corners) */}
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden shrink-0 border border-white/80 shadow-xs relative">
                <NewsThumbnail id={item.id} category={item.category} />
                {/* Thin glass sheen over edge */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/20 pointer-events-none rounded-xl" />
              </div>

              {/* Right: News Details */}
              <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                {/* Category Label */}
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#087BFF] uppercase mb-0.5">
                  {item.category}
                </span>

                {/* News Headline */}
                <h3 className="text-sm font-bold text-[#101C3A] group-hover:text-[#087BFF] transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>

                {/* Publication Date */}
                <div className="flex items-center gap-2 mt-1 text-xs text-[#71819A]">
                  <span>{item.date}</span>
                </div>
              </div>

              {/* Far Right: Translucent arrow badge */}
              <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-white/40 group-hover:bg-[#087BFF]/10 text-[#71819A] group-hover:text-[#087BFF] group-hover:translate-x-0.5 transition-all duration-200 border border-white/60 group-hover:border-[#087BFF]/20">
                <ChevronRight className="w-4 h-4" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
