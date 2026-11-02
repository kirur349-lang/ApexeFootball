import type { IncomingMessage, ServerResponse } from 'http';
import { getCurrentPlayer } from '../../server/authService.ts';
import { registerPlayerForTournamentInFirestore } from '../../server/firebaseDb.ts';

interface VercelRequest extends IncomingMessage {
  body?: any;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status?: (statusCode: number) => VercelResponse;
  json?: (data: any) => void;
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
    // fallback
  }

  res.statusCode = statusCode;
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json');
  }
  res.end(JSON.stringify(data));
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
      if (!settled) {
        settled = true;
        clearTimeout(safetyTimer);
        try {
          resolve(raw.trim() ? JSON.parse(raw) : {});
        } catch {
          resolve({ raw });
        }
      }
    });

    req.on('error', () => {
      if (!settled) {
        settled = true;
        clearTimeout(safetyTimer);
        resolve({});
      }
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return sendJsonResponse(res, 204, {});
  }

  if (req.method !== 'POST') {
    return sendJsonResponse(res, 405, { error: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;

    if (!token) {
      return sendJsonResponse(res, 401, {
        success: false,
        error: 'Unauthorized. Please sign in via Telegram.',
      });
    }

    const player = await getCurrentPlayer(token);
    if (!player) {
      return sendJsonResponse(res, 401, {
        success: false,
        error: 'Invalid or expired session.',
      });
    }

    const body = await parseRequestBody(req);
    const { tournamentId, teamName } = body;

    if (!tournamentId) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: 'Missing required field: tournamentId',
      });
    }

    const result = await registerPlayerForTournamentInFirestore(tournamentId, {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName || ''}`.trim() || player.apexGamerTag,
      username: player.username || `user_${player.telegramId}`,
      teamName: teamName || 'Apex Contender',
      avatar: player.photoUrl,
    });

    if (!result.success) {
      return sendJsonResponse(res, 400, result);
    }

    return sendJsonResponse(res, 200, result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[API /tournaments/register] Error:', err);
    return sendJsonResponse(res, 500, {
      success: false,
      error: `Registration failed: ${msg}`,
    });
  }
}
