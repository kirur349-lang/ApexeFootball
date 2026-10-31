import crypto from 'crypto';
import type { TelegramUser } from '../src/types/player.ts';

export interface TelegramAuthResult {
  valid: boolean;
  user?: TelegramUser;
  authDate?: number;
  error?: string;
  errorCode?: string;
  diagnostics?: {
    receivedKeys: string[];
    hasHash: boolean;
    hasUser: boolean;
    hasAuthDate: boolean;
    authDate?: number;
    currentTime: number;
    clockSkewSeconds?: number;
  };
}

/**
 * Normalizes the initData string by unwrapping URL hashes and tgWebAppData containers.
 */
export function normalizeTelegramInitData(raw: string): string {
  let str = (raw || '').trim();
  if (str.startsWith('#')) str = str.slice(1);
  if (str.startsWith('?')) str = str.slice(1);

  // If the payload was passed as a query container like "tgWebAppData=..."
  if (str.includes('tgWebAppData=')) {
    try {
      const search = new URLSearchParams(str);
      const data = search.get('tgWebAppData');
      if (data && data.trim().length > 0) {
        return data.trim();
      }
    } catch {
      // fallback to original string
    }
  }

  return str;
}

/**
 * Validates Telegram Mini App initData using HMAC-SHA256 algorithm specified by Telegram.
 * 
 * Official Telegram WebApp specification:
 * 1. Parse raw query string parameters.
 * 2. Extract and remove the 'hash' parameter.
 * 3. Sort remaining key-value pairs alphabetically by key.
 * 4. Build data_check_string with "key=value\n" (using decoded values).
 * 5. Compute secret_key = HMAC_SHA256("WebAppData", bot_token.trim()).
 * 6. Compute calculated_hash = HMAC_SHA256(secret_key, data_check_string).
 * 7. Securely compare calculated_hash with received hash using crypto.timingSafeEqual.
 * 8. Verify auth_date to prevent replay attacks (valid within 24 hours).
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string
): TelegramAuthResult {
  const currentTime = Math.floor(Date.now() / 1000);

  if (!initData || !initData.trim()) {
    return {
      valid: false,
      error: 'initData string is empty or missing. Please launch through your Telegram Bot.',
      errorCode: 'MISSING_INIT_DATA',
    };
  }

  const cleanToken = (botToken || '').trim();
  if (!cleanToken) {
    return {
      valid: false,
      error: 'TELEGRAM_BOT_TOKEN environment variable is not configured on the server.',
      errorCode: 'MISSING_BOT_TOKEN',
    };
  }

  try {
    const cleanInitData = normalizeTelegramInitData(initData);
    const params = new URLSearchParams(cleanInitData);
    const hash = params.get('hash');

    const receivedKeys = Array.from(new Set(params.keys()));
    const authDateStr = params.get('auth_date');
    const authDate = authDateStr ? parseInt(authDateStr, 10) : undefined;
    const hasUser = params.has('user');

    const diagnostics = {
      receivedKeys: receivedKeys.filter((k) => k !== 'hash'),
      hasHash: Boolean(hash),
      hasUser,
      hasAuthDate: Boolean(authDate),
      authDate,
      currentTime,
      clockSkewSeconds: authDate ? currentTime - authDate : undefined,
    };

    if (!hash) {
      return {
        valid: false,
        error: 'Cryptographic hash parameter is missing from initData payload.',
        errorCode: 'MISSING_HASH',
        diagnostics,
      };
    }

    params.delete('hash');

    // Sort parameters alphabetically by key
    const sortedKeys = Array.from(new Set(params.keys())).sort();
    const dataCheckString = sortedKeys
      .map((key) => `${key}=${params.get(key)}`)
      .join('\n');

    // Step 1: secret_key = HMAC_SHA256(key = "WebAppData", data = botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(cleanToken)
      .digest();

    // Step 2: calculated_hash = HMAC_SHA256(key = secretKey, data = dataCheckString)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    const hashBuffer = Buffer.from(hash, 'hex');
    const calculatedBuffer = Buffer.from(calculatedHash, 'hex');

    if (
      hashBuffer.length !== calculatedBuffer.length ||
      !crypto.timingSafeEqual(hashBuffer, calculatedBuffer)
    ) {
      return {
        valid: false,
        error:
          'HMAC-SHA256 signature verification failed. The Telegram Bot Token configured on Vercel does not match the bot that launched this Mini App, or the request was tampered with.',
        errorCode: 'SIGNATURE_MISMATCH',
        diagnostics,
      };
    }

    // Step 3: Check auth_date for replay attack prevention (allow up to 24 hours / 86400 seconds)
    if (authDate) {
      const maxAge = 86400; // 24 hours

      // Allow up to 300 seconds of future clock skew between Telegram servers and host
      if (authDate > currentTime + 300) {
        return {
          valid: false,
          error: 'Telegram auth_date timestamp is in the future. Please check system clock.',
          errorCode: 'CLOCK_SKEW_FUTURE',
          diagnostics,
        };
      }

      if (currentTime - authDate > maxAge) {
        return {
          valid: false,
          error: 'Telegram authentication session has expired (older than 24 hours). Please re-open the Mini App from your bot.',
          errorCode: 'AUTH_DATE_EXPIRED',
          diagnostics,
        };
      }
    }

    // Parse user object
    const userRaw = params.get('user');
    if (!userRaw) {
      return {
        valid: false,
        error: 'User data missing from Telegram initData payload.',
        errorCode: 'MISSING_USER_DATA',
        diagnostics,
      };
    }

    let user: TelegramUser;
    try {
      user = JSON.parse(userRaw);
    } catch {
      return {
        valid: false,
        error: 'Failed to parse Telegram user JSON data.',
        errorCode: 'MALFORMED_USER_JSON',
        diagnostics,
      };
    }

    if (!user || typeof user.id !== 'number') {
      return {
        valid: false,
        error: 'Invalid Telegram User ID in payload.',
        errorCode: 'INVALID_USER_ID',
        diagnostics,
      };
    }

    return {
      valid: true,
      user,
      authDate,
      diagnostics,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      error: `Failed to validate initData: ${message}`,
      errorCode: 'VALIDATION_EXCEPTION',
    };
  }
}
