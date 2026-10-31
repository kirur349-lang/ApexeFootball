import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { authenticateTelegramUser, getCurrentPlayer } from './server/authService';
import { savePlayer } from './server/storage';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Routes
app.post(['/api/auth', '/.netlify/functions/auth'], async (req: Request, res: Response) => {
  try {
    const { initData, devMockUser, isDevMode } = req.body || {};
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
    return res.status(500).json({ success: false, error: message });
  }
});

app.get(['/api/player/me', '/.netlify/functions/player'], async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const player = await getCurrentPlayer(token);
    if (!player) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
    }

    return res.status(200).json({ success: true, player });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ success: false, error: message });
  }
});

app.patch(['/api/player/me', '/.netlify/functions/player'], async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const player = await getCurrentPlayer(token);
    if (!player) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
    }

    const updates = req.body || {};
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
    return res.status(500).json({ success: false, error: message });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  if (!isProd) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Apex eFootball] Server listening on http://0.0.0.0:${PORT} (env: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
