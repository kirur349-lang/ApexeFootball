import type { IncomingMessage, ServerResponse } from 'http';
import { getCurrentPlayer } from '../../server/authService.ts';
import { getCustomerCoinOrdersFromFirestore } from '../../server/firebaseDb.ts';

interface VercelRequest extends IncomingMessage {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return sendJsonResponse(res, 204, {});
  }

  if (req.method !== 'GET') {
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
        error: 'Unauthorized. Real Telegram authentication is required.',
      });
    }

    const player = await getCurrentPlayer(token);
    if (!player) {
      return sendJsonResponse(res, 401, {
        success: false,
        error: 'Invalid or expired session.',
      });
    }

    const orders = await getCustomerCoinOrdersFromFirestore(player.id);

    return sendJsonResponse(res, 200, {
      success: true,
      orders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[API /orders/my-orders] Error fetching orders:', err);
    return sendJsonResponse(res, 500, {
      success: false,
      error: `Failed to fetch orders: ${msg}`,
    });
  }
}
