import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PlayerProfile, TelegramUser, AuthResponse, AuthDiagnostics } from '../types/player';
import {
  getTelegramWebApp,
  isInsideTelegram,
  waitForTelegramInitData,
  getTelegramDiagnosticInfo,
  triggerHaptic,
} from '../utils/telegram';

interface AuthContextType {
  player: PlayerProfile | null;
  token: string | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  authError: string | null;
  authErrorCode: string | null;
  authDiagnostics: AuthDiagnostics | null;
  isAuthenticated: boolean;
  isDevPreview: boolean;
  isNewAccount: boolean;
  isBlobPending: boolean;
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
    language_code: 'en',
    is_premium: true,
    photo_url: '',
  },
  rookie: {
    id: 54109283,
    first_name: 'Alex',
    last_name: 'Striker',
    username: 'alex_apex',
    language_code: 'en',
    is_premium: false,
    photo_url: '',
  },
  streamer: {
    id: 71203948,
    first_name: 'Kage',
    last_name: 'Pro',
    username: 'kage_division1',
    language_code: 'en',
    is_premium: true,
    photo_url: '',
  },
};

/**
 * Creates an instantaneous, rich local mock player profile.
 * Ensures Dev Preview Mode and the homepage NEVER get blocked by missing Blob storage or network delays.
 */
export function createDevMockPlayer(
  preset: 'pro' | 'rookie' | 'streamer',
  customGamerTag?: string
): PlayerProfile {
  const user = DEV_MOCK_PRESETS[preset];
  const now = new Date().toISOString();

  const presetsConfig = {
    pro: {
      apexId: 'APEX-9921-1042',
      tag: 'Apex_ViperX_Pro',
      rank: 'Apex Division 1 Elite',
      coins: 2130,
      matches: 142,
      wins: 118,
      losses: 24,
      role: 'verified_creator' as const,
      konamiId: 'VIPER-9921',
    },
    rookie: {
      apexId: 'APEX-5410-9283',
      tag: customGamerTag ? `Apex_${customGamerTag}` : 'Apex_AlexRookie',
      rank: 'Apex Challenger',
      coins: 250, // 250 welcome bonus
      matches: 0,
      wins: 0,
      losses: 0,
      role: 'player' as const,
      konamiId: undefined,
    },
    streamer: {
      apexId: 'APEX-7734-2190',
      tag: 'Apex_KageLive',
      rank: 'Apex Master Division',
      coins: 4500,
      matches: 310,
      wins: 245,
      losses: 65,
      role: 'verified_creator' as const,
      konamiId: 'KAGE-7734',
    },
  };

  const config = presetsConfig[preset];

  return {
    id: `tg_${user.id}`,
    telegramId: user.id,
    firstName: customGamerTag || user.first_name,
    lastName: user.last_name,
    username: user.username,
    photoUrl: user.photo_url,
    languageCode: user.language_code,
    isPremium: user.is_premium,
    apexId: config.apexId,
    apexGamerTag: config.tag,
    konamiId: config.konamiId,
    coinsBalance: config.coins,
    rankTitle: config.rank,
    reputationScore: 100,
    matchesPlayed: config.matches,
    wins: config.wins,
    losses: config.losses,
    role: config.role,
    createdAt: now,
    lastActiveAt: now,
    isDevPreview: true,
    isBlobPending: false,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);
  const [authDiagnostics, setAuthDiagnostics] = useState<AuthDiagnostics | null>(null);
  const [isDevPreview, setIsDevPreview] = useState<boolean>(false);
  const [isNewAccount, setIsNewAccount] = useState<boolean>(false);
  const [isBlobPending, setIsBlobPending] = useState<boolean>(false);

  // Authenticate using real Telegram initData
  const authenticateWithInitData = useCallback(async (initData: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    setAuthErrorCode(null);
    setAuthDiagnostics(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      const rawText = await res.text();
      let data: AuthResponse;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Server returned unexpected HTTP ${res.status}: ${rawText.slice(0, 100)}`);
      }

      if (data.success && data.player && data.token) {
        setPlayer(data.player);
        setToken(data.token);
        setIsDevPreview(false);
        setIsNewAccount(Boolean(data.isNewAccount));
        setIsBlobPending(Boolean(data.isBlobPending));
        sessionStorage.setItem(TOKEN_KEY, data.token);
        sessionStorage.removeItem(DEV_PREVIEW_KEY);
        triggerHaptic('success');
        return true;
      } else {
        setAuthError(data.error || 'Telegram cryptographic verification failed');
        setAuthErrorCode(data.errorCode || 'VERIFICATION_FAILED');
        setAuthDiagnostics(data.diagnostics || null);
        triggerHaptic('error');
        return false;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Server connection failed';
      setAuthError(`Authentication error: ${msg}`);
      setAuthErrorCode('NETWORK_OR_SERVER_ERROR');
      triggerHaptic('error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Authenticate in Dev Preview mode (100% independent of Vercel Blob storage)
  const loginAsDevMock = useCallback(
    async (preset: 'pro' | 'rookie' | 'streamer', customGamerTag?: string) => {
      setIsLoading(true);
      setAuthError(null);
      setAuthErrorCode(null);

      // Instantly generate the local mock player to guarantee the homepage is NEVER blocked
      const localMock = createDevMockPlayer(preset, customGamerTag);
      setPlayer(localMock);
      setIsDevPreview(true);
      setIsBlobPending(false);
      sessionStorage.setItem(DEV_PREVIEW_KEY, preset);

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

        if (res.ok) {
          const data: AuthResponse = await res.json();
          if (data.success && data.player && data.token) {
            setPlayer(data.player);
            setToken(data.token);
            setIsNewAccount(Boolean(data.isNewAccount));
            sessionStorage.setItem(TOKEN_KEY, data.token);
            triggerHaptic('success');
          }
        }
      } catch (err) {
        console.warn('[Auth] Dev Preview synced locally (serverless endpoint optional in preview):', err);
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

      // Check whether we are running inside Telegram
      const insideTg = isInsideTelegram();

      if (insideTg) {
        // Wait safely for Telegram WebApp SDK to populate initData (avoid reading prematurely)
        const initData = await waitForTelegramInitData(1000);

        if (!isMounted) return;

        if (initData && initData.length > 0) {
          await authenticateWithInitData(initData);
          return;
        }

        // Inside Telegram but initData wasn't passed (e.g. opened directly without bot parameters)
        const diag = getTelegramDiagnosticInfo();
        setAuthError(
          'Telegram authentication data was not detected. Please ensure you open this Mini App directly from your Telegram Bot menu button or inline keyboard button.'
        );
        setAuthErrorCode('MISSING_INIT_DATA');
        setAuthDiagnostics({
          sdkDetected: Boolean(diag.sdkLoaded),
          sdkPlatform: diag.platform,
          sdkVersion: diag.version,
          initDataReceived: false,
          initDataLength: 0,
        });

        setIsLoading(false);
        return;
      }

      // 2. Outside Telegram: Check if an existing session token is stored
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
            setIsBlobPending(Boolean(data.player.isBlobPending));
            setIsLoading(false);
            return;
          }
        } catch {
          sessionStorage.removeItem(TOKEN_KEY);
        }
      }

      // 3. Outside Telegram: If user had previously selected dev mock, restore it
      const savedDevPreset = sessionStorage.getItem(DEV_PREVIEW_KEY) as 'pro' | 'rookie' | 'streamer' | null;
      if (savedDevPreset && DEV_MOCK_PRESETS[savedDevPreset]) {
        if (isMounted) {
          await loginAsDevMock(savedDevPreset);
        }
      } else {
        // Standard clean visitor / guest mode: homepage and all public areas are immediately open
        if (isMounted) {
          setPlayer(null);
          setIsDevPreview(false);
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [authenticateWithInitData, loginAsDevMock]);

  // Update Apex player profile (e.g. gamerTag, konamiId)
  const updatePlayerProfile = async (updates: { apexGamerTag?: string; konamiId?: string }): Promise<boolean> => {
    // If in Dev Preview mode or session mode, immediately update local state
    setPlayer((prev) =>
      prev
        ? {
            ...prev,
            apexGamerTag: updates.apexGamerTag ? updates.apexGamerTag.trim().slice(0, 30) : prev.apexGamerTag,
            konamiId: updates.konamiId !== undefined ? updates.konamiId.trim().slice(0, 30) : prev.konamiId,
            lastActiveAt: new Date().toISOString(),
          }
        : null
    );
    triggerHaptic('success');

    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return true;

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
      return true;
    } catch {
      return true;
    }
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(DEV_PREVIEW_KEY);
    setPlayer(null);
    setToken(null);
    setIsDevPreview(false);
  };

  const loginWithTelegram = async () => {
    const initData = await waitForTelegramInitData(600);
    if (initData && initData.length > 0) {
      await authenticateWithInitData(initData);
    } else {
      setAuthError('To authenticate with Telegram, open this application through your Telegram Bot.');
      setAuthErrorCode('MISSING_INIT_DATA');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        player,
        token,
        isLoading,
        isProfileLoading: isLoading,
        authError,
        authErrorCode,
        authDiagnostics,
        isAuthenticated: Boolean(player),
        isDevPreview,
        isNewAccount,
        isBlobPending,
        loginWithTelegram,
        loginAsDevMock,
        updatePlayerProfile,
        logout,
        clearError: () => {
          setAuthError(null);
          setAuthErrorCode(null);
          setAuthDiagnostics(null);
        },
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
