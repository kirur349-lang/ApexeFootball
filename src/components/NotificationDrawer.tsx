import React from 'react';
import { X, Check, Bell, Trophy, Coins, Zap } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: AppNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-sm bg-white/88 backdrop-blur-2xl h-full shadow-[0_20px_50px_rgba(8,123,255,0.18)] flex flex-col border-l border-white/80 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/60 flex items-center justify-between glass-header">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#087BFF]/10 text-[#087BFF] flex items-center justify-center border border-[#087BFF]/20 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-[#101C3A]">Notifications</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="w-8 h-8 rounded-full bg-white/60 hover:bg-white border border-white/80 flex items-center justify-center text-[#71819A] hover:text-[#101C3A] active:scale-90 transition-all shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-[#F8FAFD] border-b border-[#E5EDFA] flex items-center justify-between text-xs">
          <span className="text-[#71819A]">
            {notifications.filter((n) => !n.read).length} unread updates
          </span>
          <button
            onClick={onMarkAllAsRead}
            className="text-[#087BFF] font-semibold hover:underline flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E5EDFA]">
          {notifications.map((notif) => {
            let IconComp = Bell;
            let iconColor = 'text-[#087BFF] bg-[#EBF4FF]';
            if (notif.type === 'tournament') {
              IconComp = Trophy;
              iconColor = 'text-[#E5A100] bg-[#FFF8E6]';
            } else if (notif.type === 'coins') {
              IconComp = Coins;
              iconColor = 'text-[#087BFF] bg-[#EBF4FF]';
            } else if (notif.type === 'patch') {
              IconComp = Zap;
              iconColor = 'text-[#00B4D8] bg-[#E6F8FB]';
            }

            return (
              <div
                key={notif.id}
                onClick={() => onSelectNotification(notif)}
                className={`p-4 hover:bg-[#F8FAFD] cursor-pointer transition-colors flex gap-3 text-left ${
                  !notif.read ? 'bg-[#F4F8FD]/60' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4
                      className={`text-xs truncate ${
                        !notif.read
                          ? 'font-bold text-[#101C3A]'
                          : 'font-semibold text-[#101C3A]/80'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-[#71819A] shrink-0 font-mono">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#71819A] leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
