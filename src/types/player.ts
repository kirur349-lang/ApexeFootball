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
}

export interface AuthResponse {
  success: boolean;
  player?: PlayerProfile;
  token?: string;
  isNewAccount?: boolean;
  error?: string;
  isDevPreview?: boolean;
}
