import React from 'react';
import { ShieldCheck, Zap, Sparkles, Check } from 'lucide-react';
import { CoinPackage } from '../types';
import { COIN_PACKAGES } from '../data/mockData';

interface CoinsStoreViewProps {
  onBackToHome: () => void;
  onSelectPackage: (pkg: CoinPackage) => void;
}

export const CoinsStoreView: React.FC<CoinsStoreViewProps> = ({
  onBackToHome,
  onSelectPackage,
}) => {
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
            eFootball Coins Store
          </h1>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Safe Delivery</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0a1f49] via-[#0c2f7b] to-[#087BFF] p-5 text-white shadow-md border border-[#E5EDFA] mb-5">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#FFD700] uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WEEKEND PROMOTION ACTIVE</span>
        </div>
        <h2 className="text-lg font-black">Direct Game ID Top-Up</h2>
        <p className="text-xs text-slate-200 mt-1 max-w-sm">
          No passwords required. Delivery directly into your account in under 60 seconds with 24/7 automated processing.
        </p>
      </div>

      {/* Coin Packages Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {COIN_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => onSelectPackage(pkg)}
            className={`relative rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-98 flex flex-col justify-between ${
              pkg.popular
                ? 'glass-card border-[#087BFF]/60 ring-2 ring-[#087BFF]/20 shadow-[0_10px_30px_rgba(8,123,255,0.16)]'
                : 'glass-card'
            }`}
          >
            {/* Tag badge */}
            {pkg.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#087BFF] text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                MOST POPULAR
              </span>
            )}
            {pkg.bestValue && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#FFD700] text-[#101C3A] text-[9px] font-black uppercase tracking-wider shadow-xs">
                BEST VALUE
              </span>
            )}

            <div>
              {/* Coin Icon Graphics */}
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-[#FF9900] via-[#FFB800] to-[#FFE066] border-2 border-white shadow-md flex items-center justify-center my-2">
                <span className="text-white font-black text-sm">e</span>
              </div>

              {/* Amount */}
              <div className="text-base font-black text-[#101C3A]">
                {(pkg.coins + pkg.bonus).toLocaleString()}
              </div>
              <span className="text-[11px] text-[#71819A] block">eFootball Coins</span>

              {pkg.bonus > 0 ? (
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +{pkg.bonus} Free Bonus
                </span>
              ) : (
                <span className="inline-block mt-1 text-[10px] font-medium text-[#71819A]">
                  Standard Pack
                </span>
              )}
            </div>

            {/* Price Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPackage(pkg);
              }}
              className="mt-3 w-full py-2 rounded-xl bg-[#F4F8FD] hover:bg-[#087BFF] hover:text-white text-[#087BFF] font-bold text-xs border border-[#E5EDFA] transition-colors"
            >
              {pkg.price}
            </button>
          </div>
        ))}
      </div>

      {/* Safety Guarantee Features */}
      <div className="bg-white rounded-2xl border border-[#E5EDFA] p-4 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#101C3A]">Apexify Safety Guarantee</h3>
        <div className="space-y-2 text-xs text-[#71819A]">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#087BFF] shrink-0" />
            <span>Authorized direct Konami server top-up channels.</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#087BFF] shrink-0" />
            <span>Zero ban guarantee — over 250,000 successful refills.</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#087BFF] shrink-0" />
            <span>24/7 automated delivery confirmation via Telegram bot.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
