import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { PromotionalCarousel } from './components/PromotionalCarousel';
import { LatestNewsSection } from './components/LatestNewsSection';
import { BottomNav } from './components/BottomNav';
import { ArticleModal } from './components/ArticleModal';
import { AllNewsModal } from './components/AllNewsModal';
import { CoinPurchaseModal } from './components/CoinPurchaseModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { TournamentsView } from './components/TournamentsView';
import { LiveArenaView } from './components/LiveArenaView';
import { CoinsStoreView } from './components/CoinsStoreView';
import { MoreView } from './components/MoreView';
import { AuthLoadingScreen } from './components/AuthLoadingScreen';
import { AuthDiagnosticsScreen } from './components/AuthDiagnosticsScreen';
import { TelegramAuthModal } from './components/TelegramAuthModal';
import { DevPreviewBanner } from './components/DevPreviewBanner';
import { TelegramSetupModal } from './components/TelegramSetupModal';
import { X, ShieldAlert, Sparkles } from 'lucide-react';

import {
  PROMO_SLIDES,
  LATEST_NEWS,
  ADDITIONAL_NEWS,
  INITIAL_NOTIFICATIONS,
  COIN_PACKAGES,
} from './data/mockData';
import { TabType, NewsItem, CoinPackage, AppNotification } from './types';
import { isInsideTelegram } from './utils/telegram';

function ApexAppInner() {
  const { player, isLoading, authError, authErrorCode, loginAsDevMock, clearError } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isAllNewsOpen, setIsAllNewsOpen] = useState(false);
  const [selectedCoinPackage, setSelectedCoinPackage] = useState<CoinPackage | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);
  const [dismissedAuthBanner, setDismissedAuthBanner] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Combine all news for the AllNews modal
  const allNewsList = [...LATEST_NEWS, ...ADDITIONAL_NEWS];
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSelectNotification = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsNotificationOpen(false);

    if (notif.type === 'tournament') {
      setActiveTab('tournaments');
    } else if (notif.type === 'coins') {
      setActiveTab('coins');
    } else if (notif.type === 'patch') {
      const patchArticle = LATEST_NEWS.find((item) => item.id === 'news-1');
      if (patchArticle) setSelectedArticle(patchArticle);
    }
  };

  const handleReadArticleById = (articleId: string) => {
    const found = allNewsList.find((item) => item.id === articleId) || LATEST_NEWS[0];
    setSelectedArticle(found);
  };

  return (
    <div className="min-h-screen bg-[#FAFCFF] text-[#101C3A] flex flex-col font-sans selection:bg-[#087BFF] selection:text-white relative overflow-x-hidden">
      {/* Ambient Apple Glass Background Lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#087BFF]/[0.05] blur-[100px]" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-[#00D4FF]/[0.04] blur-[100px]" />
        <div className="absolute -bottom-24 right-0 w-[420px] h-[420px] rounded-full bg-[#087BFF]/[0.04] blur-[100px]" />
      </div>

      {/* Dev Preview Mode Banner (shown when testing outside Telegram) */}
      <DevPreviewBanner onOpenSetupGuide={() => setIsSetupGuideOpen(true)} />

      {/* 2. TOP HEADER (Fixed across navigation, with Player Status Chip or Guest Pill) */}
      <Header
        unreadCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        player={player}
        onOpenProfile={() => setActiveTab('more')}
      />

      {/* Non-blocking Telegram Auth Status Banner (shown when Telegram verification failed / bot token pending) */}
      {authError && !player && !dismissedAuthBanner && (
        <div className="w-full max-w-2xl mx-auto px-4 pt-2">
          <div className="w-full bg-white/90 backdrop-blur-md border border-amber-300/60 rounded-2xl p-2.5 shadow-[0_4px_16px_rgba(245,158,11,0.08)] flex items-center justify-between gap-2.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] text-[#101C3A] truncate font-medium">
                <span className="font-bold text-amber-700">Guest Visitor Mode:</span> All public pages, news & schedules are active.
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsDiagnosticsOpen(true)}
                className="text-[11px] font-bold text-[#087BFF] hover:underline px-1.5 py-0.5"
              >
                Diagnostics
              </button>
              <button
                onClick={() => setDismissedAuthBanner(true)}
                aria-label="Dismiss banner"
                className="w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#71819A]"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-24">
        {activeTab === 'home' && (
          <div className="w-full animate-in fade-in duration-150">
            {/* 3. PROMOTIONAL HERO CAROUSEL directly underneath header */}
            <PromotionalCarousel
              slides={PROMO_SLIDES}
              onNavigateTab={(tab) => {
                if (tab === 'coins') {
                  setSelectedCoinPackage(COIN_PACKAGES[2]); // Pre-select popular 2,130 pack
                } else {
                  setActiveTab(tab);
                }
              }}
              onReadArticle={handleReadArticleById}
            />

            {/* 4. LATEST NEWS SECTION (Contains exactly four news cards per rule #6) */}
            <LatestNewsSection
              news={LATEST_NEWS}
              onSelectArticle={(article) => setSelectedArticle(article)}
              onViewAllNews={() => setIsAllNewsOpen(true)}
            />
          </div>
        )}

        {activeTab === 'tournaments' && (
          <TournamentsView
            onBackToHome={() => setActiveTab('home')}
            onOpenLiveMatch={() => setActiveTab('live')}
            onRequireAuth={(reason) => setAuthModalReason(reason)}
          />
        )}

        {activeTab === 'live' && (
          <LiveArenaView onBackToHome={() => setActiveTab('home')} />
        )}

        {activeTab === 'coins' && (
          <CoinsStoreView
            onBackToHome={() => setActiveTab('home')}
            onSelectPackage={(pkg) => setSelectedCoinPackage(pkg)}
          />
        )}

        {activeTab === 'more' && (
          <MoreView
            onBackToHome={() => setActiveTab('home')}
            onOpenNotifications={() => setIsNotificationOpen(true)}
            onOpenSetupGuide={() => setIsSetupGuideOpen(true)}
            onRequireAuth={(reason) => setAuthModalReason(reason)}
            onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
          />
        )}
      </main>

      {/* 5. FIXED BOTTOM NAVIGATION BAR (Strictly 5 items per rule #5) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Individual Article Reader Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onNavigateCoins={() => {
            setSelectedArticle(null);
            setActiveTab('coins');
          }}
          onNavigateTournaments={() => {
            setSelectedArticle(null);
            setActiveTab('tournaments');
          }}
        />
      )}

      {/* All News Directory View */}
      {isAllNewsOpen && (
        <AllNewsModal
          news={allNewsList}
          onClose={() => setIsAllNewsOpen(false)}
          onSelectArticle={(article) => {
            setIsAllNewsOpen(false);
            setSelectedArticle(article);
          }}
        />
      )}

      {/* Coin Purchase / Top-Up Modal */}
      {selectedCoinPackage && (
        <CoinPurchaseModal
          packageItem={selectedCoinPackage}
          onClose={() => setSelectedCoinPackage(null)}
          onRequireAuth={(reason) => setAuthModalReason(reason)}
        />
      )}

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectNotification={handleSelectNotification}
      />

      {/* Telegram Mini App & Vercel Setup Guide Modal */}
      <TelegramSetupModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />

      {/* Telegram Authentication Prompt Modal (for protected actions) */}
      <TelegramAuthModal
        isOpen={Boolean(authModalReason)}
        reason={authModalReason}
        onClose={() => setAuthModalReason(null)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
      />

      {/* Telegram Auth & Backend Diagnostics Modal (opened on-demand) */}
      {isDiagnosticsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <AuthDiagnosticsScreen onClose={() => setIsDiagnosticsOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ApexAppInner />
    </AuthProvider>
  );
}
