import type { IncomingMessage, ServerResponse } from 'http';
import { getCurrentPlayer } from '../../server/authService';
import { savePlayer } from '../../server/storage';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string>;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS and Content-Type headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authorization token required' });
  }

  const player = await getCurrentPlayer(token);
  if (!player) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
  }

  // GET: Retrieve authenticated player profile
  if (req.method === 'GET') {
    return res.status(200).json({ success: true, player });
  }

  // PATCH: Update Apex-specific profile details
  if (req.method === 'PATCH') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          // ignore
        }
      }

      const updates = body || {};

      if (updates.apexGamerTag && typeof updates.apexGamerTag === 'string') {
        player.apexGamerTag = updates.apexGamerTag.trim().slice(0, 30);
      }
      if (updates.konamiId && typeof updates.konamiId === 'string') {
        player.konamiId = updates.konamiId.trim().slice(0, 30);
      }

      player.lastActiveAt = new Date().toISOString();
      await savePlayer(player);

      return res.status(200).json({ success: true, player });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Vercel API /api/player/me] Update error:', err);
      return res.status(500).json({ success: false, error: message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method Not Allowed' });
}
