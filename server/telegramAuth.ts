import crypto from 'crypto';
import type { TelegramUser } from '../src/types/player.ts';

export interface TelegramAuthResult {
  valid: boolean;
  user?: TelegramUser;
  authDate?: number;
  error?: string;
}

/**
 * Validates Telegram Mini App initData using HMAC-SHA256 algorithm specified by Telegram.
 * 
 * 1. Parse query string parameters.
 * 2. Extract and remove the 'hash' parameter.
 * 3. Sort remaining key-value pairs alphabetically.
 * 4. Build data_check_string with "key=value\n".
 * 5. Compute secret_key = HMAC_SHA256("WebAppData", bot_token).
 * 6. Compute calculated_hash = HMAC_SHA256(secret_key, data_check_string).
 * 7. Compare calculated_hash with hash.
 * 8. Verify auth_date to prevent replay attacks (valid within 24 hours).
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string
): TelegramAuthResult {
  if (!initData) {
    return { valid: false, error: 'initData string is empty or missing' };
  }

  if (!botToken) {
    return { valid: false, error: 'TELEGRAM_BOT_TOKEN is not configured on the server' };
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return { valid: false, error: 'Hash parameter missing from initData' };
    }

    params.delete('hash');

    // Sort parameters alphabetically
    const sortedKeys = Array.from(params.keys()).sort();
    const dataCheckString = sortedKeys
      .map((key) => `${key}=${params.get(key)}`)
      .join('\n');

    // Step 1: secret_key = HMAC_SHA256(key = "WebAppData", data = botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Step 2: calculated_hash = HMAC_SHA256(key = secretKey, data = dataCheckString)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    const hashBuffer = Buffer.from(hash, 'hex');
    const calculatedBuffer = Buffer.from(calculatedHash, 'hex');

    if (hashBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(hashBuffer, calculatedBuffer)) {
      return { valid: false, error: 'HMAC signature verification failed. initData is invalid or tampered with.' };
    }

    // Step 3: Check auth_date for replay attack prevention (allow up to 24 hours / 86400 seconds)
    const authDateStr = params.get('auth_date');
    if (authDateStr) {
      const authDate = parseInt(authDateStr, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      const maxAge = 86400; // 24 hours

      if (currentTime - authDate > maxAge) {
        return { valid: false, error: 'initData has expired (older than 24 hours). Please re-open the Mini App.' };
      }
    }

    // Parse user object
    const userRaw = params.get('user');
    if (!userRaw) {
      return { valid: false, error: 'User data missing from initData payload' };
    }

    const user: TelegramUser = JSON.parse(userRaw);

    return {
      valid: true,
      user,
      authDate: authDateStr ? parseInt(authDateStr, 10) : undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { valid: false, error: `Failed to validate initData: ${message}` };
  }
}
