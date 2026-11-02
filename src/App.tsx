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
import { AuthDiagnosticsScreen } from './components/AuthDiagnosticsScreen';
import { TelegramAuthModal } from './components/TelegramAuthModal';
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
import { useNewsLive, useNotificationsLive, useLivePlayerDoc } from './services/firestoreData';

function ApexAppInner() {
  const { player, isLoading, authError, authErrorCode, loginAsDevMock, clearError } = useAuth();
  const { news: liveNews } = useNewsLive();
  const { notifications, setNotifications } = useNotificationsLive();
  const livePlayerDoc = useLivePlayerDoc(player?.id);

  // Synchronize live Firestore coinsBalance and stats from shared database
  const activePlayer = player
    ? {
        ...player,
        coinsBalance:
          typeof livePlayerDoc?.coinsBalance === 'number'
            ? livePlayerDoc.coinsBalance
            : player.coinsBalance,
        rankTitle: livePlayerDoc?.ranking
          ? `Apex Division #${livePlayerDoc.ranking}`
          : player.rankTitle,
        apexGamerTag: livePlayerDoc?.name || player.apexGamerTag,
      }
    : null;

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isAllNewsOpen, setIsAllNewsOpen] = useState(false);
  const [selectedCoinPackage, setSelectedCoinPackage] = useState<CoinPackage | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);

  // Real shared news from Firestore with fallback
  const allNewsList = liveNews && liveNews.length > 0 ? liveNews : [...LATEST_NEWS, ...ADDITIONAL_NEWS];
  const displayNews = allNewsList.slice(0, 4);
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
      const patchArticle = allNewsList.find((item) => item.id === 'news-1' || item.id === 'art-1') || allNewsList[0];
      if (patchArticle) setSelectedArticle(patchArticle);
    }
  };

  const handleReadArticleById = (articleId: string) => {
    const found = allNewsList.find((item) => item.id === articleId) || allNewsList[0];
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

      {/* 2. TOP HEADER (Fixed across navigation, with Player Status Chip or Guest Pill) */}
      <Header
        unreadCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        player={activePlayer}
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

            {/* 4. LATEST NEWS SECTION (Shows live published news from Firestore) */}
            <LatestNewsSection
              news={displayNews}
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
