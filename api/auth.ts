import type { IncomingMessage, ServerResponse } from 'http';
import { authenticateTelegramUser } from '../server/authService';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string>;
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
}

async function parseRequestBody(req: VercelRequest): Promise<any> {
  // If already parsed by middleware / framework
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return req.body;
      }
    }
    return req.body;
  }

  // Otherwise read incoming Node.js stream
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
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
      console.warn('[Vercel API /api/auth] Stream reading error:', err);
      resolve({});
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS and Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = await parseRequestBody(req);
    const { initData, devMockUser, isDevMode } = body || {};

    const result = await authenticateTelegramUser({
      initData,
      devMockUser,
      isDevMode,
    });

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Vercel API /api/auth] Unhandled error:', err);
    return res.status(500).json({
      success: false,
      error: `Authentication server error: ${message}`,
      errorCode: 'INTERNAL_SERVER_ERROR',
    });
  }
}
