import React from 'react';
import { Home, Trophy, Radio, Coins, MoreHorizontal } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'tournaments', label: 'Tournaments', icon: Trophy },
  { id: 'live', label: 'Live Arena', icon: Radio, badge: 'LIVE' },
  { id: 'coins', label: 'Coins', icon: Coins },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-4 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] pointer-events-none">
      <nav className="max-w-md mx-auto pointer-events-auto rounded-2xl sm:rounded-3xl glass-nav-floating px-2 py-1.5 transition-all duration-300">
        {/* Subtle specular reflection bevel along top edge */}
        <div className="absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        <div className="grid grid-cols-5 items-center h-14">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  // Provide subtle Telegram haptic if available
                  if (
                    typeof window !== 'undefined' &&
                    (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { impactOccurred: (style: string) => void } } } }).Telegram?.WebApp?.HapticFeedback
                  ) {
                    try {
                      (window as unknown as { Telegram: { WebApp: { HapticFeedback: { impactOccurred: (style: string) => void } } } }).Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    } catch {
                      // ignore
                    }
                  }
                }}
                className={`relative flex flex-col items-center justify-center py-1 select-none transition-all duration-200 active:scale-95 focus:outline-none group ${
                  isActive ? 'text-[#087BFF]' : 'text-[#71819A] hover:text-[#101C3A]'
                }`}
                aria-label={item.label}
              >
                {/* Active Apple Glass Capsule Pill */}
                {isActive && (
                  <span className="absolute inset-x-1.5 inset-y-0.5 rounded-xl bg-gradient-to-b from-[#087BFF]/12 to-[#087BFF]/6 border border-[#087BFF]/20 -z-10 transition-all duration-300 shadow-[0_2px_12px_rgba(8,123,255,0.12)]" />
                )}

                {/* Icon Container */}
                <div className="relative">
                  <IconComponent
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 drop-shadow-[0_2px_8px_rgba(8,123,255,0.35)]' : 'group-hover:scale-105'
                    }`}
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />

                  {/* Badge for Live Arena */}
                  {item.badge && !isActive && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#087BFF] ring-2 ring-white" />
                  )}
                </div>

                {/* Label Underneath */}
                <span
                  className={`text-[10px] sm:text-[11px] tracking-tight mt-0.5 transition-all ${
                    isActive
                      ? 'font-extrabold text-[#087BFF]'
                      : 'font-medium text-[#71819A]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
