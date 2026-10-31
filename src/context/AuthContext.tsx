import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PlayerProfile, TelegramUser, AuthResponse } from '../types/player';
import { getTelegramWebApp, isInsideTelegram, triggerHaptic } from '../utils/telegram';

interface AuthContextType {
  player: PlayerProfile | null;
  isLoading: boolean;
  authError: string | null;
  isAuthenticated: boolean;
  isDevPreview: boolean;
  isNewAccount: boolean;
  loginWithTelegram: () => Promise<void>;
  loginAsDevMock: (preset: 'pro' | 'rookie' | 'streamer', customGamerTag?: string) => Promise<void>;
  updatePlayerProfile: (updates: { apexGamerTag?: string; konamiId?: string }) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'apex_auth_token';
const DEV_PREVIEW_KEY = 'apex_dev_preview_state';

// Presets for Development Preview Testing
export const DEV_MOCK_PRESETS = {
  pro: {
    id: 98452101,
    first_name: 'ViperX',
    last_name: 'Esports',
    username: 'viperx_efootball',
    is_premium: true,
    photo_url: '',
  },
  rookie: {
    id: 54109283,
    first_name: 'Alex',
    last_name: 'Striker',
    username: 'alex_apex',
    is_premium: false,
    photo_url: '',
  },
  streamer: {
    id: 71203948,
    first_name: 'Kage',
    last_name: 'Pro',
    username: 'kage_division1',
    is_premium: true,
    photo_url: '',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDevPreview, setIsDevPreview] = useState<boolean>(false);
  const [isNewAccount, setIsNewAccount] = useState<boolean>(false);

  // Authenticate using real Telegram initData
  const authenticateWithInitData = useCallback(async (initData: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      const data: AuthResponse = await res.json();

      if (data.success && data.player && data.token) {
        setPlayer(data.player);
        setIsDevPreview(false);
        setIsNewAccount(Boolean(data.isNewAccount));
        sessionStorage.setItem(TOKEN_KEY, data.token);
        sessionStorage.removeItem(DEV_PREVIEW_KEY);
        triggerHaptic('success');
        return true;
      } else {
        setAuthError(data.error || 'Telegram cryptographic verification failed');
        triggerHaptic('error');
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Server connection failed';
      setAuthError(`Authentication error: ${msg}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Authenticate in Dev Preview mode
  const loginAsDevMock = useCallback(
    async (preset: 'pro' | 'rookie' | 'streamer', customGamerTag?: string) => {
      setIsLoading(true);
      setAuthError(null);

      const mockUser: TelegramUser = {
        ...DEV_MOCK_PRESETS[preset],
        first_name: customGamerTag || DEV_MOCK_PRESETS[preset].first_name,
      };

      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            devMockUser: mockUser,
            isDevMode: true,
          }),
        });

        const data: AuthResponse = await res.json();

        if (data.success && data.player && data.token) {
          setPlayer(data.player);
          setIsDevPreview(true);
          setIsNewAccount(Boolean(data.isNewAccount));
          sessionStorage.setItem(TOKEN_KEY, data.token);
          sessionStorage.setItem(DEV_PREVIEW_KEY, preset);
          triggerHaptic('success');
        } else {
          setAuthError(data.error || 'Failed to authenticate in Dev Preview');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Network error';
        setAuthError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Restore session or auto-authenticate on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const tg = getTelegramWebApp();

      // Configure Telegram WebApp UI if inside Telegram
      if (tg) {
        try {
          tg.ready();
          tg.expand();
          if (tg.setHeaderColor) tg.setHeaderColor('#FFFFFF');
          if (tg.setBackgroundColor) tg.setBackgroundColor('#FFFFFF');
        } catch {
          // ignore
        }
      }

      // Check if real Telegram initData is available
      if (tg?.initData && tg.initData.length > 0) {
        await authenticateWithInitData(tg.initData);
        return;
      }

      // Check if existing session token is stored
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const res = await fetch('/api/player/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();

          if (isMounted && data.success && data.player) {
            setPlayer(data.player);
            setIsDevPreview(Boolean(data.player.isDevPreview));
            setIsLoading(false);
            return;
          }
        } catch {
          sessionStorage.removeItem(TOKEN_KEY);
        }
      }

      // If outside Telegram without stored session, auto-initialize in Dev Preview with default rookie profile
      if (isMounted) {
        const savedDevPreset = (sessionStorage.getItem(DEV_PREVIEW_KEY) as 'pro' | 'rookie' | 'streamer') || 'rookie';
        await loginAsDevMock(savedDevPreset);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [authenticateWithInitData, loginAsDevMock]);

  // Update Apex player profile (e.g. gamerTag, konamiId)
  const updatePlayerProfile = async (updates: { apexGamerTag?: string; konamiId?: string }): Promise<boolean> => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      const res = await fetch('/api/player/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (data.success && data.player) {
        setPlayer(data.player);
        triggerHaptic('success');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(DEV_PREVIEW_KEY);
    setPlayer(null);
    setIsDevPreview(false);
  };

  const loginWithTelegram = async () => {
    const tg = getTelegramWebApp();
    if (tg?.initData) {
      await authenticateWithInitData(tg.initData);
    } else {
      setAuthError('To authenticate with Telegram, open this application through your Telegram Bot.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        player,
        isLoading,
        authError,
        isAuthenticated: Boolean(player),
        isDevPreview,
        isNewAccount,
        loginWithTelegram,
        loginAsDevMock,
        updatePlayerProfile,
        logout,
        clearError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
