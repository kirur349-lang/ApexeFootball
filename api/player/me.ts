import type { IncomingMessage, ServerResponse } from 'http';
import { getCurrentPlayer } from '../../server/authService.ts';
import { savePlayer } from '../../server/storage.ts';

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

async function parseRequestBody(req: VercelRequest): Promise<any> {
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

  if (req.readableEnded || (req as any).complete) {
    return {};
  }

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
      if (!raw || !raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });

    req.on('error', () => {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimer);
      resolve({});
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS and Content-Type headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end('');
      return;
    }

    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : null;

    if (!token) {
      return sendJsonResponse(res, 401, { success: false, error: 'Authorization token required' });
    }

    const player = await getCurrentPlayer(token);
    if (!player) {
      return sendJsonResponse(res, 401, { success: false, error: 'Invalid or expired session token' });
    }

    // GET: Retrieve authenticated player profile
    if (req.method === 'GET') {
      return sendJsonResponse(res, 200, { success: true, player });
    }

    // PATCH: Update Apex-specific profile details
    if (req.method === 'PATCH') {
      const updates = (await parseRequestBody(req)) || {};

      if (updates.apexGamerTag && typeof updates.apexGamerTag === 'string') {
        player.apexGamerTag = updates.apexGamerTag.trim().slice(0, 30);
      }
      if (updates.konamiId && typeof updates.konamiId === 'string') {
        player.konamiId = updates.konamiId.trim().slice(0, 30);
      }

      player.lastActiveAt = new Date().toISOString();
      await savePlayer(player);

      return sendJsonResponse(res, 200, { success: true, player });
    }

    return sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Vercel API /api/player/me] Serverless handler error:', err);
    return sendJsonResponse(res, 500, { success: false, error: message });
  }
}
