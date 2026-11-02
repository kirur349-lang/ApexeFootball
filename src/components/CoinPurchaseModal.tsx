import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Zap, ArrowRight, Send, AlertCircle } from 'lucide-react';
import { CoinPackage } from '../types';
import { useAuth } from '../context/AuthContext';

interface CoinPurchaseModalProps {
  packageItem: CoinPackage | null;
  onClose: () => void;
  onRequireAuth?: (reason: string) => void;
}

export const CoinPurchaseModal: React.FC<CoinPurchaseModalProps> = ({
  packageItem,
  onClose,
  onRequireAuth,
}) => {
  const { player, token } = useAuth();
  const [gameId, setGameId] = useState(player?.konamiId || '');
  const [platform, setPlatform] = useState<'mobile' | 'console'>('mobile');
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  if (!packageItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!player) {
      onRequireAuth?.('Purchase eFootball Coins');
      return;
    }

    if (!gameId.trim()) {
      setError('Please enter your 9-digit Konami Game ID');
      return;
    }
    if (gameId.replace(/\D/g, '').length < 8) {
      setError('Game ID should be 8-9 numerical digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const numericPrice = parseFloat(packageItem.price.replace(/[^0-9.]/g, '')) || 0.99;
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          packageId: packageItem.id,
          packageName: `${(packageItem.coins + packageItem.bonus).toLocaleString()} Coins Package`,
          packageCoins: packageItem.coins + packageItem.bonus,
          amountUsd: numericPrice,
          paymentMethod: platform === 'mobile' ? 'eFootball Mobile In-App' : 'Console/PC Gateway',
          efootballId: gameId.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setCreatedOrder(data.order);
        setStep('success');
      } else {
        setError(data.error || 'Failed to submit coin order to Apex Firestore');
      }
    } catch (err: any) {
      setError(`Network error: ${err.message || 'Could not reach order server'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/92 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(8,123,255,0.20)] overflow-hidden border border-white/80 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/60 flex items-center justify-between glass-header">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#087BFF]/10 text-[#087BFF] flex items-center justify-center border border-[#087BFF]/20 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#101C3A]">
              {step === 'details' ? 'Top Up eFootball Coins' : 'Order Confirmed'}
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

        {step === 'details' ? (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Package Summary Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0c2356] to-[#087BFF] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/80 uppercase tracking-wider font-mono">
                  Selected Package
                </span>
                <div className="text-xl font-extrabold flex items-center gap-1.5">
                  <span>{(packageItem.coins + packageItem.bonus).toLocaleString()} Coins</span>
                  {packageItem.bonus > 0 && (
                    <span className="text-[10px] bg-[#FFD700] text-[#101C3A] px-1.5 py-0.5 rounded-md font-black">
                      +{packageItem.bonus} BONUS
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-white">{packageItem.price}</span>
                <span className="block text-[10px] text-white/70">Instant ID Delivery</span>
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-xs font-bold text-[#101C3A] mb-1.5">
                Gaming Device
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlatform('mobile')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    platform === 'mobile'
                      ? 'border-[#087BFF] bg-[#EBF4FF] text-[#087BFF]'
                      : 'border-[#E5EDFA] bg-[#F8FAFD] text-[#71819A]'
                  }`}
                >
                  <span>eFootball Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('console')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    platform === 'console'
                      ? 'border-[#087BFF] bg-[#EBF4FF] text-[#087BFF]'
                      : 'border-[#E5EDFA] bg-[#F8FAFD] text-[#71819A]'
                  }`}
                >
                  <span>Console / PC</span>
                </button>
              </div>
            </div>

            {/* Game ID Input */}
            <div>
              <label className="block text-xs font-bold text-[#101C3A] mb-1">
                eFootball Game / Konami ID
              </label>
              <input
                type="text"
                value={gameId}
                onChange={(e) => {
                  setGameId(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. 842-195-302"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDFA] bg-[#F8FAFD] text-xs sm:text-sm text-[#101C3A] placeholder-[#71819A] focus:outline-none focus:border-[#087BFF] focus:bg-white font-mono transition-all"
              />
              <p className="text-[11px] text-[#71819A] mt-1">
                Find this in eFootball → Extras → User Information → User Details.
              </p>
              {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F4F8FD] text-xs text-[#71819A]">
              <ShieldCheck className="w-4 h-4 text-[#087BFF] shrink-0" />
              <span>100% Safe. We never ask for your password or credentials.</span>
            </div>

            {/* Unauthenticated Visitor Prompt */}
            {!player && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-[11px]">Telegram verification needed</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    Orders are linked to your Telegram account to verify delivery.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRequireAuth?.('Purchase Coins')}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg shrink-0"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#087BFF] hover:bg-[#076ee5] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#087BFF]/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Apex Dispatch...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Safe Top-Up ({packageItem.price})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto ring-8 ring-emerald-50/60">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-[#101C3A]">Order Submitted to Apex Admin!</h4>
              <p className="text-xs text-[#71819A] mt-1 max-w-xs mx-auto">
                {(packageItem.coins + packageItem.bonus).toLocaleString()} eFootball coins requested for Game ID: <span className="font-mono font-bold text-[#101C3A]">{gameId}</span>.
              </p>
            </div>

            <div className="p-3 bg-[#F4F8FD] rounded-xl text-left text-xs space-y-2 border border-[#E5EDFA]">
              <div className="flex justify-between items-center text-[#71819A]">
                <span>Order ID:</span>
                <span className="font-mono font-bold text-[#087BFF] bg-[#EBF4FF] px-2 py-0.5 rounded text-[11px]">
                  {createdOrder?.id || 'ORD-SYNCED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#71819A]">
                <span>Order Status:</span>
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200">
                  {createdOrder?.orderStatus || 'Pending Admin Approval'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#71819A]">
                <span>Payment:</span>
                <span className="font-bold text-blue-600 text-[11px]">
                  {createdOrder?.paymentStatus || 'Verification Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#71819A]">
                <span>Transaction Ref:</span>
                <span className="font-mono text-[#101C3A] text-[11px]">
                  {createdOrder?.transactionRef || 'Pending'}
                </span>
              </div>
              <div className="pt-1.5 border-t border-[#E5EDFA] text-[10px] text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Synced with Shared Apex Cloud Firestore (coinOrders)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#087BFF] text-white text-xs font-bold active:scale-95 transition-all shadow-sm"
            >
              Done & Return
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
