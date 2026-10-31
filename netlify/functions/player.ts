import { getCurrentPlayer } from '../../server/authService';
import { savePlayer } from '../../server/storage';

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  headers: Record<string, string | undefined>;
}

export const handler = async (event: NetlifyEvent) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ success: false, error: 'Authorization token required' }),
    };
  }

  const player = await getCurrentPlayer(token);
  if (!player) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ success: false, error: 'Invalid or expired session token' }),
    };
  }

  // GET: Retrieve player
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, player }),
    };
  }

  // PATCH: Update Apex-specific profile details (gamerTag, konamiId)
  if (event.httpMethod === 'PATCH') {
    try {
      const updates = event.body ? JSON.parse(event.body) : {};

      if (updates.apexGamerTag && typeof updates.apexGamerTag === 'string') {
        player.apexGamerTag = updates.apexGamerTag.trim().slice(0, 30);
      }
      if (updates.konamiId && typeof updates.konamiId === 'string') {
        player.konamiId = updates.konamiId.trim().slice(0, 30);
      }

      player.lastActiveAt = new Date().toISOString();
      await savePlayer(player);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, player }),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: message }),
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
};
