import crypto from 'crypto';
import type { TelegramUser, PlayerProfile, AuthResponse } from '../src/types/player.ts';
import { validateTelegramInitData } from './telegramAuth';
import { getOrCreatePlayer, getPlayerByTelegramId } from './storage';

const JWT_SECRET = process.env.TELEGRAM_BOT_TOKEN || 'apex_dev_secret_key_2026';

/**
 * Creates a signed stateless session token for a Telegram user ID
 */
export function generateSessionToken(telegramId: number): string {
  const payload = `${telegramId}:${Date.now()}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verifies a session token and extracts the Telegram User ID
 */
export function verifySessionToken(token: string): number | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payload)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const [idStr, timestampStr] = payload.split(':');
    const timestamp = parseInt(timestampStr, 10);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    if (Date.now() - timestamp > maxAge) return null;

    return parseInt(idStr, 10);
  } catch {
    return null;
  }
}

/**
 * Handles Telegram authentication request:
 * 1. If valid initData is provided, validates using Telegram's HMAC-SHA256 protocol.
 * 2. If devMockUser is provided and allowed (development preview mode), simulates authentication.
 * 3. Automatically provisions or loads the player account in persistent storage.
 */
export async function authenticateTelegramUser(params: {
  initData?: string;
  devMockUser?: TelegramUser;
  isDevMode?: boolean;
}): Promise<AuthResponse> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '';

  // Mode A: Real Telegram Mini App initData
  if (params.initData) {
    if (!botToken) {
      // If user hasn't added bot token yet, but is testing in development
      console.warn('[Auth] TELEGRAM_BOT_TOKEN is not set in environment.');
      return {
        success: false,
        error: 'TELEGRAM_BOT_TOKEN environment variable is not configured on the server. Please add your Telegram Bot Token in .env or Netlify environment settings.',
      };
    }

    const verification = validateTelegramInitData(params.initData, botToken);
    if (!verification.valid || !verification.user) {
      return {
        success: false,
        error: verification.error || 'Telegram initData verification failed',
      };
    }

    const { player, isNew } = await getOrCreatePlayer(verification.user, false);
    const token = generateSessionToken(player.telegramId);

    return {
      success: true,
      player,
      token,
      isNewAccount: isNew,
      isDevPreview: false,
    };
  }

  // Mode B: Development Preview Mode with clearly marked mock data
  if (params.devMockUser) {
    const isAllowedDev = process.env.NODE_ENV !== 'production' || params.isDevMode;

    if (!isAllowedDev) {
      return {
        success: false,
        error: 'Development preview mock authentication is disabled in production.',
      };
    }

    const { player, isNew } = await getOrCreatePlayer(params.devMockUser, true);
    const token = generateSessionToken(player.telegramId);

    return {
      success: true,
      player,
      token,
      isNewAccount: isNew,
      isDevPreview: true,
    };
  }

  return {
    success: false,
    error: 'Missing authentication credentials. Either provide Telegram initData or select a Development Preview profile.',
  };
}

/**
 * Retrieves the currently logged in player by Bearer token
 */
export async function getCurrentPlayer(token: string): Promise<PlayerProfile | null> {
  const telegramId = verifySessionToken(token);
  if (!telegramId) return null;
  return getPlayerByTelegramId(telegramId);
}
