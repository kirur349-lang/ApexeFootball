import type { IncomingMessage, ServerResponse } from 'http';
import { authenticateTelegramUser } from '../server/authService.ts';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string>;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status?: (statusCode: number) => VercelResponse;
  json?: (data: any) => void;
  send?: (data: any) => void;
}

/**
 * Universal response helper compatible with both Vercel's enhanced ServerResponse
 * and standard Node.js http.ServerResponse, preventing runtime crashes.
 */
function sendJsonResponse(res: VercelResponse, statusCode: number, data: any): void {
  try {
    if (typeof res.status === 'function') {
      const chained = res.status(statusCode);
      if (chained && typeof chained.json === 'function') {
        chained.json(data);
        return;
      }
    }
  } catch {
    // Fall back to standard Node.js ServerResponse
  }

  res.statusCode = statusCode;
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json');
  }
  res.end(typeof data === 'string' ? data : JSON.stringify(data));
}

/**
 * Safe body parser that handles pre-parsed objects, strings, and incoming streams.
 * Crucially guards against hanging on streams that have already completed (readableEnded).
 */
async function parseRequestBody(req: VercelRequest): Promise<any> {
  // If already parsed by Vercel serverless layer or Express middleware
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      const trimmed = req.body.trim();
      if (!trimmed) return {};
      try {
        return JSON.parse(trimmed);
      } catch {
        return { raw: req.body };
      }
    }
    return req.body;
  }

  // If stream already ended and no body was provided
  if (req.readableEnded || (req as any).complete) {
    return {};
  }

  // Otherwise read incoming Node.js stream with safety timeout
  return new Promise((resolve) => {
    let raw = '';
    let settled = false;

    const safetyTimer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({});
      }
    }, 2000);

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      if (!raw || !raw.trim()) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({ raw });
      }
    });

    req.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      console.warn('[Vercel API /api/auth] Stream reading error:', err);
      resolve({});
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always wrap entire execution to prevent unhandled FUNCTION_INVOCATION_FAILED cold start or runtime crashes
  try {
    // Set CORS and Security headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end('');
      return;
    }

    if (req.method !== 'POST') {
      return sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed' });
    }

    const body = await parseRequestBody(req);
    const { initData, devMockUser, isDevMode } = body || {};

    const result = await authenticateTelegramUser({
      initData,
      devMockUser,
      isDevMode,
    });

    if (!result.success) {
      return sendJsonResponse(res, 401, result);
    }

    return sendJsonResponse(res, 200, result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Vercel API /api/auth] Unhandled serverless execution error:', err);

    return sendJsonResponse(res, 500, {
      success: false,
      error: `Authentication server error: ${message}`,
      errorCode: 'INTERNAL_SERVER_ERROR',
      diagnostics: {
        serverError: message,
        botTokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
        blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      },
    });
  }
}
