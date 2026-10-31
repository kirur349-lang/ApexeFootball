import { TelegramUser } from '../types/player';

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
    start_param?: string;
    chat_type?: string;
    chat_instance?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  openTelegramLink: (url: string) => void;
  openLink: (url: string) => void;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') return null;
  const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
  return tg && typeof tg.ready === 'function' ? tg : null;
}

/**
 * Extracts signed Telegram initData from all possible standard locations:
 * 1. window.Telegram.WebApp.initData
 * 2. URL hash (#tgWebAppData=...)
 * 3. URL search params (?tgWebAppData=...)
 */
export function getTelegramInitData(): string {
  if (typeof window === 'undefined') return '';

  // 1. Direct from Telegram WebApp SDK
  const tg = getTelegramWebApp();
  if (tg?.initData && tg.initData.trim().length > 0) {
    return tg.initData.trim();
  }

  // 2. From URL hash (#tgWebAppData=...)
  try {
    const rawHash = window.location.hash || '';
    const hash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
    if (hash.includes('tgWebAppData=')) {
      const params = new URLSearchParams(hash);
      const data = params.get('tgWebAppData');
      if (data && data.trim().length > 0) {
        return data.trim();
      }
    } else if (hash.includes('hash=') && (hash.includes('user=') || hash.includes('auth_date='))) {
      return hash.trim();
    }
  } catch {
    // ignore
  }

  // 3. From URL search params (?tgWebAppData=...)
  try {
    const rawSearch = window.location.search || '';
    const search = rawSearch.startsWith('?') ? rawSearch.slice(1) : rawSearch;
    if (search.includes('tgWebAppData=')) {
      const params = new URLSearchParams(search);
      const data = params.get('tgWebAppData');
      if (data && data.trim().length > 0) {
        return data.trim();
      }
    }
  } catch {
    // ignore
  }

  return '';
}

/**
 * Detects whether the web app is running inside a Telegram client (iOS, Android, Desktop, Web).
 */
export function isInsideTelegram(): boolean {
  if (typeof window === 'undefined') return false;

  const tg = getTelegramWebApp();
  if (tg) {
    if (tg.initData && tg.initData.length > 0) return true;
    if (tg.platform && tg.platform !== 'unknown') return true;
  }

  if ((window as unknown as { TelegramWebviewProxy?: unknown }).TelegramWebviewProxy) {
    return true;
  }

  const hash = window.location.hash || '';
  if (hash.includes('tgWebAppData=') || hash.includes('tgWebAppVersion=')) {
    return true;
  }

  const search = window.location.search || '';
  if (search.includes('tgWebAppData=') || search.includes('tgWebAppVersion=')) {
    return true;
  }

  return false;
}

/**
 * Asynchronously waits for Telegram WebApp initialization and initData availability.
 * Avoids reading initData before Telegram has completed populating it.
 */
export async function waitForTelegramInitData(timeoutMs = 1200, checkIntervalMs = 80): Promise<string> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    function check() {
      const data = getTelegramInitData();
      if (data && data.length > 0) {
        return resolve(data);
      }

      // If timed out or outside Telegram, resolve with whatever was found
      if (Date.now() - startTime >= timeoutMs) {
        return resolve(data || '');
      }

      setTimeout(check, checkIntervalMs);
    }

    check();
  });
}

/**
 * Returns safe diagnostic information about the Telegram environment (no secrets or full tokens)
 */
export function getTelegramDiagnosticInfo() {
  if (typeof window === 'undefined') {
    return {
      isBrowser: false,
      sdkLoaded: false,
      platform: 'server',
      version: 'none',
      isExpanded: false,
      hasInitData: false,
      initDataLength: 0,
      hasUserInUnsafe: false,
      hasHashInUrl: false,
      currentUrl: '',
    };
  }

  const tg = getTelegramWebApp();
  const initData = getTelegramInitData();

  return {
    isBrowser: true,
    sdkLoaded: Boolean(tg),
    platform: tg?.platform || 'browser',
    version: tg?.version || 'not_available',
    isExpanded: tg?.isExpanded ?? false,
    hasInitData: initData.length > 0,
    initDataLength: initData.length,
    hasUserInUnsafe: Boolean(tg?.initDataUnsafe?.user),
    hasHashInUrl: window.location.hash.includes('tgWebAppData='),
    currentUrl: window.location.origin + window.location.pathname,
  };
}


export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error' = 'light') {
  const tg = getTelegramWebApp();
  if (!tg?.HapticFeedback) return;

  try {
    if (type === 'selection') {
      tg.HapticFeedback.selectionChanged();
    } else if (type === 'success' || type === 'error') {
      tg.HapticFeedback.notificationOccurred(type);
    } else {
      tg.HapticFeedback.impactOccurred(type);
    }
  } catch {
    // ignore
  }
}
