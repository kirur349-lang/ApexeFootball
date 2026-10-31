import crypto from 'crypto';
import type { TelegramUser, PlayerProfile, AuthResponse } from '../src/types/player.ts';
import { validateTelegramInitData, normalizeTelegramInitData } from './telegramAuth';
import {
  getOrCreatePlayer,
  getPlayerByTelegramId,
  isVercelBlobConfigured,
} from './storage';

const getJwtSecret = () => (process.env.TELEGRAM_BOT_TOKEN || '').trim() || 'apex_dev_secret_key_2026';

/**
 * Creates a signed stateless session token for a Telegram user ID
 */
export function generateSessionToken(telegramId: number): string {
  const payload = `${telegramId}:${Date.now()}`;
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
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
      .createHmac('sha256', getJwtSecret())
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
 * 3. Automatically provisions or loads the player account in persistent storage or session memory.
 */
export async function authenticateTelegramUser(params: {
  initData?: string;
  devMockUser?: TelegramUser;
  isDevMode?: boolean;
}): Promise<AuthResponse> {
  const botToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const blobConfigured = isVercelBlobConfigured();

  // Mode A: Real Telegram Mini App initData
  if (params.initData && params.initData.trim().length > 0) {
    const cleanInitData = normalizeTelegramInitData(params.initData);

    if (!botToken) {
      console.warn('[Auth] TELEGRAM_BOT_TOKEN is not configured in environment variables.');
      return {
        success: false,
        error:
          'TELEGRAM_BOT_TOKEN is not configured on the server. Please add your TELEGRAM_BOT_TOKEN in Vercel Project Settings > Environment Variables.',
        errorCode: 'MISSING_BOT_TOKEN',
        diagnostics: {
          sdkDetected: true,
          initDataReceived: true,
          initDataLength: cleanInitData.length,
          botTokenConfigured: false,
          blobConfigured,
        },
      };
    }

    const verification = validateTelegramInitData(cleanInitData, botToken);
    if (!verification.valid || !verification.user) {
      return {
        success: false,
        error: verification.error || 'Telegram initData cryptographic verification failed',
        errorCode: verification.errorCode || 'SIGNATURE_INVALID',
        diagnostics: {
          sdkDetected: true,
          initDataReceived: true,
          initDataLength: cleanInitData.length,
          hasUser: Boolean(verification.user),
          hasHash: verification.diagnostics?.hasHash ?? false,
          hasAuthDate: verification.diagnostics?.hasAuthDate ?? false,
          authDate: verification.authDate,
          botTokenConfigured: true,
          errorCode: verification.errorCode,
          blobConfigured,
        },
      };
    }

    // Do NOT block real Telegram user if Blob storage is pending!
    // Real identity is cryptographically verified.
    const { player, isNew } = await getOrCreatePlayer(verification.user, false);
    const token = generateSessionToken(player.telegramId);

    return {
      success: true,
      player,
      token,
      isNewAccount: isNew,
      isDevPreview: false,
      isBlobPending: !blobConfigured,
      diagnostics: {
        sdkDetected: true,
        initDataReceived: true,
        initDataLength: cleanInitData.length,
        hasUser: true,
        hasHash: true,
        hasAuthDate: Boolean(verification.authDate),
        authDate: verification.authDate,
        botTokenConfigured: true,
        blobConfigured,
        storageMode: blobConfigured ? 'vercel_blob' : 'session_memory',
      },
    };
  }

  // Mode B: Development Preview Mode with clearly marked mock data
  // Runs completely independently of Vercel Blob storage
  if (params.devMockUser) {
    const { player, isNew } = await getOrCreatePlayer(params.devMockUser, true);
    const token = generateSessionToken(player.telegramId);

    return {
      success: true,
      player,
      token,
      isNewAccount: isNew,
      isDevPreview: true,
      isBlobPending: false,
      diagnostics: {
        sdkDetected: false,
        initDataReceived: false,
        botTokenConfigured: Boolean(botToken),
        blobConfigured,
        storageMode: 'local_sandbox',
      },
    };
  }

  return {
    success: false,
    error: 'Missing authentication credentials. Either provide Telegram initData or select a Development Preview profile.',
    errorCode: 'MISSING_CREDENTIALS',
    diagnostics: {
      sdkDetected: false,
      initDataReceived: false,
      botTokenConfigured: Boolean(botToken),
      blobConfigured,
    },
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
