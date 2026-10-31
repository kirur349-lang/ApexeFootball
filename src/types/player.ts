export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface PlayerProfile {
  // Telegram Identifiers
  id: string; // e.g. "tg_12345678"
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  isPremium?: boolean;

  // Apex eFootball Competitive Identity
  apexGamerTag: string;
  konamiId?: string;
  coinsBalance: number;
  rankTitle: string;
  reputationScore: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  role: 'player' | 'verified_creator' | 'admin' | 'superadmin';

  // Timestamps & Meta
  createdAt: string;
  lastActiveAt: string;
  isDevPreview?: boolean;
  isBlobPending?: boolean;
}

export interface AuthDiagnostics {
  sdkDetected: boolean;
  sdkPlatform?: string;
  sdkVersion?: string;
  initDataReceived: boolean;
  initDataLength?: number;
  hasUser?: boolean;
  hasHash?: boolean;
  hasAuthDate?: boolean;
  authDate?: number;
  botTokenConfigured?: boolean;
  errorCode?: string;
  blobConfigured?: boolean;
  storageMode?: 'vercel_blob' | 'session_memory' | 'local_sandbox';
}

export interface AuthResponse {
  success: boolean;
  player?: PlayerProfile;
  token?: string;
  isNewAccount?: boolean;
  error?: string;
  errorCode?: string;
  isDevPreview?: boolean;
  isBlobPending?: boolean;
  diagnostics?: AuthDiagnostics;
}

