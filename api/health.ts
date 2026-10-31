import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    status: 'ok',
    platform: 'Vercel Serverless',
    devPreviewReady: true,
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    vercelBlobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    blobStatus: process.env.BLOB_READ_WRITE_TOKEN ? 'configured' : 'pending_configuration',
    timestamp: new Date().toISOString(),
  });
}
