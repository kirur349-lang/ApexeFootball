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
import { DevPreviewBanner } from './components/DevPreviewBanner';
import { TelegramSetupModal } from './components/TelegramSetupModal';

import {
  PROMO_SLIDES,
  LATEST_NEWS,
  ADDITIONAL_NEWS,
  INITIAL_NOTIFICATIONS,
  COIN_PACKAGES,
} from './data/mockData';
import { TabType, NewsItem, CoinPackage, AppNotification } from './types';
import { isInsideTelegram } from './utils/telegram';
import { AlertCircle, RefreshCw, Send } from 'lucide-react';

function ApexAppInner() {
  const { player, isLoading, authError, loginWithTelegram, loginAsDevMock, clearError } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isAllNewsOpen, setIsAllNewsOpen] = useState(false);
  const [selectedCoinPackage, setSelectedCoinPackage] = useState<CoinPackage | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
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

  // Show frosted Apple loading screen while Telegram cryptographic validation completes
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // If catastrophic auth failure and no player session available
  if (authError && !player) {
    if (!isInsideTelegram()) {
      loginAsDevMock('rookie');
      clearError();
      return <AuthLoadingScreen />;
    }

    return (
      <div className="min-h-screen bg-[#FAFCFF] flex items-center justify-center p-4">
        <div className="glass-card max-w-sm w-full rounded-3xl p-6 text-center border border-white/90 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#101C3A]">Authentication Required</h2>
          <p className="text-xs text-[#71819A] mt-1 mb-5 leading-relaxed">{authError}</p>

          <div className="space-y-2">
            <button
              onClick={() => loginWithTelegram()}
              className="w-full py-2.5 rounded-xl bg-[#087BFF] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-[#087BFF]/25"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Retry Telegram Auth</span>
            </button>
            <button
              onClick={() => {
                clearError();
                loginAsDevMock('rookie');
              }}
              className="w-full py-2.5 rounded-xl bg-white/80 hover:bg-white text-[#101C3A] text-xs font-bold border border-[#E5EDFA] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#087BFF]" />
              <span>Continue in Dev Preview Mode</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* 2. TOP HEADER (Fixed across navigation, with Player Status Chip) */}
      <Header
        unreadCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        player={player}
        onOpenProfile={() => setActiveTab('more')}
      />

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

      {/* Telegram Mini App & Netlify Setup Guide Modal */}
      <TelegramSetupModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />
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
