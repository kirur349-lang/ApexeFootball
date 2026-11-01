import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  method?: string;
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
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    return sendJsonResponse(res, 200, {
      status: 'ok',
      platform: 'Vercel Serverless',
      devPreviewReady: true,
      telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      vercelBlobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      blobStatus: process.env.BLOB_READ_WRITE_TOKEN ? 'configured' : 'pending_configuration',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return sendJsonResponse(res, 500, {
      status: 'error',
      error: message,
    });
  }
}
